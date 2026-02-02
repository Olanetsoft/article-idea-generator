// Analytics Utility Functions
import { customAlphabet } from "nanoid";
import {
  SHORT_CODE_LENGTH,
  SHORT_CODE_ALPHABET,
  MOBILE_REGEX,
  TABLET_REGEX,
  REFERRER_LABELS,
  STORAGE_KEYS,
  MAX_LOCAL_URLS,
  MAX_LOCAL_CLICKS,
} from "./constants";
import type {
  ShortUrl,
  ClickEvent,
  LocalShortUrl,
  DeviceType,
  AnalyticsSummary,
  TimelinePoint,
  GeoData,
  DeviceData,
  ReferrerData,
} from "@/types/analytics";

// Generate a unique short code
const nanoid = customAlphabet(SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH);

export function generateShortCode(): string {
  return nanoid();
}

// Detect device type from user agent
export function detectDeviceType(userAgent: string): DeviceType {
  if (TABLET_REGEX.test(userAgent)) return "tablet";
  if (MOBILE_REGEX.test(userAgent)) return "mobile";
  return "desktop";
}

// Parse referrer URL to get domain
export function parseReferrer(referrer: string | null): string {
  if (!referrer) return "Direct";

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace("www.", "");
    return REFERRER_LABELS[hostname] || hostname;
  } catch {
    return "Unknown";
  }
}

// Parse UTM parameters from URL
export function parseUtmParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  try {
    const urlObj = new URL(url);
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    utmKeys.forEach((key) => {
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

// Browser detection from user agent
export function detectBrowser(userAgent: string): string {
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Edg")) return "Edge";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  return "Other";
}

// OS detection from user agent
// Note: iOS/iPhone/iPad checks must come BEFORE Mac OS check because
// iOS Safari includes "Mac OS" in its user agent string
export function detectOS(userAgent: string): string {
  if (userAgent.includes("Windows")) return "Windows";
  // Check iOS devices BEFORE Mac OS (iOS Safari UA contains "Mac OS")
  if (userAgent.includes("iPhone")) return "iOS";
  if (userAgent.includes("iPad")) return "iPadOS";
  if (userAgent.includes("iOS")) return "iOS";
  if (userAgent.includes("Mac OS")) return "macOS";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("Linux")) return "Linux";
  return "Other";
}

// Local Storage Helpers
export function getLocalShortUrls(): LocalShortUrl[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHORT_URLS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalShortUrl(shortUrl: LocalShortUrl): void {
  if (typeof window === "undefined") return;

  try {
    const urls = getLocalShortUrls();

    // Check if URL already exists
    const existingIndex = urls.findIndex((u) => u.code === shortUrl.code);
    if (existingIndex !== -1) {
      urls[existingIndex] = shortUrl;
    } else {
      urls.unshift(shortUrl);
    }

    // Limit stored URLs
    const trimmed = urls.slice(0, MAX_LOCAL_URLS);
    localStorage.setItem(STORAGE_KEYS.SHORT_URLS, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save short URL:", error);
  }
}

export function getLocalClickEvents(code: string): ClickEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CLICK_EVENTS);
    const allEvents: Record<string, ClickEvent[]> = stored
      ? JSON.parse(stored)
      : {};
    return allEvents[code] || [];
  } catch {
    return [];
  }
}

export function saveLocalClickEvent(code: string, event: ClickEvent): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CLICK_EVENTS);
    const allEvents: Record<string, ClickEvent[]> = stored
      ? JSON.parse(stored)
      : {};

    if (!allEvents[code]) {
      allEvents[code] = [];
    }

    allEvents[code].unshift(event);

    // Limit events per URL
    allEvents[code] = allEvents[code].slice(0, MAX_LOCAL_CLICKS);

    localStorage.setItem(STORAGE_KEYS.CLICK_EVENTS, JSON.stringify(allEvents));

    // Update click count on the URL
    const urls = getLocalShortUrls();
    const urlIndex = urls.findIndex((u) => u.code === code);
    if (urlIndex !== -1) {
      urls[urlIndex].clicks = (urls[urlIndex].clicks || 0) + 1;
      urls[urlIndex].lastClickAt = event.timestamp;
      localStorage.setItem(STORAGE_KEYS.SHORT_URLS, JSON.stringify(urls));
    }
  } catch (error) {
    console.error("Failed to save click event:", error);
  }
}

export function deleteLocalShortUrl(code: string): void {
  if (typeof window === "undefined") return;

  try {
    // Remove URL
    const urls = getLocalShortUrls().filter((u) => u.code !== code);
    localStorage.setItem(STORAGE_KEYS.SHORT_URLS, JSON.stringify(urls));

    // Remove associated click events
    const stored = localStorage.getItem(STORAGE_KEYS.CLICK_EVENTS);
    if (stored) {
      const allEvents: Record<string, ClickEvent[]> = JSON.parse(stored);
      delete allEvents[code];
      localStorage.setItem(
        STORAGE_KEYS.CLICK_EVENTS,
        JSON.stringify(allEvents),
      );
    }
  } catch (error) {
    console.error("Failed to delete short URL:", error);
  }
}

// Analytics Calculations
export function calculateAnalytics(events: ClickEvent[]): AnalyticsSummary {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count unique visitors by fingerprint or IP
  const uniqueVisitors = new Set(
    events.map((e) => e.fingerprint || e.ip || "unknown"),
  ).size;

  // Calculate period-specific clicks
  const clicksToday = events.filter(
    (e) => new Date(e.timestamp) >= oneDayAgo,
  ).length;

  const clicksLast7Days = events.filter(
    (e) => new Date(e.timestamp) >= sevenDaysAgo,
  ).length;

  const clicksLast30Days = events.filter(
    (e) => new Date(e.timestamp) >= thirtyDaysAgo,
  ).length;

  return {
    totalClicks: events.length,
    uniqueVisitors,
    clicksToday,
    clicksLast7Days,
    clicksLast30Days,
    averageClicksPerDay:
      events.length > 0 ? Math.round((clicksLast30Days / 30) * 100) / 100 : 0,
  };
}

export function generateTimeline(
  events: ClickEvent[],
  days: number = 7,
): TimelinePoint[] {
  const timeline: TimelinePoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayClicks = events.filter((e) => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= date && eventDate < nextDate;
    });

    timeline.push({
      date: date.toISOString().split("T")[0],
      clicks: dayClicks.length,
      uniqueVisitors: new Set(
        dayClicks.map((e) => e.fingerprint || e.ip || "unknown"),
      ).size,
    });
  }

  return timeline;
}

export function aggregateGeoData(events: ClickEvent[]): GeoData[] {
  const geoMap = new Map<string, number>();

  events.forEach((e) => {
    const country = e.country || "Unknown";
    geoMap.set(country, (geoMap.get(country) || 0) + 1);
  });

  return Array.from(geoMap.entries())
    .map(([country, clicks]) => ({
      country,
      clicks,
      percentage: Math.round((clicks / events.length) * 100),
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

export function aggregateDeviceData(events: ClickEvent[]): DeviceData[] {
  const deviceMap = new Map<string, { clicks: number; devices: Set<string> }>();

  events.forEach((e) => {
    const type = e.deviceType || "unknown";
    if (!deviceMap.has(type)) {
      deviceMap.set(type, { clicks: 0, devices: new Set() });
    }
    const data = deviceMap.get(type)!;
    data.clicks++;
    if (e.fingerprint) {
      data.devices.add(e.fingerprint);
    }
  });

  return Array.from(deviceMap.entries())
    .map(([type, data]) => ({
      type: type as DeviceType,
      clicks: data.clicks,
      uniqueDevices: data.devices.size,
      percentage: Math.round((data.clicks / events.length) * 100),
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

export function aggregateReferrerData(events: ClickEvent[]): ReferrerData[] {
  const referrerMap = new Map<string, number>();

  events.forEach((e) => {
    const source = e.referrer || "Direct";
    referrerMap.set(source, (referrerMap.get(source) || 0) + 1);
  });

  return Array.from(referrerMap.entries())
    .map(([source, clicks]) => ({
      source,
      clicks,
      percentage: Math.round((clicks / events.length) * 100),
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

// Format short URL for display
export function formatShortUrl(code: string, domain?: string): string {
  const baseDomain = domain || "aigl.ink";
  return `${baseDomain}/${code}`;
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Hash a string using SHA-256 (browser-compatible, async).
 * Returns first 16 characters of the hex hash for privacy-preserving storage.
 * Use this for hashing IP addresses before passing to fingerprint generation.
 */
export async function hashStringAsync(value: string): Promise<string> {
  // Use Web Crypto API for SHA-256 hashing (browser)
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(value);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 16);
  }

  // Fallback for Node.js environment (server-side)
  if (typeof require !== "undefined") {
    try {
      const crypto = require("crypto");
      return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex")
        .substring(0, 16);
    } catch {
      // Fallback to empty string if crypto unavailable
    }
  }

  // Last resort - return empty string (should not happen in practice)
  return "";
}

/**
 * Generate a privacy-preserving fingerprint using SHA-256.
 * This function is async and uses the Web Crypto API.
 * For server-side usage, use generateFingerprintSync with Node's crypto module.
 */
export async function generateFingerprint(
  userAgent: string,
  ip: string,
  acceptLanguage?: string,
): Promise<string> {
  const data = `${userAgent}|${ip}|${acceptLanguage || ""}`;

  // Use Web Crypto API for SHA-256 hashing
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 32);
  }

  // Fallback for Node.js environment (server-side)
  if (typeof require !== "undefined") {
    try {
      const crypto = require("crypto");
      return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex")
        .substring(0, 32);
    } catch {
      // If crypto module not available, use a deterministic fallback
    }
  }

  // Last resort fallback - should not normally be reached
  throw new Error(
    "No crypto implementation available for fingerprint generation",
  );
}

/**
 * Synchronous fingerprint generation for server-side usage (Node.js).
 * Uses Node's crypto module with SHA-256.
 */
export function generateFingerprintSync(
  userAgent: string,
  ip: string,
  acceptLanguage?: string,
): string {
  const data = `${userAgent}|${ip}|${acceptLanguage || ""}`;
  const crypto = require("crypto");
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .substring(0, 32);
}
