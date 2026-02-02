import type { NextApiRequest, NextApiResponse } from "next";
import {
  createApiClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import type { InsertClickEvent } from "@/types/database";
import {
  hashIP,
  detectDeviceType,
  detectBrowser,
  detectOS,
  parseReferrerDomain,
  getClientIP,
  getGeoDataWithFallback,
} from "@/lib/url-utils";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RateLimits,
} from "@/lib/rate-limit";

// Type for short URL query result
interface ShortUrlTrackData {
  id: string;
  original_url: string;
  is_active: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Track endpoint - NO AUTH REQUIRED
  // Anyone can track clicks on URLs (this enables analytics for all URLs)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting - 100 requests per minute per IP
  const ip = getClientIP(
    req.headers as Record<string, string | string[] | undefined>,
    req.socket.remoteAddress,
  );
  const rateLimit = checkRateLimit(ip, RateLimits.track);

  // Set rate limit headers
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!rateLimit.success) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
    });
  }

  const supabase = createApiClient(req, res);

  const {
    code,
    fingerprint,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    sourceType,
  } = req.body;

  if (!code) {
    return res.status(400).json({ error: "URL code is required" });
  }

  // Get the short URL
  const { data: shortUrl, error: urlError } = await supabase
    .from("short_urls")
    .select("id, original_url, is_active")
    .eq("code", code)
    .single<ShortUrlTrackData>();

  if (urlError || !shortUrl) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  if (!shortUrl.is_active) {
    return res.status(410).json({ error: "Short URL is no longer active" });
  }

  // Get request info using shared utilities (reuse ip from rate limiting)
  const userAgent = (req.headers["user-agent"] as string) || "";
  const requestReferrer = (req.headers.referer as string) || referrer || null;

  // Get geo data with ip-api.com fallback for local dev
  const geo = await getGeoDataWithFallback(
    req.headers as Record<string, string | string[] | undefined>,
    ip,
  );

  // Compute IP hash and use fingerprint or IP hash for uniqueness
  const ipHash = hashIP(ip);
  const fingerprintToCheck = fingerprint || ipHash;

  // Check if this is a unique click (by fingerprint/IP hash in last 24 hours)
  let isUnique = true;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existingClicks } = await supabase
    .from("click_events")
    .select("id")
    .eq("short_url_id", shortUrl.id)
    .eq("fingerprint", fingerprintToCheck)
    .gte("timestamp", oneDayAgo)
    .limit(1);

  isUnique = !existingClicks || existingClicks.length === 0;

  // Create click event
  const clickEvent: InsertClickEvent = {
    short_url_id: shortUrl.id,
    ip_hash: ipHash,
    user_agent: userAgent.substring(0, 500),
    fingerprint: fingerprintToCheck,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    device_type: detectDeviceType(userAgent),
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    referrer: requestReferrer,
    referrer_domain: parseReferrerDomain(requestReferrer),
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
    source_type: sourceType || "direct",
  };

  const { error: insertError } = await supabase
    .from("click_events")
    .insert(clickEvent as any);

  if (insertError) {
    console.error("Error tracking click:", insertError);
    // Don't fail - tracking errors shouldn't break redirects
  }

  // Increment click counts using service role client (required for service_role-only function)
  try {
    const serviceClient = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (serviceClient.rpc as any)("increment_click_count", {
      url_id: shortUrl.id,
      is_unique: isUnique,
    });
  } catch (rpcError) {
    console.error("Error incrementing click count:", rpcError);
    // Don't fail - count errors shouldn't break tracking
  }

  return res.status(200).json({
    originalUrl: shortUrl.original_url,
    tracked: !insertError,
  });
}
