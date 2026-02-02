// Link Analytics Constants

// Short URL configuration
export const SHORT_URL_DOMAIN = "aigl.ink";
export const SHORT_URL_BASE = `https://${SHORT_URL_DOMAIN}/r`;

// Short code generation
export const SHORT_CODE_LENGTH = 6;
export const SHORT_CODE_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Storage keys
export const STORAGE_KEYS = {
  SHORT_URLS: "aig-short-urls",
  CLICK_EVENTS: "aig-click-events",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SHORTEN: "/api/urls",
  REDIRECT: "/r",
  // Note: For analytics, use getAnalyticsEndpoint() helper instead
  ANALYTICS_BASE: "/api/urls",
} as const;

/**
 * Build the analytics API endpoint URL for a specific short code.
 * @param code - The short URL code
 * @param params - Optional query parameters (period, startDate, endDate, etc.)
 * @returns Full API URL string, e.g., "/api/urls/abc123/analytics?period=30d"
 */
export function getAnalyticsEndpoint(
  code: string,
  params?: Record<string, string | undefined>,
): string {
  const base = `/api/urls/${encodeURIComponent(code)}/analytics`;
  if (!params) return base;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

// Limits
export const MAX_URL_LENGTH = 2048;
export const MAX_TITLE_LENGTH = 100;
export const MAX_LOCAL_URLS = 50;
export const MAX_LOCAL_CLICKS = 1000;

// Analytics periods
export const ANALYTICS_PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
] as const;

// Re-export REFERRER_LABELS from shared for backward compatibility
export { REFERRER_LABELS } from "@/lib/shared/detection";
