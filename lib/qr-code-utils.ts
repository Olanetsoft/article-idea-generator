/**
 * QR Code Generator Utility Functions
 * Pure functions for QR code value generation, validation, and formatting
 */

import type {
  QRContentType,
  TextData,
  URLData,
  EmailData,
  PhoneData,
  SMSData,
  WifiData,
  VCardData,
  LocationData,
  EventData,
  TwitterData,
  YouTubeData,
  FacebookData,
  BitcoinData,
  EthereumData,
  CardanoData,
  SolanaData,
  AppStoreData,
  ValidationResult,
} from "@/types/qr-code";

// ============================================================================
// Value Generators - Convert data to QR-readable strings
// ============================================================================

/**
 * Generates a plain text QR value
 */
export function generateTextValue(data: TextData): string {
  return data.text || "";
}

/**
 * Generates a URL QR value with protocol normalization
 */
export function generateURLValue(data: URLData): string {
  const { url } = data;
  if (!url) return "";

  // Auto-add https:// if no protocol
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Generates a mailto: QR value for email
 */
export function generateEmailValue(data: EmailData): string {
  const { email, subject, body } = data;
  if (!email) return "";

  let value = `mailto:${email}`;
  const params: string[] = [];

  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  if (params.length > 0) {
    value += `?${params.join("&")}`;
  }

  return value;
}

/**
 * Generates a tel: QR value for phone calls
 */
export function generatePhoneValue(data: PhoneData): string {
  const { phone } = data;
  if (!phone) return "";

  // Clean the phone number (keep + and digits only)
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

/**
 * Generates an SMS QR value
 */
export function generateSMSValue(data: SMSData): string {
  const { phone, message } = data;
  if (!phone) return "";

  const cleaned = phone.replace(/[^\d+]/g, "");
  let value = `sms:${cleaned}`;

  if (message) {
    value += `?body=${encodeURIComponent(message)}`;
  }

  return value;
}

/**
 * Generates a WiFi QR value (standard format)
 */
export function generateWifiValue(data: WifiData): string {
  const { ssid, password, encryption, hidden } = data;
  if (!ssid) return "";

  const escapedSSID = escapeWifiString(ssid);
  const escapedPassword = escapeWifiString(password);
  const hiddenStr = hidden ? "H:true;" : "";

  return `WIFI:T:${encryption};S:${escapedSSID};P:${escapedPassword};${hiddenStr};`;
}

/**
 * Escape special characters in WiFi strings
 */
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"'])/g, "\\$1");
}

/**
 * Generates a vCard QR value (version 3.0)
 */
export function generateVCardValue(data: VCardData): string {
  const {
    firstName,
    lastName,
    organization,
    title,
    email,
    phone,
    mobile,
    website,
    street,
    city,
    state,
    zip,
    country,
  } = data;

  if (!firstName && !lastName) return "";

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName || ""};${firstName || ""};;;`,
    `FN:${[firstName, lastName].filter(Boolean).join(" ")}`,
  ];

  if (organization) lines.push(`ORG:${organization}`);
  if (title) lines.push(`TITLE:${title}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (phone) lines.push(`TEL;TYPE=WORK:${phone}`);
  if (mobile) lines.push(`TEL;TYPE=CELL:${mobile}`);
  if (website) lines.push(`URL:${website}`);

  // Address
  if (street || city || state || zip || country) {
    lines.push(
      `ADR;TYPE=WORK:;;${street || ""};${city || ""};${state || ""};${zip || ""};${country || ""}`,
    );
  }

  lines.push("END:VCARD");

  return lines.join("\n");
}

/**
 * Generates a geo location QR value
 */
export function generateLocationValue(data: LocationData): string {
  const { latitude, longitude, query } = data;

  // If coordinates provided, use geo: format
  if (latitude && longitude) {
    return `geo:${latitude},${longitude}`;
  }

  // If query provided, use Google Maps search
  if (query) {
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  }

  return "";
}

/**
 * Generates a calendar event QR value (iCal format)
 */
export function generateEventValue(data: EventData): string {
  const {
    title,
    location,
    startDate,
    startTime,
    endDate,
    endTime,
    description,
  } = data;

  if (!title || !startDate || !startTime) return "";

  // Format: YYYYMMDDTHHMMSS (local time)
  const formatDateTime = (date: string, time: string): string => {
    const d = date.replace(/-/g, "");
    const t = time.replace(/:/g, "") + "00";
    return `${d}T${t}`;
  };

  const dtStart = formatDateTime(startDate, startTime);
  const dtEnd = formatDateTime(endDate || startDate, endTime || startTime);
  const uid = `${Date.now()}@qrcode-generator`;

  const lines: string[] = [
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `UID:${uid}`,
  ];

  if (location) lines.push(`LOCATION:${location}`);
  if (description) lines.push(`DESCRIPTION:${description}`);

  lines.push("END:VEVENT");

  return lines.join("\n");
}

/**
 * Generates a Twitter profile QR value
 */
export function generateTwitterValue(data: TwitterData): string {
  const { username } = data;
  if (!username) return "";

  // Remove @ if present
  const cleanUsername = username.replace(/^@/, "");
  return `https://twitter.com/${cleanUsername}`;
}

/**
 * Generates a YouTube QR value (video or channel)
 */
export function generateYouTubeValue(data: YouTubeData): string {
  const { videoId, channelId } = data;

  if (videoId) {
    // Extract video ID if full URL provided
    const match = videoId.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    const id = match ? match[1] : videoId;
    return `https://www.youtube.com/watch?v=${id}`;
  }

  if (channelId) {
    // Handle channel URLs or IDs
    if (channelId.startsWith("@")) {
      return `https://www.youtube.com/${channelId}`;
    }
    return `https://www.youtube.com/channel/${channelId}`;
  }

  return "";
}

/**
 * Generates a Facebook profile/page QR value
 */
export function generateFacebookValue(data: FacebookData): string {
  const { username, pageId } = data;

  if (pageId) {
    return `https://www.facebook.com/${pageId}`;
  }

  if (username) {
    return `https://www.facebook.com/${username}`;
  }

  return "";
}

/**
 * Generates a Bitcoin payment QR value (BIP21 format)
 */
export function generateBitcoinValue(data: BitcoinData): string {
  const { address, amount, label, message } = data;
  if (!address) return "";

  let uri = `bitcoin:${address}`;
  const params: string[] = [];

  if (amount) params.push(`amount=${amount}`);
  if (label) params.push(`label=${encodeURIComponent(label)}`);
  if (message) params.push(`message=${encodeURIComponent(message)}`);

  if (params.length > 0) {
    uri += `?${params.join("&")}`;
  }

  return uri;
}

/**
 * Generates an Ethereum payment QR value (EIP-681 format)
 */
export function generateEthereumValue(data: EthereumData): string {
  const { address, amount, tokenAddress, chainId } = data;
  if (!address) return "";

  // EIP-681: ethereum:[pay-]<address>[@<chain_id>][/<function_name>][?<parameters>]
  let uri = `ethereum:${address}`;

  if (chainId) {
    uri += `@${chainId}`;
  }

  const params: string[] = [];
  if (amount) params.push(`value=${parseFloat(amount) * 1e18}`); // Convert ETH to Wei
  if (tokenAddress) params.push(`token=${tokenAddress}`);

  if (params.length > 0) {
    uri += `?${params.join("&")}`;
  }

  return uri;
}

/**
 * Generates a Cardano payment QR value (CIP-13 format)
 */
export function generateCardanoValue(data: CardanoData): string {
  const { address, amount } = data;
  if (!address) return "";

  // CIP-13: web+cardano:<address>[?amount=<lovelace>]
  let uri = `web+cardano:${address}`;

  if (amount) {
    // Convert ADA to Lovelace (1 ADA = 1,000,000 Lovelace)
    const lovelace = parseFloat(amount) * 1e6;
    uri += `?amount=${lovelace}`;
  }

  return uri;
}

/**
 * Generates a Solana payment QR value (Solana Pay format)
 */
export function generateSolanaValue(data: SolanaData): string {
  const { address, amount, reference, label, message } = data;
  if (!address) return "";

  // Solana Pay: solana:<recipient>[?amount=<amount>][&reference=<reference>][&label=<label>][&message=<message>]
  let uri = `solana:${address}`;
  const params: string[] = [];

  if (amount) params.push(`amount=${amount}`);
  if (reference) params.push(`reference=${reference}`);
  if (label) params.push(`label=${encodeURIComponent(label)}`);
  if (message) params.push(`message=${encodeURIComponent(message)}`);

  if (params.length > 0) {
    uri += `?${params.join("&")}`;
  }

  return uri;
}

/**
 * Generates an App Store QR value
 */
export function generateAppStoreValue(data: AppStoreData): string {
  const { appId, platform } = data;
  if (!appId) return "";

  switch (platform) {
    case "ios":
      return `https://apps.apple.com/app/id${appId}`;
    case "android":
      return `https://play.google.com/store/apps/details?id=${appId}`;
    case "both":
      // Default to iOS for "both" - user can create separate codes
      return `https://apps.apple.com/app/id${appId}`;
    default:
      return "";
  }
}

// ============================================================================
// Main QR Value Generator
// ============================================================================

/**
 * Generate QR code value based on content type and data
 */
export function generateQRValue(
  type: QRContentType,
  data: Record<string, unknown>,
): string {
  switch (type) {
    case "text":
      return generateTextValue(data as unknown as TextData);
    case "url":
      return generateURLValue(data as unknown as URLData);
    case "email":
      return generateEmailValue(data as unknown as EmailData);
    case "phone":
      return generatePhoneValue(data as unknown as PhoneData);
    case "sms":
      return generateSMSValue(data as unknown as SMSData);
    case "wifi":
      return generateWifiValue(data as unknown as WifiData);
    case "vcard":
      return generateVCardValue(data as unknown as VCardData);
    case "location":
      return generateLocationValue(data as unknown as LocationData);
    case "event":
      return generateEventValue(data as unknown as EventData);
    case "twitter":
      return generateTwitterValue(data as unknown as TwitterData);
    case "youtube":
      return generateYouTubeValue(data as unknown as YouTubeData);
    case "facebook":
      return generateFacebookValue(data as unknown as FacebookData);
    case "bitcoin":
      return generateBitcoinValue(data as unknown as BitcoinData);
    case "ethereum":
      return generateEthereumValue(data as unknown as EthereumData);
    case "cardano":
      return generateCardanoValue(data as unknown as CardanoData);
    case "solana":
      return generateSolanaValue(data as unknown as SolanaData);
    case "appstore":
      return generateAppStoreValue(data as unknown as AppStoreData);
    default:
      return "";
  }
}

// ============================================================================
// Validators
// ============================================================================

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  return { isValid: true };
}

/**
 * Validate URL (supports query parameters like UTM tracking)
 */
export function validateURL(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: "URL is required" };
  }
  // URL validation - supports protocols, paths, query params (UTM), and fragments
  const urlRegex =
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(:\d+)?(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/i;
  if (!urlRegex.test(url)) {
    return { isValid: false, error: "Invalid URL format" };
  }
  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }
  // Allow various formats: +1234567890, 123-456-7890, etc.
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned)) {
    return { isValid: false, error: "Invalid phone number format" };
  }
  return { isValid: true };
}

/**
 * Validate latitude
 */
export function validateLatitude(lat: string): ValidationResult {
  if (!lat) {
    return { isValid: false, error: "Latitude is required" };
  }
  const num = parseFloat(lat);
  if (isNaN(num) || num < -90 || num > 90) {
    return { isValid: false, error: "Latitude must be between -90 and 90" };
  }
  return { isValid: true };
}

/**
 * Validate longitude
 */
export function validateLongitude(lng: string): ValidationResult {
  if (!lng) {
    return { isValid: false, error: "Longitude is required" };
  }
  const num = parseFloat(lng);
  if (isNaN(num) || num < -180 || num > 180) {
    return { isValid: false, error: "Longitude must be between -180 and 180" };
  }
  return { isValid: true };
}

/**
 * Validate QR content based on type
 */
export function validateQRContent(
  type: QRContentType,
  data: Record<string, unknown>,
): ValidationResult {
  switch (type) {
    case "text": {
      const textData = data as unknown as TextData;
      if (!textData.text) {
        return { isValid: false, error: "Text content is required" };
      }
      return { isValid: true };
    }

    case "url": {
      const urlData = data as unknown as URLData;
      return validateURL(urlData.url);
    }

    case "email": {
      const emailData = data as unknown as EmailData;
      return validateEmail(emailData.email);
    }

    case "phone": {
      const phoneData = data as unknown as PhoneData;
      return validatePhone(phoneData.phone);
    }

    case "sms": {
      const smsData = data as unknown as SMSData;
      return validatePhone(smsData.phone);
    }

    case "wifi": {
      const wifiData = data as unknown as WifiData;
      if (!wifiData.ssid) {
        return { isValid: false, error: "Network name (SSID) is required" };
      }
      return { isValid: true };
    }

    case "vcard": {
      const vcard = data as unknown as VCardData;
      if (!vcard.firstName && !vcard.lastName) {
        return {
          isValid: false,
          error: "At least first or last name is required",
        };
      }
      return { isValid: true };
    }

    case "location": {
      const loc = data as unknown as LocationData;
      if (!loc.latitude && !loc.longitude && !loc.query) {
        return {
          isValid: false,
          error: "Enter coordinates or a location query",
        };
      }
      if (loc.latitude && !validateLatitude(loc.latitude).isValid) {
        return validateLatitude(loc.latitude);
      }
      if (loc.longitude && !validateLongitude(loc.longitude).isValid) {
        return validateLongitude(loc.longitude);
      }
      return { isValid: true };
    }

    case "event": {
      const event = data as unknown as EventData;
      if (!event.title) {
        return { isValid: false, error: "Event title is required" };
      }
      if (!event.startDate || !event.startTime) {
        return { isValid: false, error: "Start date and time are required" };
      }
      return { isValid: true };
    }

    case "twitter": {
      const twitter = data as unknown as TwitterData;
      if (!twitter.username) {
        return { isValid: false, error: "Twitter username is required" };
      }
      return { isValid: true };
    }

    case "youtube": {
      const youtube = data as unknown as YouTubeData;
      if (!youtube.videoId && !youtube.channelId) {
        return { isValid: false, error: "Video ID or Channel is required" };
      }
      return { isValid: true };
    }

    case "facebook": {
      const facebook = data as unknown as FacebookData;
      if (!facebook.username && !facebook.pageId) {
        return { isValid: false, error: "Username or Page ID is required" };
      }
      return { isValid: true };
    }

    case "bitcoin": {
      const bitcoin = data as unknown as BitcoinData;
      if (!bitcoin.address) {
        return { isValid: false, error: "Bitcoin address is required" };
      }
      // Basic Bitcoin address validation (26-35 alphanumeric characters)
      if (
        !/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(bitcoin.address) &&
        !/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(bitcoin.address)
      ) {
        return { isValid: false, error: "Invalid Bitcoin address format" };
      }
      return { isValid: true };
    }

    case "ethereum": {
      const ethereum = data as unknown as EthereumData;
      if (!ethereum.address) {
        return { isValid: false, error: "Ethereum address is required" };
      }
      // Ethereum address: 0x followed by 40 hex characters
      if (!/^0x[a-fA-F0-9]{40}$/.test(ethereum.address)) {
        return { isValid: false, error: "Invalid Ethereum address format" };
      }
      return { isValid: true };
    }

    case "cardano": {
      const cardano = data as unknown as CardanoData;
      if (!cardano.address) {
        return { isValid: false, error: "Cardano address is required" };
      }
      // Cardano Shelley addresses start with addr1
      if (!/^addr1[a-zA-Z0-9]{50,}$/.test(cardano.address)) {
        return { isValid: false, error: "Invalid Cardano address format" };
      }
      return { isValid: true };
    }

    case "solana": {
      const solana = data as unknown as SolanaData;
      if (!solana.address) {
        return { isValid: false, error: "Solana address is required" };
      }
      // Solana addresses are 32-44 base58 characters
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(solana.address)) {
        return { isValid: false, error: "Invalid Solana address format" };
      }
      return { isValid: true };
    }

    case "appstore": {
      const appstore = data as unknown as AppStoreData;
      if (!appstore.appId) {
        return { isValid: false, error: "App ID is required" };
      }
      return { isValid: true };
    }

    default:
      return { isValid: true };
  }
}

// ============================================================================
// Download Helpers
// ============================================================================

/**
 * Download canvas as PNG
 */
export function downloadAsPNG(
  canvas: HTMLCanvasElement,
  filename: string = "qrcode",
): void {
  const url = canvas.toDataURL("image/png", 1.0);
  downloadFile(url, `${filename}.png`);
}

/**
 * Download canvas as JPG
 */
export function downloadAsJPG(
  canvas: HTMLCanvasElement,
  filename: string = "qrcode",
  bgColor: string = "#FFFFFF",
): void {
  // Create a new canvas with white background for JPG
  const newCanvas = document.createElement("canvas");
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const ctx = newCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const url = newCanvas.toDataURL("image/jpeg", 0.9);
    downloadFile(url, `${filename}.jpg`);
  }
}

/**
 * Download QR code as SVG
 */
export function downloadAsSVG(
  canvas: HTMLCanvasElement,
  size: number,
  fgColor: string,
  bgColor: string,
  filename: string = "qrcode",
): void {
  // Get QR data from canvas
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const moduleCount = Math.sqrt(imageData.data.length / 4);

  // Build SVG
  let svgPaths = "";
  const moduleSize = size / moduleCount;

  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      const idx = (y * moduleCount + x) * 4;
      // Check if pixel is dark (foreground)
      if (imageData.data[idx] < 128) {
        svgPaths += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fgColor}"/>`;
      }
    }
  }

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${svgPaths}
</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `${filename}.svg`);
  URL.revokeObjectURL(url);
}

/**
 * Generic file download helper
 */
function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy QR code to clipboard
 */
export async function copyQRToClipboard(
  canvas: HTMLCanvasElement,
): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================================================
// History Management
// ============================================================================

const HISTORY_KEY = "qr-code-history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Save QR code to history
 */
export function saveToHistory(
  type: QRContentType,
  value: string,
  fgColor: string,
  bgColor: string,
): void {
  if (typeof window === "undefined") return;

  try {
    const history = getHistory();
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      value,
      timestamp: Date.now(),
      style: { fgColor, bgColor },
    };

    // Add to beginning, remove duplicates by value
    const filtered = history.filter((item) => item.value !== value);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get QR code history
 */
export function getHistory(): Array<{
  id: string;
  type: QRContentType;
  value: string;
  timestamp: number;
  style: { fgColor: string; bgColor: string };
}> {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear QR code history
 */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}
