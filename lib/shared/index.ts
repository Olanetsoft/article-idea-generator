/**
 * Shared Utilities Index
 *
 * Re-exports all shared utilities for easy importing.
 *
 * @module lib/shared
 */

// Detection utilities
export {
  detectDeviceType,
  detectBrowser,
  detectOS,
  parseReferrer,
  parseReferrerWithLabel,
  parseUtmParams,
  isValidUrl,
  extractTitleFromUrl,
  normalizeUrl,
  REFERRER_LABELS,
  type DeviceType,
  type UtmParams,
} from "./detection";
