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
