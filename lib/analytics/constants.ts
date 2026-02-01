// Link Analytics Constants

// Short URL configuration
export const SHORT_URL_DOMAIN = "aig.link";
export const SHORT_URL_BASE = `https://${SHORT_URL_DOMAIN}`;

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
  ANALYTICS: "/api/urls/analytics",
} as const;

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

// Device type detection patterns
export const MOBILE_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
export const TABLET_REGEX = /iPad|Android(?!.*Mobile)|Tablet/i;

// Common referrer domains to label
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
