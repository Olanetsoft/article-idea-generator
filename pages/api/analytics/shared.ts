import { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";

interface ClickEvent {
  timestamp: string;
  country: string | null;
  country_name: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer_domain: string | null;
  source_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

// Helper function to group and count
function groupAndCount<T>(
  items: T[],
  keyFn: (item: T) => string | null | undefined,
): Array<{ name: string; count: number }> {
  const counts: Record<string, number> = {};

  items.forEach((item) => {
    const key = keyFn(item) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, period = "30d" } = req.query;

  if (typeof token !== "string") {
    return res.status(400).json({ error: "Invalid token" });
  }

  // Create a Supabase client (public access - no auth required)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = [];
          const cookieHeader = req.headers.cookie || "";
          cookieHeader.split(";").forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split("=");
            if (name) {
              cookies.push({ name, value: rest.join("=") });
            }
          });
          return cookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.setHeader(
              "Set-Cookie",
              `${name}=${value}; Path=${options?.path || "/"}; ${options?.httpOnly ? "HttpOnly;" : ""} ${options?.secure ? "Secure;" : ""} SameSite=${options?.sameSite || "Lax"}`,
            );
          });
        },
      },
    },
  );

  // Verify the share token
  const { data: shareToken, error: tokenError } = await supabase
    .from("analytics_share_tokens")
    .select(
      `
      token,
      expires_at,
      is_active,
      short_url_id
    `,
    )
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (tokenError || !shareToken) {
    return res.status(404).json({ error: "Invalid or expired share token" });
  }

  // Check expiration
  if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
    return res.status(410).json({ error: "This share link has expired" });
  }

  // Get the short URL data
  const { data: shortUrl, error: urlError } = await supabase
    .from("short_urls")
    .select(
      "id, code, original_url, title, created_at, total_clicks, unique_clicks",
    )
    .eq("id", shareToken.short_url_id)
    .single();

  if (urlError || !shortUrl) {
    return res.status(404).json({ error: "URL not found" });
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = new Date(0);
  }

  // Fetch click events
  let query = supabase
    .from("click_events")
    .select("*")
    .eq("short_url_id", shortUrl.id)
    .order("timestamp", { ascending: false });

  if (period !== "all") {
    query = query.gte("timestamp", startDate.toISOString());
  }

  const { data: clickEvents, error: clickError } = await query.limit(10000);

  if (clickError) {
    console.error("Error fetching clicks:", clickError);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }

  const events = (clickEvents || []) as ClickEvent[];

  // Process analytics data
  const countries = groupAndCount(events, (c) => c.country_name || c.country);
  const devices = groupAndCount(events, (c) => c.device_type);
  const browsers = groupAndCount(events, (c) => c.browser);
  const sources = groupAndCount(events, (c) => c.source_type);
  const referrers = groupAndCount(events, (c) => c.referrer_domain);
  const utmSources = groupAndCount(
    events.filter((c) => c.utm_source),
    (c) => c.utm_source,
  );
  const utmMediums = groupAndCount(
    events.filter((c) => c.utm_medium),
    (c) => c.utm_medium,
  );
  const utmCampaigns = groupAndCount(
    events.filter((c) => c.utm_campaign),
    (c) => c.utm_campaign,
  );

  // Timeline (daily aggregation)
  const timelineMap: Record<string, number> = {};
  events.forEach((c) => {
    const date = c.timestamp.split("T")[0];
    timelineMap[date] = (timelineMap[date] || 0) + 1;
  });
  const timeline = Object.entries(timelineMap)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Hourly distribution
  const hourlyClicks: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyClicks[i] = 0;
  events.forEach((c) => {
    const hour = new Date(c.timestamp).getHours();
    hourlyClicks[hour] = (hourlyClicks[hour] || 0) + 1;
  });
  const hourlyDistribution = Object.entries(hourlyClicks)
    .map(([hour, clicks]) => ({ hour: parseInt(hour), clicks }))
    .sort((a, b) => a.hour - b.hour);

  // QR scans
  const qrScans = events.filter((c) => c.source_type === "qr").length;

  return res.status(200).json({
    code: shortUrl.code,
    originalUrl: shortUrl.original_url,
    title: shortUrl.title,
    createdAt: shortUrl.created_at,
    totalClicks: shortUrl.total_clicks,
    uniqueClicks: shortUrl.unique_clicks,
    qrScans,
    countries,
    devices,
    browsers,
    sources,
    referrers,
    timeline,
    utmSources,
    utmMediums,
    utmCampaigns,
    hourlyDistribution,
  });
}
