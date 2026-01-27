/**
 * QR Code Generator Types
 * Comprehensive type definitions for the QR Code Generator tool
 */

// ============================================================================
// QR Code Content Types
// ============================================================================

export type QRContentType =
  | "text"
  | "url"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "location"
  | "event";

// ============================================================================
// Input Data Types for Each QR Content Type
// ============================================================================

export interface TextData {
  text: string;
}

export interface URLData {
  url: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneData {
  phone: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
  query?: string;
}

export interface EventData {
  title: string;
  location?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description?: string;
}

// Union type for all QR data types
export type QRData =
  | TextData
  | URLData
  | EmailData
  | PhoneData
  | SMSData
  | WifiData
  | VCardData
  | LocationData
  | EventData;

// ============================================================================
// QR Code Styling & Settings
// ============================================================================

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRStyleSettings {
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrectionLevel;
  includeMargin: boolean;
  logoUrl?: string;
  logoSize?: number;
}

export const DEFAULT_QR_STYLE: QRStyleSettings = {
  size: 256,
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  errorCorrection: "M",
  includeMargin: true,
  logoSize: 50,
};

// ============================================================================
// QR Code Presets
// ============================================================================

export interface ColorPreset {
  id: string;
  name: string;
  fgColor: string;
  bgColor: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "classic", name: "Classic", fgColor: "#000000", bgColor: "#FFFFFF" },
  { id: "ocean", name: "Ocean", fgColor: "#1E3A5F", bgColor: "#E8F4F8" },
  { id: "forest", name: "Forest", fgColor: "#1D4E3E", bgColor: "#E8F5E8" },
  { id: "sunset", name: "Sunset", fgColor: "#8B2635", bgColor: "#FFF5E6" },
  { id: "midnight", name: "Midnight", fgColor: "#2D1B69", bgColor: "#F0E6FF" },
  { id: "coral", name: "Coral", fgColor: "#C44536", bgColor: "#FFF0ED" },
  { id: "teal", name: "Teal", fgColor: "#0D7377", bgColor: "#E6FFFF" },
  { id: "grape", name: "Grape", fgColor: "#5B2C6F", bgColor: "#F5E6FF" },
];

// ============================================================================
// Size Options
// ============================================================================

export interface SizeOption {
  value: number;
  label: string;
  description: string;
}

export const SIZE_OPTIONS: SizeOption[] = [
  { value: 128, label: "Small", description: "128×128px - Social media" },
  { value: 192, label: "Medium", description: "192×192px - Web use" },
  { value: 256, label: "Standard", description: "256×256px - General use" },
  { value: 384, label: "Large", description: "384×384px - Print ready" },
  { value: 512, label: "Extra Large", description: "512×512px - High quality" },
];

// ============================================================================
// Error Correction Options
// ============================================================================

export interface ErrorCorrectionOption {
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
  recovery: string;
}

export const ERROR_CORRECTION_OPTIONS: ErrorCorrectionOption[] = [
  {
    value: "L",
    label: "Low",
    description: "Best for clean environments",
    recovery: "7%",
  },
  {
    value: "M",
    label: "Medium",
    description: "Balanced - Recommended",
    recovery: "15%",
  },
  {
    value: "Q",
    label: "Quartile",
    description: "Better damage resistance",
    recovery: "25%",
  },
  {
    value: "H",
    label: "High",
    description: "Best for logos/damage",
    recovery: "30%",
  },
];

// ============================================================================
// Download Formats
// ============================================================================

export type DownloadFormat = "png" | "svg" | "jpg";

export interface DownloadOption {
  format: DownloadFormat;
  label: string;
  description: string;
}

export const DOWNLOAD_OPTIONS: DownloadOption[] = [
  { format: "png", label: "PNG", description: "Best for web & sharing" },
  { format: "svg", label: "SVG", description: "Vector - Best for print" },
  { format: "jpg", label: "JPG", description: "Smaller file size" },
];

// ============================================================================
// History Item
// ============================================================================

export interface QRHistoryItem {
  id: string;
  type: QRContentType;
  value: string;
  timestamp: number;
  style: Pick<QRStyleSettings, "fgColor" | "bgColor">;
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
