import type { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/lib/supabase/server";
import type { InsertShortUrl, ShortUrl } from "@/types/database";
import { nanoid } from "nanoid";
import { extractTitleFromUrl, isValidUrl, getClientIP } from "@/lib/url-utils";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RateLimits,
} from "@/lib/rate-limit";

// Generate a short code
function generateShortCode(length: number = 6): string {
  return nanoid(length);
}

const SHORT_URL_BASE = "https://aigl.ink";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createApiClient(req, res);

  // Get current user (optional for POST, required for GET/DELETE)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // =========================================================================
  // POST: Create a new short URL (NO AUTH REQUIRED)
  // Anyone can create short URLs - auth is optional for associating with account
  // =========================================================================
  if (req.method === "POST") {
    // Rate limiting - 10 URLs per minute per IP
    const ip = getClientIP(
      req.headers as Record<string, string | string[] | undefined>,
      req.socket.remoteAddress,
    );
    const rateLimit = checkRateLimit(ip, RateLimits.createUrl);

    // Set rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimit);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    if (!rateLimit.success) {
      return res.status(429).json({
        error: "Too many URLs created. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const { originalUrl, title, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Generate unique code
    let code = generateShortCode();
    let attempts = 0;
    const maxAttempts = 5;

    // Make sure code is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("short_urls")
        .select("id")
        .eq("code", code)
        .single();

      if (!existing) break;
      code = generateShortCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: "Failed to generate unique code" });
    }

    const newUrl: InsertShortUrl = {
      code,
      original_url: originalUrl,
      title: title || extractTitleFromUrl(originalUrl),
      user_id: user?.id || null, // Associate with user if logged in
      expires_at: expiresAt || null,
    };

    const { data, error } = await supabase
      .from("short_urls")
      .insert(newUrl as any)
      .select()
      .single<ShortUrl>();

    if (error) {
      console.error("Error creating short URL:", error);
      return res.status(500).json({ error: "Failed to create short URL" });
    }

    if (!data) {
      return res.status(500).json({ error: "Failed to create short URL" });
    }

    return res.status(201).json({
      id: data.id,
      code: data.code,
      shortUrl: `${SHORT_URL_BASE}/${data.code}`,
      originalUrl: data.original_url,
      title: data.title,
      createdAt: data.created_at,
    });
  }

  // =========================================================================
  // GET: List user's URLs (AUTH REQUIRED - analytics feature)
  // Only authenticated users can view their link history
  // =========================================================================
  if (req.method === "GET") {
    if (!user) {
      return res.status(401).json({
        error: "Sign in to view your link history and analytics",
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from("short_urls")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .returns<ShortUrl[]>();

    if (error) {
      console.error("Error fetching URLs:", error);
      return res.status(500).json({ error: "Failed to fetch URLs" });
    }

    return res.status(200).json({
      urls: (data || []).map((url) => ({
        id: url.id,
        code: url.code,
        shortUrl: `${SHORT_URL_BASE}/${url.code}`,
        originalUrl: url.original_url,
        title: url.title,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
        isActive: url.is_active,
        totalClicks: url.total_clicks,
        uniqueClicks: url.unique_clicks,
      })),
      total: count,
    });
  }

  // =========================================================================
  // DELETE: Delete a URL (AUTH REQUIRED - must own the URL)
  // =========================================================================
  if (req.method === "DELETE") {
    // Delete a URL
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "URL ID is required" });
    }

    const { error } = await supabase
      .from("short_urls")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting URL:", error);
      return res.status(500).json({ error: "Failed to delete URL" });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
