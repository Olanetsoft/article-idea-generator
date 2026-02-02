// Client-side analytics utilities for URL shortener
// Used for localStorage-based tracking (fallback when Supabase is not available)

import type { LocalShortUrl, ClickEvent } from "@/types/analytics";

// Re-export shared detection utilities for backward compatibility
// All detection logic lives in lib/shared/detection.ts
export {
  detectDeviceType,
  detectBrowser,
  detectOS,
  parseReferrer,
  parseUtmParams,
  isValidUrl,
  extractTitleFromUrl,
} from "@/lib/shared/detection";

// ============================================================================
// Constants
// Unified with lib/analytics/constants.ts to prevent localStorage conflicts
// ============================================================================

export const SHORT_URL_BASE = "https://aigl.ink/r";
// Use same keys as lib/analytics/constants.ts STORAGE_KEYS
const LOCAL_URLS_KEY = "aig-short-urls";
const LOCAL_CLICKS_KEY = "aig-click-events";

// ============================================================================
// Short Code Generation
// ============================================================================

/**
 * Generate a random short code
 */
export function generateShortCode(length: number = 6): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// Local Storage - Short URLs
// ============================================================================

/**
 * Get all locally stored short URLs
 */
export function getLocalShortUrls(): LocalShortUrl[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_URLS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new short URL to local storage
 */
export function saveLocalShortUrl(url: LocalShortUrl): void {
  if (typeof window === "undefined") return;
  try {
    const urls = getLocalShortUrls();
    // Check if code already exists
    const existingIndex = urls.findIndex((u) => u.code === url.code);
    if (existingIndex >= 0) {
      urls[existingIndex] = url;
    } else {
      urls.unshift(url);
    }
    // Keep only last 50 URLs
    const trimmed = urls.slice(0, 50);
    localStorage.setItem(LOCAL_URLS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Error saving short URL to localStorage:", error);
  }
}

/**
 * Delete a short URL from local storage
 */
export function deleteLocalShortUrl(code: string): void {
  if (typeof window === "undefined") return;
  try {
    const urls = getLocalShortUrls();
    const filtered = urls.filter((u) => u.code !== code);
    localStorage.setItem(LOCAL_URLS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting short URL from localStorage:", error);
  }
}

/**
 * Update click count for a local short URL
 */
export function incrementLocalClickCount(code: string): void {
  if (typeof window === "undefined") return;
  try {
    const urls = getLocalShortUrls();
    const url = urls.find((u) => u.code === code);
    if (url) {
      url.clicks = (url.clicks || 0) + 1;
      url.lastClickAt = new Date().toISOString();
      localStorage.setItem(LOCAL_URLS_KEY, JSON.stringify(urls));
    }
  } catch (error) {
    console.error("Error updating click count:", error);
  }
}

// ============================================================================
// Local Storage - Click Events
// ============================================================================

/**
 * Get click events for a specific short URL
 */
export function getLocalClickEvents(code: string): ClickEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`${LOCAL_CLICKS_KEY}_${code}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a click event to local storage
 */
export function saveLocalClickEvent(code: string, event: ClickEvent): void {
  if (typeof window === "undefined") return;
  try {
    const events = getLocalClickEvents(code);
    events.unshift(event);
    // Keep only last 100 events per URL
    const trimmed = events.slice(0, 100);
    localStorage.setItem(
      `${LOCAL_CLICKS_KEY}_${code}`,
      JSON.stringify(trimmed),
    );
    // Also increment click count
    incrementLocalClickCount(code);
  } catch (error) {
    console.error("Error saving click event to localStorage:", error);
  }
}

// ============================================================================
// Fingerprinting (Privacy-Friendly)
// Note: For SHA-256 based fingerprinting, use generateFingerprint from
// @/lib/analytics/utils which uses Web Crypto API
// ============================================================================

/**
 * Generate a simple fingerprint for unique visitor tracking (legacy sync version)
 * @deprecated Use generateFingerprint from @/lib/analytics/utils for SHA-256
 */
export function generateFingerprint(
  userAgent: string,
  ip: string,
  language: string,
): string {
  // Simple hash of available data
  const data = `${userAgent}-${ip}-${language}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============================================================================
// URL Utilities
// ============================================================================

// Import extractTitleFromUrl from shared to use in createTrackedShortUrl
import { extractTitleFromUrl as _extractTitleFromUrl } from "@/lib/shared/detection";

/**
 * Create a tracked short URL (for localStorage-based URLs)
 */
export function createTrackedShortUrl(originalUrl: string): LocalShortUrl {
  const code = generateShortCode();
  const shortUrl: LocalShortUrl = {
    id: `local_${code}`,
    code,
    shortUrl: `${SHORT_URL_BASE}/${code}`,
    originalUrl,
    title: _extractTitleFromUrl(originalUrl),
    createdAt: new Date().toISOString(),
    clicks: 0,
  };
  saveLocalShortUrl(shortUrl);
  return shortUrl;
}
