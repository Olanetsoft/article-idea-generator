// ============================================================================
// Cover Image Generator - Main Page Component
// Refactored with DRY principles and clean code architecture
// ============================================================================

import { useRef, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { useCoverImage } from "@/hooks/useCoverImage";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import {
  DownloadIcon,
  PhotographIcon,
  RefreshIcon,
  AdjustmentsIcon,
  ColorSwatchIcon,
  TemplateIcon,
  UploadIcon,
  TrashIcon,
  DuplicateIcon,
  SaveIcon,
  SparklesIcon,
  CollectionIcon,
  PencilIcon,
  ReplyIcon,
} from "@heroicons/react/outline";

// Import constants and utilities
import {
  TabId,
  SIZE_PRESETS,
  SIZE_CATEGORIES,
  GRADIENT_PRESETS,
  PATTERNS,
  THEMES,
  FONTS,
  DEV_ICONS,
  TEMPLATES,
  TEXT_COLOR_PRESETS,
} from "@/lib/cover-image";
import { getGradientCSS, getPatternSVG } from "@/lib/cover-image";

// Import reusable components
import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormCheckbox,
  FormSelect,
  Slider,
  Button,
  ToggleButtonGroup,
  ColorPicker,
  GradientSwatch,
  PillButton,
  CardButton,
  LoadingSpinner,
  FeatureCard,
  ElementToolbar,
  BackgroundControls,
} from "@/components/cover-image";

// Import advanced editor types
import type {
  BackgroundSettings,
  ShapeElement,
} from "@/lib/cover-image/editor-types";
import { DEFAULT_IMAGE_FILTERS } from "@/lib/cover-image/editor-types";

// ============================================================================
// Constants
// ============================================================================

const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

// Tab configuration
const TABS: { id: TabId; labelKey: string; icon: JSX.Element }[] = [
  {
    id: "content",
    labelKey: "tools.coverImage.tabContent",
    icon: <AdjustmentsIcon className="w-4 h-4" />,
  },
  {
    id: "style",
    labelKey: "tools.coverImage.tabStyle",
    icon: <ColorSwatchIcon className="w-4 h-4" />,
  },
  {
    id: "layout",
    labelKey: "tools.coverImage.tabLayout",
    icon: <TemplateIcon className="w-4 h-4" />,
  },
  {
    id: "editor",
    labelKey: "tools.coverImage.tabEditor",
    icon: <PencilIcon className="w-4 h-4" />,
  },
  {
    id: "export",
    labelKey: "tools.coverImage.tabExport",
    icon: <DownloadIcon className="w-4 h-4" />,
  },
];

// Feature configuration for feature cards
const FEATURES = [
  {
    icon: "🎨",
    titleKey: "tools.coverImage.featureGradientsTitle",
    descKey: "tools.coverImage.featureGradientsDesc",
  },
  {
    icon: "📐",
    titleKey: "tools.coverImage.featureSizesTitle",
    descKey: "tools.coverImage.featureSizesDesc",
  },
  {
    icon: "🔲",
    titleKey: "tools.coverImage.featurePatternsTitle",
    descKey: "tools.coverImage.featurePatternsDesc",
  },
  {
    icon: "🎯",
    titleKey: "tools.coverImage.featureThemesTitle",
    descKey: "tools.coverImage.featureThemesDesc",
  },
  {
    icon: "💻",
    titleKey: "tools.coverImage.featureIconsTitle",
    descKey: "tools.coverImage.featureIconsDesc",
  },
  {
    icon: "📥",
    titleKey: "tools.coverImage.featureDownloadAllTitle",
    descKey: "tools.coverImage.featureDownloadAllDesc",
  },
  {
    icon: "💾",
    titleKey: "tools.coverImage.featureSaveTitle",
    descKey: "tools.coverImage.featureSaveDesc",
  },
  {
    icon: "⚡",
    titleKey: "tools.coverImage.featureTemplatesTitle",
    descKey: "tools.coverImage.featureTemplatesDesc",
  },
];

// ============================================================================
// Sub-Components for Tab Content
// ============================================================================

interface TabContentProps {
  hook: ReturnType<typeof useCoverImage>;
  t: (key: string) => string;
}

function ContentTab({ hook, t }: TabContentProps): JSX.Element {
  const {
    settings,
    updateSetting,
    handleLogoUpload,
    removeLogo,
    fileInputRef,
  } = hook;

  return (
    <>
      {/* Title Input */}
      <div>
        <FormLabel required>{t("tools.coverImage.titleLabel")}</FormLabel>
        <FormTextarea
          value={settings.title}
          onChange={(val) => updateSetting("title", val)}
          placeholder={t("tools.coverImage.titlePlaceholder")}
        />
      </div>

      {/* Subtitle Input */}
      <div>
        <FormLabel>{t("tools.coverImage.subtitleLabel")}</FormLabel>
        <FormInput
          value={settings.subtitle}
          onChange={(val) => updateSetting("subtitle", val)}
          placeholder={t("tools.coverImage.subtitlePlaceholder")}
        />
      </div>

      {/* Author Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("tools.coverImage.authorLabel")}
          </label>
          <FormCheckbox
            checked={settings.showAuthor}
            onChange={(checked) => updateSetting("showAuthor", checked)}
            label={t("tools.coverImage.showAuthor")}
          />
        </div>
        <FormInput
          value={settings.author}
          onChange={(val) => updateSetting("author", val)}
          placeholder={t("tools.coverImage.authorPlaceholder")}
        />
      </div>

      {/* Icon/Logo Section */}
      <div>
        <FormLabel>{t("tools.coverImage.iconLabel")}</FormLabel>

        {/* Logo Upload */}
        <div className="mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <div className="flex gap-2">
            <label
              htmlFor="logo-upload"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-dark-card/50 border border-dashed border-gray-300 dark:border-dark-border rounded-xl cursor-pointer hover:border-violet-400 transition-colors"
            >
              <UploadIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {settings.customLogo
                  ? t("tools.coverImage.logoUploaded")
                  : t("tools.coverImage.uploadLogo")}
              </span>
            </label>
            {settings.customLogo && (
              <Button
                variant="danger"
                onClick={removeLogo}
                icon={<TrashIcon className="w-5 h-5" />}
              >
                {""}
              </Button>
            )}
          </div>
        </div>

        {/* Dev Icons Grid */}
        {!settings.customLogo && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("tools.coverImage.orChooseIcon")}
            </p>
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-dark-bg rounded-lg">
              {DEV_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => updateSetting("devIcon", icon.id)}
                  title={icon.name}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                    settings.devIcon === icon.id
                      ? "bg-violet-100 dark:bg-violet-900/30 ring-2 ring-violet-500"
                      : "bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border"
                  }`}
                >
                  {icon.icon ? (
                    <i className={`devicon-${icon.icon}-plain text-xl`} />
                  ) : (
                    <span className="text-xs text-gray-400">∅</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logo Size Slider */}
        {(settings.customLogo || settings.devIcon !== "none") && (
          <div className="mt-3">
            <Slider
              label={t("tools.coverImage.logoSize")}
              value={settings.logoSize}
              onChange={(val) => updateSetting("logoSize", val)}
              min={40}
              max={160}
              unit="px"
            />
          </div>
        )}
      </div>
    </>
  );
}

function StyleTab({ hook, t }: TabContentProps): JSX.Element {
  const { settings, updateSetting } = hook;

  return (
    <>
      {/* Background/Gradient */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("tools.coverImage.backgroundLabel")}
          </label>
          <FormCheckbox
            checked={settings.useCustomGradient}
            onChange={(checked) => updateSetting("useCustomGradient", checked)}
            label={t("tools.coverImage.customColors")}
            className="text-xs"
          />
        </div>

        {settings.useCustomGradient ? (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Start</label>
              <input
                type="color"
                value={settings.customGradientStart}
                onChange={(e) =>
                  updateSetting("customGradientStart", e.target.value)
                }
                className="w-full h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-dark-border"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">End</label>
              <input
                type="color"
                value={settings.customGradientEnd}
                onChange={(e) =>
                  updateSetting("customGradientEnd", e.target.value)
                }
                className="w-full h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-dark-border"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {GRADIENT_PRESETS.map((gradient) => (
              <GradientSwatch
                key={gradient.id}
                colors={gradient.colors}
                selected={settings.gradientPreset === gradient.id}
                onClick={() => updateSetting("gradientPreset", gradient.id)}
                title={gradient.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Gradient Angle */}
      <Slider
        label={t("tools.coverImage.gradientAngle")}
        value={settings.gradientAngle}
        onChange={(val) => updateSetting("gradientAngle", val)}
        min={0}
        max={360}
        unit="°"
      />

      {/* Pattern */}
      <div>
        <FormLabel>{t("tools.coverImage.patternLabel")}</FormLabel>
        <div className="flex flex-wrap gap-2">
          {PATTERNS.map((pattern) => (
            <PillButton
              key={pattern.id}
              selected={settings.pattern === pattern.id}
              onClick={() => updateSetting("pattern", pattern.id)}
            >
              {pattern.name}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Pattern Opacity */}
      {settings.pattern !== "none" && (
        <Slider
          label={t("tools.coverImage.patternOpacity")}
          value={settings.patternOpacity}
          onChange={(val) => updateSetting("patternOpacity", val)}
          min={0.05}
          max={0.5}
          step={0.05}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      )}

      {/* Text Color */}
      <div>
        <FormLabel>{t("tools.coverImage.textColorLabel")}</FormLabel>
        <ColorPicker
          value={settings.textColor}
          onChange={(color) => updateSetting("textColor", color)}
          presets={TEXT_COLOR_PRESETS}
        />
      </div>

      {/* Font */}
      <div>
        <FormLabel>{t("tools.coverImage.fontLabel")}</FormLabel>
        <FormSelect
          value={settings.font}
          onChange={(val) => updateSetting("font", val)}
          options={FONTS}
        />
      </div>

      {/* Font Size */}
      <Slider
        label={t("tools.coverImage.fontSizeLabel")}
        value={settings.fontSize}
        onChange={(val) => updateSetting("fontSize", val)}
        min={32}
        max={120}
        unit="px"
      />
    </>
  );
}

function LayoutTab({ hook, t }: TabContentProps): JSX.Element {
  const { settings, updateSetting } = hook;

  return (
    <>
      {/* Theme */}
      <div>
        <FormLabel>{t("tools.coverImage.themeLabel")}</FormLabel>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <CardButton
              key={theme.id}
              title={theme.name}
              description={theme.description}
              selected={settings.theme === theme.id}
              onClick={() => updateSetting("theme", theme.id)}
            />
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <FormLabel>{t("tools.coverImage.alignLabel")}</FormLabel>
        <ToggleButtonGroup
          options={["left", "center", "right"]}
          value={settings.textAlign}
          onChange={(val) =>
            updateSetting("textAlign", val as "left" | "center" | "right")
          }
        />
      </div>

      {/* Padding */}
      <Slider
        label={t("tools.coverImage.paddingLabel")}
        value={settings.padding}
        onChange={(val) => updateSetting("padding", val)}
        min={20}
        max={120}
        unit="px"
      />

      {/* Border Radius */}
      <Slider
        label={t("tools.coverImage.borderRadiusLabel")}
        value={settings.borderRadius}
        onChange={(val) => updateSetting("borderRadius", val)}
        min={0}
        max={50}
        unit="px"
      />
    </>
  );
}

// Extended tab props for advanced editor features
interface EditorTabProps extends TabContentProps {
  backgroundSettings: BackgroundSettings;
  onBackgroundChange: (settings: BackgroundSettings) => void;
  onAddText: () => void;
  onAddShape: (type: ShapeElement["shapeType"]) => void;
  onAddBadge: (text: string, bgColor: string, textColor: string) => void;
  onAddEmoji: (emoji: string) => void;
  onAddImage: (src: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

function EditorTab({
  hook,
  t,
  backgroundSettings,
  onBackgroundChange,
  onAddText,
  onAddShape,
  onAddBadge,
  onAddEmoji,
  onAddImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorTabProps): JSX.Element {
  return (
    <>
      {/* Advanced Mode Info Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              Advanced Editor Mode
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                BETA
              </span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <strong className="text-amber-600 dark:text-amber-400">
                Background Image & Filters
              </strong>{" "}
              are fully functional below. Element tools (shapes, badges, emojis)
              are coming soon with full drag & drop support.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Editor Section */}
      <div className="space-y-4">
        {/* Background Image Controls - This works! */}
        <div>
          <FormLabel>Background Image</FormLabel>
          <BackgroundControls
            settings={backgroundSettings}
            onChange={onBackgroundChange}
          />
        </div>

        {/* Element Toolbar - Coming Soon */}
        <div className="opacity-50 pointer-events-none">
          <div className="flex items-center justify-between mb-1">
            <FormLabel>Add Elements</FormLabel>
            <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              Coming Soon
            </span>
          </div>
          <ElementToolbar
            onAddText={onAddText}
            onAddShape={onAddShape}
            onAddBadge={onAddBadge}
            onAddEmoji={onAddEmoji}
            onAddImage={onAddImage}
            disabled
          />
        </div>

        {/* Undo/Redo Controls - Coming Soon */}
        <div className="opacity-50 pointer-events-none">
          <div className="flex items-center justify-between mb-1">
            <FormLabel>History</FormLabel>
            <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onUndo}
              disabled={true}
              variant="secondary"
              className="flex-1"
              icon={<ReplyIcon className="w-4 h-4" />}
            >
              Undo
            </Button>
            <Button
              onClick={onRedo}
              disabled={true}
              variant="secondary"
              className="flex-1"
              icon={<ReplyIcon className="w-4 h-4 transform scale-x-[-1]" />}
            >
              Redo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function ExportTab({ hook, t }: TabContentProps): JSX.Element {
  const {
    settings,
    updateSetting,
    currentSize,
    isGenerating,
    isDownloadingAll,
    handleDownload,
    handleDownloadAll,
    saveSettings,
    handleCopySettings,
    handleReset,
  } = hook;

  return (
    <>
      {/* Size Presets by Category */}
      <div>
        <FormLabel>{t("tools.coverImage.sizeLabel")}</FormLabel>

        {SIZE_CATEGORIES.map(({ id: category, label }) => (
          <div key={category} className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {label}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SIZE_PRESETS.filter((s) => s.category === category).map(
                (preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateSetting("sizePreset", preset.id)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors text-left ${
                      settings.sizePreset === preset.id
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-gray-50 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-violet-400"
                    }`}
                  >
                    <span className="block font-medium">{preset.name}</span>
                    <span className="text-[10px] opacity-70">
                      {preset.width}×{preset.height}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Size Inputs */}
      {settings.sizePreset === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Width (px)
            </label>
            <FormInput
              type="number"
              value={settings.customWidth}
              onChange={(val) =>
                updateSetting("customWidth", parseInt(val) || 1600)
              }
              min={100}
              max={4000}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Height (px)
            </label>
            <FormInput
              type="number"
              value={settings.customHeight}
              onChange={(val) =>
                updateSetting("customHeight", parseInt(val) || 900)
              }
              min={100}
              max={4000}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {/* Output Size Display */}
      <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">
            {t("tools.coverImage.outputSize")}:
          </span>{" "}
          {currentSize.width} × {currentSize.height}px
        </p>
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          disabled={isGenerating || !settings.title.trim()}
          variant="primary"
          size="lg"
          className="w-full"
          icon={
            isGenerating ? (
              <LoadingSpinner />
            ) : (
              <DownloadIcon className="w-5 h-5" />
            )
          }
        >
          {isGenerating
            ? t("tools.coverImage.generating")
            : `${t("tools.coverImage.downloadCurrent")} (${currentSize.name})`}
        </Button>

        <Button
          onClick={handleDownloadAll}
          disabled={isDownloadingAll || !settings.title.trim()}
          variant="gradient"
          size="lg"
          className="w-full"
          icon={
            isDownloadingAll ? (
              <LoadingSpinner />
            ) : (
              <CollectionIcon className="w-5 h-5" />
            )
          }
        >
          {isDownloadingAll
            ? t("tools.coverImage.downloadingAll")
            : t("tools.coverImage.downloadAll")}
        </Button>
      </div>

      {/* Settings Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
        <Button
          onClick={saveSettings}
          variant="secondary"
          className="flex-1"
          icon={<SaveIcon className="w-4 h-4" />}
        >
          {t("tools.coverImage.saveSettings")}
        </Button>
        <Button
          onClick={handleCopySettings}
          variant="secondary"
          className="flex-1"
          icon={<DuplicateIcon className="w-4 h-4" />}
        >
          {t("tools.coverImage.copySettings")}
        </Button>
        <Button
          onClick={handleReset}
          variant="danger"
          icon={<TrashIcon className="w-4 h-4" />}
        >
          {""}
        </Button>
      </div>
    </>
  );
}

// ============================================================================
// Preview Component
// ============================================================================

interface PreviewProps {
  hook: ReturnType<typeof useCoverImage>;
  t: (key: string) => string;
  backgroundSettings?: BackgroundSettings;
}

function Preview({ hook, t, backgroundSettings }: PreviewProps): JSX.Element {
  const { settings, currentSize, currentFont } = hook;
  const previewRef = useRef<HTMLDivElement>(null);

  // Use background image if set, otherwise use gradient
  const hasBackgroundImage =
    backgroundSettings?.type === "image" && backgroundSettings?.image;

  const previewStyle = hasBackgroundImage
    ? {
        aspectRatio: `${currentSize.width}/${currentSize.height}`,
        borderRadius: settings.borderRadius,
      }
    : {
        background: getGradientCSS(settings),
        aspectRatio: `${currentSize.width}/${currentSize.height}`,
        borderRadius: settings.borderRadius,
      };

  // Build CSS filter string for background image
  const getImageFilterStyle = () => {
    if (!backgroundSettings?.imageFilters) return {};
    const { brightness, contrast, saturation, blur, grayscale } =
      backgroundSettings.imageFilters;
    const filters = [];
    if (brightness !== 100) filters.push(`brightness(${brightness / 100})`);
    if (contrast !== 100) filters.push(`contrast(${contrast / 100})`);
    if (saturation !== 100) filters.push(`saturate(${saturation / 100})`);
    if (blur > 0) filters.push(`blur(${blur / 10}px)`);
    if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
    return filters.length > 0 ? { filter: filters.join(" ") } : {};
  };

  const patternStyle =
    settings.pattern !== "none"
      ? {
          backgroundImage: getPatternSVG(
            settings.pattern,
            settings.patternOpacity,
          ),
          backgroundRepeat: "repeat",
        }
      : {};

  const hasIcon = settings.devIcon !== "none" || settings.customLogo;

  // Compute icon position class
  const iconPositionClass =
    settings.theme === "modern"
      ? "left-8 top-1/2 -translate-y-1/2"
      : settings.theme === "corner"
        ? "right-8 top-8"
        : "left-1/2 -translate-x-1/2 top-8";

  // Compute text container classes
  const textContainerClass = [
    "absolute inset-0 flex flex-col justify-center p-6 sm:p-8",
    settings.theme === "modern" && hasIcon ? "pl-[30%]" : "",
    hasIcon && settings.theme === "corner" ? "pt-8" : "",
    hasIcon && settings.theme !== "modern" && settings.theme !== "corner"
      ? "pt-[20%]"
      : "",
    settings.textAlign === "center" && settings.theme !== "modern"
      ? "items-center text-center"
      : "",
    settings.textAlign === "right" ? "items-end text-right" : "",
    settings.textAlign === "left" || settings.theme === "modern"
      ? "items-start text-left"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm"
    >
      <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
        <h2 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <AdjustmentsIcon className="w-5 h-5 text-gray-500" />
          {t("tools.coverImage.preview")}
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {currentSize.width} × {currentSize.height}px
        </span>
      </div>

      <div className="p-4 sm:p-6">
        <div
          ref={previewRef}
          className="relative w-full overflow-hidden shadow-xl transition-all"
          style={previewStyle}
        >
          {/* Background Image Layer */}
          {hasBackgroundImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backgroundSettings.image!}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={getImageFilterStyle()}
              />
              {/* Color overlay for background image */}
              {backgroundSettings.overlay?.enabled && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: backgroundSettings.overlay.color,
                    opacity: backgroundSettings.overlay.opacity,
                  }}
                />
              )}
            </>
          )}

          {/* Gradient background fallback (shows when no image) */}
          {!hasBackgroundImage && (
            <div
              className="absolute inset-0"
              style={{ background: getGradientCSS(settings) }}
            />
          )}

          {/* Pattern Overlay */}
          {settings.pattern !== "none" && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={patternStyle}
            />
          )}

          {/* Card Theme Overlay */}
          {settings.theme === "card" && (
            <div className="absolute inset-10 bg-white/15 rounded-xl" />
          )}

          {/* Icon/Logo */}
          {hasIcon && (
            <div
              className={`absolute ${iconPositionClass}`}
              style={{
                width: `${settings.logoSize / 10}%`,
                maxWidth: settings.logoSize,
              }}
            >
              {settings.customLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.customLogo}
                  alt="Logo"
                  className="w-full h-auto"
                />
              ) : (
                <div
                  className="w-full aspect-square rounded-full bg-white/20 flex items-center justify-center"
                  style={{ color: settings.textColor }}
                >
                  <i
                    className={`devicon-${DEV_ICONS.find((i) => i.id === settings.devIcon)?.icon}-plain`}
                    style={{ fontSize: `${settings.logoSize / 2}px` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          <div
            className={textContainerClass}
            style={{ color: settings.textColor }}
          >
            <h2
              className={`font-bold leading-tight ${settings.theme === "outlined" ? "text-transparent" : ""}`}
              style={{
                fontFamily: currentFont.family,
                fontSize: `clamp(0.8rem, ${settings.fontSize / 20}vw, ${settings.fontSize / 14}rem)`,
                WebkitTextStroke:
                  settings.theme === "outlined"
                    ? `2px ${settings.textColor}`
                    : undefined,
              }}
            >
              {settings.title || t("tools.coverImage.titlePlaceholder")}
            </h2>

            {settings.subtitle && (
              <p
                className="mt-2 opacity-80"
                style={{
                  fontFamily: currentFont.family,
                  fontSize: `clamp(0.4rem, ${settings.fontSize / 50}vw, ${settings.fontSize / 40}rem)`,
                }}
              >
                {settings.subtitle}
              </p>
            )}

            {settings.showAuthor && settings.author && (
              <p
                className="mt-4 opacity-70"
                style={{
                  fontFamily: currentFont.family,
                  fontSize: `clamp(0.35rem, ${settings.fontSize / 60}vw, ${settings.fontSize / 48}rem)`,
                }}
              >
                by {settings.author}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {currentSize.name} — {currentSize.width} × {currentSize.height}px
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Templates Modal Component
// ============================================================================

interface TemplatesModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
  t: (key: string) => string;
}

function TemplatesModal({
  show,
  onClose,
  onApply,
  t,
}: TemplatesModalProps): JSX.Element | null {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t("tools.coverImage.chooseTemplate")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onApply(template.id)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border border-transparent hover:border-violet-400"
              >
                <span className="text-3xl">{template.preview}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {template.name}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t("tools.coverImage.cancel")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function CoverImageGeneratorPage(): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const hook = useCoverImage();

  const {
    activeTab,
    setActiveTab,
    showTemplates,
    setShowTemplates,
    applyTemplate,
    handleRandomize,
    settings,
  } = hook;

  // Advanced editor state
  const [backgroundSettings, setBackgroundSettings] =
    useState<BackgroundSettings>({
      type: "gradient",
      image: null,
      imageFilters: DEFAULT_IMAGE_FILTERS,
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0.3,
      },
    });

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Element handlers (placeholder - will connect to canvas editor)
  const handleAddText = useCallback(() => {
    console.log("Add text element");
  }, []);

  const handleAddShape = useCallback((type: ShapeElement["shapeType"]) => {
    console.log("Add shape:", type);
  }, []);

  const handleAddBadge = useCallback(
    (text: string, bgColor: string, textColor: string) => {
      console.log("Add badge:", text, bgColor, textColor);
    },
    [],
  );

  const handleAddEmoji = useCallback((emoji: string) => {
    console.log("Add emoji:", emoji);
  }, []);

  const handleAddImage = useCallback((src: string) => {
    console.log("Add image:", src);
  }, []);

  const handleUndo = useCallback(() => {
    console.log("Undo");
  }, []);

  const handleRedo = useCallback(() => {
    console.log("Redo");
  }, []);

  // SEO configuration
  const { locale: currentLocale, locales, defaultLocale } = router;
  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/cover-image-generator`
      : `${SITE_URL}/${currentLocale}/tools/cover-image-generator`;
  const ogLocale = LOCALE_MAP[currentLocale || "en"] || "en_US";

  // Render tab content based on active tab
  const renderTabContent = () => {
    const props = { hook, t };
    switch (activeTab) {
      case "content":
        return <ContentTab {...props} />;
      case "style":
        return <StyleTab {...props} />;
      case "layout":
        return <LayoutTab {...props} />;
      case "editor":
        return (
          <EditorTab
            {...props}
            backgroundSettings={backgroundSettings}
            onBackgroundChange={setBackgroundSettings}
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onAddBadge={handleAddBadge}
            onAddEmoji={handleAddEmoji}
            onAddImage={handleAddImage}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        );
      case "export":
        return <ExportTab {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-dark-bg dark:to-darkOffset">
      <Head>
        <title>{t("tools.coverImage.pageTitle")}</title>
        <meta
          name="description"
          content={t("tools.coverImage.pageDescription")}
        />
        <meta
          name="keywords"
          content="cover image generator, blog cover, article header, social media image, twitter card, og image, thumbnail generator, free cover maker, blog banner, hashnode cover, dev.to cover, medium cover, linkedin banner, download all sizes, dev icons, custom logo"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:title" content={t("tools.coverImage.pageTitle")} />
        <meta
          property="og:description"
          content={t("tools.coverImage.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={ogLocale} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("tools.coverImage.pageTitle")} />
        <meta
          name="twitter:description"
          content={t("tools.coverImage.pageDescription")}
        />

        {locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/cover-image-generator`
                : `${SITE_URL}/${locale}/tools/cover-image-generator`
            }
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.coverImage.name"),
              description: t("tools.coverImage.pageDescription"),
              url: pageUrl,
              applicationCategory: "DesignApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: [
                "24+ gradient presets",
                "Custom color picker",
                "12 pattern overlays",
                "8 theme layouts",
                "30+ dev icons",
                "Custom logo upload",
                "Download all 15 sizes at once",
                "Save settings locally",
                "8 quick-start templates",
              ],
            }),
          }}
        />
      </Head>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Header />

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="w-full max-w-6xl mb-4">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Tools
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              Cover Image Generator
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 w-full max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium mb-4">
            <PhotographIcon className="w-3.5 h-3.5" />
            {t("tools.coverImage.badge")}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.coverImage.title")}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.coverImage.subtitle")}
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:border-violet-400 transition-colors"
            >
              <SparklesIcon className="w-4 h-4 text-violet-500" />
              {t("tools.coverImage.quickTemplates")}
            </button>
            <button
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:border-violet-400 transition-colors"
            >
              <RefreshIcon className="w-4 h-4 text-violet-500" />
              {t("tools.coverImage.randomize")}
            </button>
          </div>
        </motion.div>

        {/* Templates Modal */}
        <TemplatesModal
          show={showTemplates}
          onClose={() => setShowTemplates(false)}
          onApply={applyTemplate}
          t={t}
        />

        {/* Main Content Grid */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Settings with Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm"
            >
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-dark-border overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/10"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 space-y-5">{renderTabContent()}</div>
            </motion.div>

            {/* Right Panel - Preview */}
            <Preview
              hook={hook}
              t={t}
              backgroundSettings={backgroundSettings}
            />
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("tools.coverImage.featuresTitle")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("tools.coverImage.featuresDescription")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={t(feature.titleKey)}
                  description={t(feature.descKey)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
