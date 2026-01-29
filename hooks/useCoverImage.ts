// ============================================================================
// Cover Image Generator - Custom Hook
// ============================================================================

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { trackToolUsage } from "@/lib/gtag";
import {
  CoverSettings,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  SIZE_PRESETS,
  GRADIENT_PRESETS,
  PATTERNS,
  FONTS,
  THEMES,
  TEMPLATES,
  TabId,
} from "@/lib/cover-image/constants";
import {
  getCurrentSize,
  getFontById,
  drawCoverImage,
} from "@/lib/cover-image/canvas";

interface UseCoverImageReturn {
  // State
  settings: CoverSettings;
  activeTab: TabId;
  isGenerating: boolean;
  isDownloadingAll: boolean;
  showTemplates: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Computed values
  currentSize: ReturnType<typeof getCurrentSize>;
  currentFont: ReturnType<typeof getFontById>;

  // Setters
  setActiveTab: (tab: TabId) => void;
  setShowTemplates: (show: boolean) => void;

  // Actions
  updateSetting: <K extends keyof CoverSettings>(
    key: K,
    value: CoverSettings[K],
  ) => void;
  applyTemplate: (templateId: string) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  handleDownload: () => Promise<void>;
  handleDownloadAll: () => Promise<void>;
  handleRandomize: () => void;
  handleReset: () => void;
  handleCopySettings: () => void;
  saveSettings: () => void;
}

export function useCoverImage(): UseCoverImageReturn {
  const { t } = useTranslation();

  // State
  const [settings, setSettings] = useState<CoverSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTrackedUsage = useRef(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't restore custom logo from storage (it's a data URL)
        setSettings((prev) => ({ ...prev, ...parsed, customLogo: null }));
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  // Computed values
  const currentSize = useMemo(() => getCurrentSize(settings), [settings]);
  const currentFont = useMemo(
    () => getFontById(settings.font),
    [settings.font],
  );

  // Generic setting updater
  const updateSetting = useCallback(
    <K extends keyof CoverSettings>(key: K, value: CoverSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      const toSave = { ...settings, customLogo: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      toast.success(t("tools.coverImage.settingsSaved"));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings, t]);

  // Apply a template
  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setSettings((prev) => ({ ...prev, ...template.settings }));
        setShowTemplates(false);
        toast.success(t("tools.coverImage.templateApplied"));
      }
    },
    [t],
  );

  // Handle logo upload
  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("tools.coverImage.logoTooLarge"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        updateSetting("customLogo", event.target?.result as string);
        updateSetting("devIcon", "none");
        toast.success(t("tools.coverImage.logoUploaded"));
      };
      reader.readAsDataURL(file);
    },
    [updateSetting, t],
  );

  // Remove custom logo
  const removeLogo = useCallback(() => {
    updateSetting("customLogo", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [updateSetting]);

  // Download current size
  const handleDownload = useCallback(async () => {
    if (!hasTrackedUsage.current) {
      trackToolUsage("cover_image_generator", "download");
      hasTrackedUsage.current = true;
    }

    setIsGenerating(true);

    try {
      const canvas = document.createElement("canvas");
      await drawCoverImage(canvas, settings, currentFont);

      const link = document.createElement("a");
      link.download = `cover-${settings.sizePreset}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success(t("tools.coverImage.downloadSuccess"));
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error(t("tools.coverImage.downloadError"));
    } finally {
      setIsGenerating(false);
    }
  }, [settings, currentFont, t]);

  // Download all sizes
  const handleDownloadAll = useCallback(async () => {
    if (!hasTrackedUsage.current) {
      trackToolUsage("cover_image_generator", "download_all");
      hasTrackedUsage.current = true;
    }

    setIsDownloadingAll(true);

    try {
      for (const sizePreset of SIZE_PRESETS) {
        if (sizePreset.id === "custom") continue;

        const canvas = document.createElement("canvas");
        const tempSettings = { ...settings, sizePreset: sizePreset.id };
        await drawCoverImage(canvas, tempSettings, currentFont);

        const link = document.createElement("a");
        link.download = `cover-${sizePreset.id}-${sizePreset.width}x${sizePreset.height}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      toast.success(t("tools.coverImage.downloadAllSuccess"));
    } catch (error) {
      console.error("Failed to download all:", error);
      toast.error(t("tools.coverImage.downloadError"));
    } finally {
      setIsDownloadingAll(false);
    }
  }, [settings, currentFont, t]);

  // Randomize settings
  const handleRandomize = useCallback(() => {
    const randomGradient =
      GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
    const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

    setSettings((prev) => ({
      ...prev,
      gradientPreset: randomGradient.id,
      pattern: randomPattern.id,
      font: randomFont.id,
      theme: randomTheme.id,
      gradientAngle: Math.floor(Math.random() * 360),
    }));

    toast.success(t("tools.coverImage.randomized"));
  }, [t]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success(t("tools.coverImage.reset"));
  }, [t]);

  // Copy settings to clipboard
  const handleCopySettings = useCallback(() => {
    const exportSettings = { ...settings, customLogo: null };
    navigator.clipboard.writeText(JSON.stringify(exportSettings, null, 2));
    toast.success(t("tools.coverImage.settingsCopied"));
  }, [settings, t]);

  return {
    // State
    settings,
    activeTab,
    isGenerating,
    isDownloadingAll,
    showTemplates,
    fileInputRef,

    // Computed
    currentSize,
    currentFont,

    // Setters
    setActiveTab,
    setShowTemplates,

    // Actions
    updateSetting,
    applyTemplate,
    handleLogoUpload,
    removeLogo,
    handleDownload,
    handleDownloadAll,
    handleRandomize,
    handleReset,
    handleCopySettings,
    saveSettings,
  };
}
