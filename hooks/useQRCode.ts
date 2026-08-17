/**
 * useQRCode Hook
 * Manages QR code generation state and logic
 */

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import type {
  QRContentType,
  QRStyleSettings,
  QRHistoryItem,
} from "@/types/qr-code";
import {
  generateQRValue,
  validateQRContent,
  downloadAsPNG,
  downloadAsJPG,
  downloadAsSVG,
  copyQRToClipboard,
  getHistory,
  clearHistory,
  deleteHistoryItem,
} from "@/lib/qr-code-utils";
import { trackToolUsage } from "@/lib/gtag";

/**
 * History item enriched with the full form data snapshot so an entry can be
 * fully restored (older items saved without `data` fall back gracefully).
 */
export interface QRHistoryEntry extends QRHistoryItem {
  data?: Record<string, unknown>;
}

// Must match the key used by lib/qr-code-utils history helpers
const HISTORY_KEY = "qr-code-history";
const MAX_HISTORY_ITEMS = 10;

const getHistoryEntries = (): QRHistoryEntry[] =>
  getHistory() as QRHistoryEntry[];

/**
 * Save a QR code to history, persisting the form data alongside the encoded
 * value so `loadFromHistory` can restore the exact QR the user generated.
 */
function saveHistoryEntry(
  type: QRContentType,
  value: string,
  data: Record<string, unknown>,
  fgColor: string,
  bgColor: string,
): void {
  if (typeof window === "undefined") return;

  try {
    const history = getHistoryEntries();
    const newItem: QRHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      value,
      timestamp: Date.now(),
      style: { fgColor, bgColor },
      data,
    };

    // Add to beginning, remove duplicates by value
    const filtered = history.filter((item) => item.value !== value);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

// Default style settings
const defaultStyle: QRStyleSettings = {
  size: 256,
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  errorCorrection: "M",
  includeMargin: true,
  logoSize: 50,
};

// Initial data for each QR type
const getInitialData = (type: QRContentType): Record<string, unknown> => {
  switch (type) {
    case "text":
      return { text: "" };
    case "url":
      return { url: "" };
    case "email":
      return { email: "", subject: "", body: "" };
    case "phone":
      return { phone: "" };
    case "sms":
      return { phone: "", message: "" };
    case "wifi":
      return { ssid: "", password: "", encryption: "WPA", hidden: false };
    case "vcard":
      return {
        firstName: "",
        lastName: "",
        organization: "",
        title: "",
        email: "",
        phone: "",
        mobile: "",
        website: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      };
    case "location":
      return { latitude: "", longitude: "", query: "" };
    case "event":
      return {
        title: "",
        location: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        description: "",
      };
    default:
      return {};
  }
};

interface UseQRCodeReturn {
  // Content type and data
  contentType: QRContentType;
  setContentType: (type: QRContentType) => void;
  data: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
  resetData: () => void;

  // Styling
  style: QRStyleSettings;
  updateStyle: <K extends keyof QRStyleSettings>(
    key: K,
    value: QRStyleSettings[K],
  ) => void;
  applyPreset: (fgColor: string, bgColor: string) => void;
  resetStyle: () => void;

  // QR Code
  qrValue: string;
  isValid: boolean;
  validationError?: string;
  isGenerated: boolean;
  generate: () => boolean;

  // Actions
  qrRef: React.RefObject<HTMLDivElement>;
  download: (format: "png" | "svg" | "jpg") => void;
  copyToClipboard: () => Promise<boolean>;
  resetAll: () => void;

  // History
  history: QRHistoryEntry[];
  loadFromHistory: (item: QRHistoryEntry) => void;
  deleteFromHistory: (id: string) => void;
  clearAllHistory: () => void;
  refreshHistory: () => void;
}

export function useQRCode(): UseQRCodeReturn {
  // State
  const [contentType, setContentTypeState] = useState<QRContentType>("url");
  const [data, setData] = useState<Record<string, unknown>>(
    getInitialData("url"),
  );
  const [style, setStyle] = useState<QRStyleSettings>(defaultStyle);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory] = useState<QRHistoryEntry[]>([]);

  // Refs
  const qrRef = useRef<HTMLDivElement>(null);
  const hasTrackedUsage = useRef(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistoryEntries());
  }, []);

  // Computed values
  const qrValue = useMemo(
    () => generateQRValue(contentType, data),
    [contentType, data],
  );

  const validation = useMemo(
    () => validateQRContent(contentType, data),
    [contentType, data],
  );

  // Content type change handler
  const setContentType = useCallback((type: QRContentType) => {
    setContentTypeState(type);
    setData(getInitialData(type));
    setIsGenerated(false);
    hasTrackedUsage.current = false;
  }, []);

  // Field update handler
  const updateField = useCallback((field: string, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Live preview update
    setIsGenerated(false);
  }, []);

  // Reset data to initial state
  const resetData = useCallback(() => {
    setData(getInitialData(contentType));
    setIsGenerated(false);
  }, [contentType]);

  // Style update handler
  const updateStyle = useCallback(
    <K extends keyof QRStyleSettings>(key: K, value: QRStyleSettings[K]) => {
      setStyle((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Apply color preset
  const applyPreset = useCallback((fgColor: string, bgColor: string) => {
    setStyle((prev) => ({ ...prev, fgColor, bgColor }));
  }, []);

  // Reset style to defaults
  const resetStyle = useCallback(() => {
    setStyle(defaultStyle);
  }, []);

  // Generate QR code
  const generate = useCallback((): boolean => {
    if (!validation.isValid) return false;

    if (!hasTrackedUsage.current) {
      trackToolUsage("QR Code Generator", `generate_${contentType}`);
      hasTrackedUsage.current = true;
    }

    setIsGenerated(true);

    // Save to history (including the form data so it can be restored later)
    if (qrValue) {
      saveHistoryEntry(contentType, qrValue, data, style.fgColor, style.bgColor);
      setHistory(getHistoryEntries());
    }

    return true;
  }, [
    validation.isValid,
    contentType,
    qrValue,
    data,
    style.fgColor,
    style.bgColor,
  ]);

  // Download QR code
  const download = useCallback(
    (format: "png" | "svg" | "jpg") => {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) {
        toast.error("QR code is not ready yet. Generate one first.");
        return;
      }

      trackToolUsage("QR Code Generator", `download_${format}`);
      const filename = `qrcode-${contentType}-${Date.now()}`;

      switch (format) {
        case "png":
          downloadAsPNG(canvas, filename);
          break;
        case "jpg":
          downloadAsJPG(canvas, filename, style.bgColor);
          break;
        case "svg":
          downloadAsSVG(
            canvas,
            style.size,
            style.fgColor,
            style.bgColor,
            filename,
          );
          break;
      }
    },
    [contentType, style.size, style.fgColor, style.bgColor],
  );

  // Copy to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return false;

    trackToolUsage("QR Code Generator", "copy_to_clipboard");
    return copyQRToClipboard(canvas);
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    setData(getInitialData(contentType));
    setStyle(defaultStyle);
    setIsGenerated(false);
    hasTrackedUsage.current = false;
  }, [contentType]);

  // History management
  const loadFromHistory = useCallback((item: QRHistoryEntry) => {
    if (item.data) {
      // Restore the full form data so the preview shows the exact QR clicked
      setContentTypeState(item.type);
      setData({ ...getInitialData(item.type), ...item.data });
    } else if (item.type === "text" || item.type === "url") {
      // Legacy entries without data: the raw value maps directly to the field
      setContentTypeState(item.type);
      setData(item.type === "text" ? { text: item.value } : { url: item.value });
    } else {
      // Legacy entries for structured types: re-encode the raw payload as text
      // so the rendered QR still matches the one the user clicked
      setContentTypeState("text");
      setData({ text: item.value });
    }
    setIsGenerated(true);
    setStyle((prev) => ({
      ...prev,
      fgColor: item.style.fgColor,
      bgColor: item.style.bgColor,
    }));
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistoryEntries());
  }, []);

  const clearAllHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistoryEntries());
  }, []);

  return {
    contentType,
    setContentType,
    data,
    updateField,
    resetData,
    style,
    updateStyle,
    applyPreset,
    resetStyle,
    qrValue,
    isValid: validation.isValid,
    validationError: validation.error,
    isGenerated,
    generate,
    qrRef,
    download,
    copyToClipboard,
    resetAll,
    history,
    loadFromHistory,
    deleteFromHistory,
    clearAllHistory,
    refreshHistory,
  };
}
