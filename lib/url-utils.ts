// Shared utilities for URL shortener and analytics
import crypto from "crypto";

// Re-export shared detection utilities for backward compatibility
// All detection logic lives in lib/shared/detection.ts
export {
  detectDeviceType,
  detectBrowser,
  detectOS,
  parseReferrer,
  isValidUrl,
  extractTitleFromUrl,
  normalizeUrl,
} from "@/lib/shared/detection";

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
// Referrer Utilities
// ============================================================================

/**
 * Parse referrer domain from full URL
 * @deprecated Use parseReferrer from @/lib/shared/detection instead
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
