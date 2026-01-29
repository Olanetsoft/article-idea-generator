import type { QRContentType, QRStyleSettings } from "@/types/qr-code";

// ============================================================================
// Constants
// ============================================================================

export const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

// QR Content Type Config
export const QR_TYPES: {
  id: QRContentType;
  icon: string;
  category?: "basic" | "social" | "payment";
}[] = [
  // Basic types
  { id: "url", icon: "🔗", category: "basic" },
  { id: "text", icon: "📝", category: "basic" },
  { id: "wifi", icon: "📶", category: "basic" },
  { id: "vcard", icon: "👤", category: "basic" },
  { id: "email", icon: "✉️", category: "basic" },
  { id: "phone", icon: "📞", category: "basic" },
  { id: "sms", icon: "💬", category: "basic" },
  { id: "location", icon: "📍", category: "basic" },
  { id: "event", icon: "📅", category: "basic" },
  // Social types
  { id: "twitter", icon: "🐦", category: "social" },
  { id: "youtube", icon: "▶️", category: "social" },
  { id: "facebook", icon: "👍", category: "social" },
  { id: "appstore", icon: "📱", category: "social" },
  // Payment types
  { id: "bitcoin", icon: "₿", category: "payment" },
  { id: "ethereum", icon: "⟠", category: "payment" },
  { id: "cardano", icon: "🔷", category: "payment" },
  { id: "solana", icon: "◎", category: "payment" },
];

// Default style settings
export const DEFAULT_STYLE: QRStyleSettings = {
  size: 256,
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  errorCorrection: "M",
  includeMargin: true,
};
