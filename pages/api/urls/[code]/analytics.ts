import type { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/lib/supabase/server";

// Helper to group and count items
function groupAndCount<T>(
  items: T[],
  keyFn: (item: T) => string | null,
  defaultKey = "Unknown",
): Array<{ name: string; count: number }> {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const key = keyFn(item) || defaultKey;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Type for the short URL data we need
interface ShortUrlData {
  id: string;
  user_id: string | null;
  code: string;
  original_url: string;
  title: string | null;
  created_at: string;
  total_clicks: number;
  unique_clicks: number;
}

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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createApiClient(req, res);
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "URL code is required" });
  }

  // Get the short URL
  const { data: shortUrl, error: urlError } = await supabase
    .from("short_urls")
    .select(
      "id, user_id, code, original_url, title, created_at, total_clicks, unique_clicks",
    )
    .eq("code", code)
    .single<ShortUrlData>();

  if (urlError || !shortUrl) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  // Check if user owns this URL
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user && shortUrl.user_id === user.id;

  // Basic stats - available to URL owner only
  // (Public stats would be a privacy concern)
  if (!isOwner) {
    return res.status(401).json({
      error: "Sign in to view analytics for your links",
      code: shortUrl.code,
    });
  }

  // Get detailed analytics for owner
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get click events
  const { data: clicks, error: clicksError } = await supabase
    .from("click_events")
    .select("*")
    .eq("short_url_id", shortUrl.id)
    .gte("timestamp", last30Days.toISOString())
    .order("timestamp", { ascending: false })
    .returns<ClickEvent[]>();

  if (clicksError) {
    console.error("Error fetching clicks:", clicksError);
  }

  const clickEvents: ClickEvent[] = clicks || [];

  // Calculate time-based statistics
  const clicksToday = clickEvents.filter(
    (c) => new Date(c.timestamp) >= today,
  ).length;
  const clicksLast7Days = clickEvents.filter(
    (c) => new Date(c.timestamp) >= last7Days,
  ).length;

  // Use helper for grouping
  const topCountries = groupAndCount(clickEvents, (c) => c.country).slice(
    0,
    10,
  );
  const deviceBreakdown = groupAndCount(
    clickEvents,
    (c) => c.device_type,
    "unknown",
  );
  const browserBreakdown = groupAndCount(clickEvents, (c) => c.browser);
  const sourceBreakdown = groupAndCount(
    clickEvents,
    (c) => c.source_type,
    "direct",
  );
  const topReferrers = groupAndCount(
    clickEvents,
    (c) => c.referrer_domain,
    "Direct",
  ).slice(0, 10);

  // Clicks by day (last 30 days)
  const clicksByDay: Record<string, number> = {};
  clickEvents.forEach((c) => {
    const day = new Date(c.timestamp).toISOString().split("T")[0];
    clicksByDay[day] = (clicksByDay[day] || 0) + 1;
  });
  const timeline = Object.entries(clicksByDay)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Recent clicks
  const recentClicks = clickEvents.slice(0, 20).map((c) => ({
    timestamp: c.timestamp,
    country: c.country,
    city: c.city,
    deviceType: c.device_type,
    browser: c.browser,
    os: c.os,
    referrer: c.referrer_domain,
    sourceType: c.source_type,
  }));

  return res.status(200).json({
    code: shortUrl.code,
    originalUrl: shortUrl.original_url,
    title: shortUrl.title,
    createdAt: shortUrl.created_at,
    totalClicks: shortUrl.total_clicks,
    uniqueClicks: shortUrl.unique_clicks,
    analytics: {
      clicksToday,
      clicksLast7Days,
      clicksLast30Days: clickEvents.length,
      topCountries,
      deviceBreakdown,
      browserBreakdown,
      sourceBreakdown,
      topReferrers,
      timeline,
      recentClicks,
    },
  });
}
