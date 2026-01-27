/**
 * useQRCode Hook
 * Manages QR code generation state and logic
 */

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import type {
  QRContentType,
  QRStyleSettings,
  DEFAULT_QR_STYLE,
  QRHistoryItem,
} from "@/types/qr-code";
import {
  generateQRValue,
  validateQRContent,
  downloadAsPNG,
  downloadAsJPG,
  downloadAsSVG,
  copyQRToClipboard,
  saveToHistory,
  getHistory,
  clearHistory,
  deleteHistoryItem,
} from "@/lib/qr-code-utils";
import { trackToolUsage } from "@/lib/gtag";

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
  history: QRHistoryItem[];
  loadFromHistory: (item: QRHistoryItem) => void;
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
  const [history, setHistory] = useState<QRHistoryItem[]>([]);

  // Refs
  const qrRef = useRef<HTMLDivElement>(null);
  const hasTrackedUsage = useRef(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
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

    // Save to history
    if (qrValue) {
      saveToHistory(contentType, qrValue, style.fgColor, style.bgColor);
      setHistory(getHistory());
    }

    return true;
  }, [validation.isValid, contentType, qrValue, style.fgColor, style.bgColor]);

  // Download QR code
  const download = useCallback(
    (format: "png" | "svg" | "jpg") => {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) return;

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
  const loadFromHistory = useCallback((item: QRHistoryItem) => {
    setContentTypeState(item.type);
    // For simplicity, we just set the generated state with the raw value
    // In a more complex implementation, we'd parse the value back to data
    setIsGenerated(true);
    setStyle((prev) => ({
      ...prev,
      fgColor: item.style.fgColor,
      bgColor: item.style.bgColor,
    }));
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  }, []);

  const clearAllHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
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
