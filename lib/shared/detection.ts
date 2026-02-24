/**
 * Shared User Agent Detection Utilities
 *
 * This module provides a single source of truth for device, browser, and OS detection.
 * All other modules should import from here to avoid duplication.
 *
 * @module lib/shared/detection
 */

// ============================================================================
// Types
// ============================================================================

export type DeviceType = "mobile" | "tablet" | "desktop";

// ============================================================================
// Detection Patterns
// ============================================================================

// Note: iPad is NOT in MOBILE_PATTERN - it should match TABLET_PATTERN
// The tablet check must run BEFORE mobile check in detectDeviceType
const MOBILE_PATTERN =
  /mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i;
const TABLET_PATTERN = /tablet|ipad|android(?!.*mobile)|kindle|silk/i;

// ============================================================================
// Device Detection
// ============================================================================

/**
 * Detect device type from user agent string.
 *
 * Note: Tablet check runs BEFORE mobile check to correctly classify iPads
 * and Android tablets (whose UAs often contain "Mobile").
 *
 * @param ua - User agent string
 * @returns Device type or undefined if UA is empty
 */
export function detectDeviceType(ua: string): DeviceType | undefined {
  if (!ua) return undefined;
  const lower = ua.toLowerCase();

  // Check tablet FIRST (iPad, Android tablets, Kindle, etc.)
  if (TABLET_PATTERN.test(lower)) {
    return "tablet";
  }

  // Then check mobile (phones)
  if (MOBILE_PATTERN.test(lower)) {
    return "mobile";
  }

  return "desktop";
}

// ============================================================================
// Browser Detection
// ============================================================================

/**
 * Detect browser from user agent string.
 *
 * Order matters: Edge contains "Chrome", Safari detection excludes Chrome.
 *
 * @param ua - User agent string
 * @returns Browser name or undefined if UA is empty
 */
export function detectBrowser(ua: string): string | undefined {
  if (!ua) return undefined;

  // Check Edge before Chrome (Edge UA contains "Chrome")
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Opera/") || ua.includes("OPR/")) return "Opera";

  return "Other";
}

// ============================================================================
// OS Detection
// ============================================================================

/**
 * Detect operating system from user agent string.
 *
 * IMPORTANT: iOS/iPhone/iPad checks must come BEFORE Mac OS check because
 * iOS Safari user agents include "Mac OS" in their string.
 *
 * @param ua - User agent string
 * @returns OS name or undefined if UA is empty
 */
export function detectOS(ua: string): string | undefined {
  if (!ua) return undefined;

  // Check iOS devices FIRST (iOS Safari UA contains "Mac OS")
  if (ua.includes("iPhone")) return "iOS";
  if (ua.includes("iPad")) return "iPadOS";
  if (ua.includes("iOS")) return "iOS";

  // Then check other operating systems
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";

  return "Other";
}

// ============================================================================
// Referrer Parsing
// ============================================================================

/**
 * Common referrer domains mapped to readable labels.
 */
export const REFERRER_LABELS: Record<string, string> = {
  "t.co": "Twitter/X",
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "facebook.com": "Facebook",
  "fb.me": "Facebook",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "instagram.com": "Instagram",
  "reddit.com": "Reddit",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "tiktok.com": "TikTok",
  "pinterest.com": "Pinterest",
  "whatsapp.com": "WhatsApp",
  "telegram.org": "Telegram",
  "discord.com": "Discord",
  "github.com": "GitHub",
  "medium.com": "Medium",
  "dev.to": "Dev.to",
  "hashnode.com": "Hashnode",
};

/**
 * Parse referrer URL to extract domain.
 *
 * @param referrer - Full referrer URL or null
 * @returns Domain without www prefix, or undefined if invalid/empty
 */
export function parseReferrer(referrer: string | null): string | undefined {
  if (!referrer) return undefined;

  try {
    const url = new URL(referrer);
    return url.hostname.replace("www.", "");
  } catch {
    return undefined;
  }
}

/**
 * Parse referrer URL with label lookup.
 *
 * @param referrer - Full referrer URL or null
 * @returns Friendly label (e.g., "Twitter/X") or domain, or "Direct" if no referrer
 */
export function parseReferrerWithLabel(referrer: string | null): string {
  if (!referrer) return "Direct";

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace("www.", "");
    return REFERRER_LABELS[hostname] || hostname;
  } catch {
    return "Unknown";
  }
}

// ============================================================================
// UTM Parameter Parsing
// ============================================================================

/**
 * UTM parameter keys to extract.
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/**
 * Parse UTM parameters from a URL.
 *
 * @param url - Full URL string
 * @returns Object containing any present UTM parameters
 */
export function parseUtmParams(url: string): UtmParams {
  const params: UtmParams = {};

  try {
    const urlObj = new URL(url);
    UTM_KEYS.forEach((key) => {
      const value = urlObj.searchParams.get(key);
      if (value) {
        params[key] = value;
      }
    });
  } catch {
    // Invalid URL, return empty params
  }

  return params;
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Validate if a string is a valid HTTP/HTTPS URL.
 *
 * @param url - String to validate
 * @returns True if valid HTTP(S) URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extract a reasonable title from a URL.
 *
 * @param url - URL to extract title from
 * @returns Human-readable title derived from hostname and path
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
 * Normalize URL by adding protocol if missing.
 *
 * @param url - URL string (may be missing protocol)
 * @returns URL with https:// prefix
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}
