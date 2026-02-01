// Shared utilities for URL shortener and analytics
import crypto from "crypto";

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Extract a reasonable title from a URL
 */
export function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const path = urlObj.pathname.replace(/\//g, " ").trim();
    if (path && path.length > 2) {
      return `${hostname} - ${path.substring(0, 30)}`;
    }
    return hostname;
  } catch {
    return "Untitled Link";
  }
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalize URL by adding protocol if missing
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

// ============================================================================
// Privacy Utilities
// ============================================================================

/**
 * Hash IP address for privacy (only store hash, not actual IP)
 */
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

// ============================================================================
// User Agent Detection
// ============================================================================

/**
 * Detect device type from user agent
 */
export function detectDeviceType(
  ua: string,
): "mobile" | "tablet" | "desktop" | null {
  if (!ua) return null;
  const lower = ua.toLowerCase();
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(lower)
  ) {
    return "mobile";
  }
  if (/tablet|ipad|android(?!.*mobile)|kindle|silk/i.test(lower)) {
    return "tablet";
  }
  return "desktop";
}

/**
 * Detect browser from user agent
 */
export function detectBrowser(ua: string): string | null {
  if (!ua) return null;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Opera/") || ua.includes("OPR/")) return "Opera";
  return "Other";
}

/**
 * Detect OS from user agent
 */
export function detectOS(ua: string): string | null {
  if (!ua) return null;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad"))
    return "iOS";
  return "Other";
}

// ============================================================================
// Referrer Utilities
// ============================================================================

/**
 * Parse referrer domain from full URL
 */
export function parseReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return url.hostname.replace("www.", "");
  } catch {
    return null;
  }
}

// ============================================================================
// Request Utilities
// ============================================================================

/**
 * Get client IP from request headers
 */
export function getClientIP(
  headers: Record<string, string | string[] | undefined>,
  socketAddress?: string,
): string {
  const forwarded = headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return socketAddress || "unknown";
}

/**
 * Get geo data from Vercel headers
 */
export function getGeoData(
  headers: Record<string, string | string[] | undefined>,
) {
  return {
    country: (headers["x-vercel-ip-country"] as string) || null,
    city: (headers["x-vercel-ip-city"] as string) || null,
    region: (headers["x-vercel-ip-country-region"] as string) || null,
  };
}

// ============================================================================
// IP Geolocation (Fallback for non-Vercel environments)
// ============================================================================

export interface GeoLocation {
  country: string | null;
  countryName: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Fetch geolocation data from ip-api.com (free tier: 45 req/min)
 * Use this as fallback when Vercel headers aren't available
 */
export async function fetchGeoLocation(ip: string): Promise<GeoLocation> {
  // Don't lookup private/local IPs
  if (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return {
      country: null,
      countryName: null,
      city: null,
      region: null,
      latitude: null,
      longitude: null,
    };
  }

  try {
    // ip-api.com free tier - no API key needed, 45 requests/minute limit
    // Using http (not https) as that's what free tier supports
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`,
      { signal: AbortSignal.timeout(2000) }, // 2s timeout
    );

    if (!response.ok) {
      return emptyGeoLocation();
    }

    const data = await response.json();

    if (data.status !== "success") {
      return emptyGeoLocation();
    }

    return {
      country: data.countryCode || null,
      countryName: data.country || null,
      city: data.city || null,
      region: data.regionName || null,
      latitude: data.lat || null,
      longitude: data.lon || null,
    };
  } catch (error) {
    // Silently fail - geo data is optional
    console.error("Geo lookup failed:", error);
    return emptyGeoLocation();
  }
}

function emptyGeoLocation(): GeoLocation {
  return {
    country: null,
    countryName: null,
    city: null,
    region: null,
    latitude: null,
    longitude: null,
  };
}

/**
 * Get geo data with ip-api.com fallback
 * First checks Vercel headers, falls back to API lookup
 */
export async function getGeoDataWithFallback(
  headers: Record<string, string | string[] | undefined>,
  ip: string,
): Promise<GeoLocation> {
  // First try Vercel headers (instant, no rate limit)
  const vercelGeo = getGeoData(headers);

  if (vercelGeo.country) {
    return {
      country: vercelGeo.country,
      countryName: null, // Vercel doesn't provide full name
      city: vercelGeo.city,
      region: vercelGeo.region,
      latitude: null,
      longitude: null,
    };
  }

  // Fallback to ip-api.com for local dev or non-Vercel hosting
  return fetchGeoLocation(ip);
}
