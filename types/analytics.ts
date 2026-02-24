// Link Analytics Types
// Used for URL shortener tracking and analytics

// Device type enum
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface ShortUrl {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  passwordHash?: string;

  // Aggregated stats
  totalClicks: number;
  uniqueClicks: number;
}

export interface ClickEvent {
  id: string;
  shortUrlId: string;
  timestamp: string;

  // Visitor info
  ip?: string;
  userAgent?: string;
  fingerprint?: string;

  // Geo data
  country?: string;
  countryName?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;

  // Device/Browser
  deviceType?: DeviceType;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;

  // Source
  referrer?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // QR vs Direct
  sourceType?: "direct" | "qr" | "api";
  qrScanLocation?: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  clicksToday: number;
  clicksLast7Days: number;
  clicksLast30Days: number;
  averageClicksPerDay: number;
}

export interface TimelinePoint {
  date: string;
  clicks: number;
  uniqueVisitors: number;
}

export interface GeoData {
  country: string;
  clicks: number;
  percentage: number;
}

export interface DeviceData {
  type: DeviceType;
  clicks: number;
  uniqueDevices: number;
  percentage: number;
}

export interface ReferrerData {
  source: string;
  clicks: number;
  percentage: number;
}

export interface HourlyData {
  hour: number;
  count: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  timeline: TimelinePoint[];
  geo: GeoData[];
  devices: DeviceData[];
  referrers: ReferrerData[];
  topHours: HourlyData[];
}

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "all";

// Local storage types for client-side tracking
export interface LocalShortUrl {
  id: string;
  code: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
  createdAt: string;
  clicks: number;
  lastClickAt?: string;
}
