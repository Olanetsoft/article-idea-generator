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
 * Check if an IP is in the RFC1918 172.16.0.0/12 private range (172.16.0.0 - 172.31.255.255)
 */
function isPrivate172Range(ip: string): boolean {
  if (!ip.startsWith("172.")) return false;
  const octets = ip.split(".");
  if (octets.length !== 4) return false;
  const secondOctet = parseInt(octets[1], 10);
  return secondOctet >= 16 && secondOctet <= 31;
}

/**
 * Fetch geolocation data from a geo-IP provider
 * Use this as fallback when Vercel headers aren't available
 *
 * Privacy note: By default, uses HTTPS providers. Set ENABLE_PLAINTEXT_GEOIP=true
 * to allow unencrypted ip-api.com fallback (not recommended in production).
 * Configure GEOIP_PROVIDER_URL to use a custom HTTPS geo-IP provider.
 */
export async function fetchGeoLocation(ip: string): Promise<GeoLocation> {
  // Don't lookup private/local IPs (RFC1918 ranges)
  if (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    isPrivate172Range(ip)
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
    // Determine geo-IP provider URL
    // Priority: 1) Custom GEOIP_PROVIDER_URL, 2) HTTPS provider, 3) HTTP fallback if explicitly enabled
    // PRIVACY: User IPs are sent to the geo provider. Use HTTPS to protect in transit.
    // Set GEOIP_PROVIDER_URL for a custom provider, or ENABLE_PLAINTEXT_GEOIP=true for unencrypted fallback.
    let geoUrl: string;
    const customProvider = process.env.GEOIP_PROVIDER_URL;
    const allowPlaintext = process.env.ENABLE_PLAINTEXT_GEOIP === "true";

    if (customProvider) {
      // Use custom provider URL (should include {ip} placeholder)
      geoUrl = customProvider.replace("{ip}", ip);
    } else if (allowPlaintext) {
      // Explicit opt-in for unencrypted ip-api.com (free tier, HTTP only)
      geoUrl = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`;
    } else {
      // Default: Use ipapi.co (HTTPS, free tier: 1000 req/day)
      geoUrl = `https://ipapi.co/${ip}/json/`;
    }

    const response = await fetch(
      geoUrl,
      { signal: AbortSignal.timeout(2000) }, // 2s timeout
    );

    if (!response.ok) {
      return emptyGeoLocation();
    }

    const data = await response.json();

    // Handle error responses from different providers
    if (data.status === "fail" || data.error) {
      return emptyGeoLocation();
    }

    // Normalize response fields (ip-api.com vs ipapi.co vs custom)
    return {
      country: data.countryCode || data.country_code || data.country || null,
      countryName: data.country || data.country_name || null,
      city: data.city || null,
      region: data.regionName || data.region || null,
      latitude: data.lat || data.latitude || null,
      longitude: data.lon || data.longitude || null,
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
