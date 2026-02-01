import type { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/lib/supabase/server";
import { getClientIP } from "@/lib/url-utils";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RateLimits,
} from "@/lib/rate-limit";

// Type for click events
interface ClickEvent {
  id: string;
  short_url_id: string;
  timestamp: string;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  referrer_domain: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  source_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

// Type for short URL data
interface ShortUrlData {
  id: string;
  user_id: string | null;
  code: string;
  original_url: string;
  title: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting - 5 exports per minute per IP
  const ip = getClientIP(
    req.headers as Record<string, string | string[] | undefined>,
    req.socket.remoteAddress,
  );
  const rateLimit = checkRateLimit(ip, RateLimits.export);

  // Set rate limit headers
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!rateLimit.success) {
    return res.status(429).json({
      error: "Too many export requests. Please try again later.",
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
    });
  }

  const supabase = createApiClient(req, res);
  const { code, format = "csv", period = "30d" } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "URL code is required" });
  }

  // Get the short URL
  const { data: shortUrl, error: urlError } = await supabase
    .from("short_urls")
    .select("id, user_id, code, original_url, title")
    .eq("code", code)
    .single<ShortUrlData>();

  if (urlError || !shortUrl) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  // Check if user owns this URL
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || shortUrl.user_id !== user.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "all":
      startDate = new Date(0);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get click events
  const { data: clicks, error: clicksError } = await supabase
    .from("click_events")
    .select("*")
    .eq("short_url_id", shortUrl.id)
    .gte("timestamp", startDate.toISOString())
    .order("timestamp", { ascending: false })
    .returns<ClickEvent[]>();

  if (clicksError) {
    console.error("Error fetching clicks:", clicksError);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }

  const clickEvents = clicks || [];

  // Format data for export
  const exportData = clickEvents.map((click) => ({
    timestamp: click.timestamp,
    country: click.country || "Unknown",
    city: click.city || "Unknown",
    device: click.device_type || "Unknown",
    browser: click.browser || "Unknown",
    os: click.os || "Unknown",
    referrer: click.referrer_domain || "Direct",
    source: click.source_type || "direct",
    utm_source: click.utm_source || "",
    utm_medium: click.utm_medium || "",
    utm_campaign: click.utm_campaign || "",
  }));

  // Return based on format
  if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${code}-${period}.json"`,
    );
    return res.status(200).json({
      shortUrl: {
        code: shortUrl.code,
        originalUrl: shortUrl.original_url,
        title: shortUrl.title,
      },
      period,
      exportedAt: new Date().toISOString(),
      totalClicks: exportData.length,
      clicks: exportData,
    });
  }

  // CSV injection protection - escape formula characters
  const escapeCsvValue = (value: string): string => {
    if (!value) return "";
    // Escape values starting with =, +, -, @ to prevent formula injection
    if (/^[=+\-@]/.test(value)) {
      return `'${value}`;
    }
    // Escape quotes
    return value.replace(/"/g, '""');
  };

  // Default to CSV
  const headers = [
    "Timestamp",
    "Country",
    "City",
    "Device",
    "Browser",
    "OS",
    "Referrer",
    "Source",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
  ];

  const csvRows = [
    headers.join(","),
    ...exportData.map((row) =>
      [
        `"${escapeCsvValue(row.timestamp)}"`,
        `"${escapeCsvValue(row.country)}"`,
        `"${escapeCsvValue(row.city)}"`,
        `"${escapeCsvValue(row.device)}"`,
        `"${escapeCsvValue(row.browser)}"`,
        `"${escapeCsvValue(row.os)}"`,
        `"${escapeCsvValue(row.referrer)}"`,
        `"${escapeCsvValue(row.source)}"`,
        `"${escapeCsvValue(row.utm_source)}"`,
        `"${escapeCsvValue(row.utm_medium)}"`,
        `"${escapeCsvValue(row.utm_campaign)}"`,
      ].join(","),
    ),
  ];

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="analytics-${code}-${period}.csv"`,
  );
  return res.status(200).send(csvRows.join("\n"));
}
