import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { StylePresetsSection } from "./StylePresetsSection";
import { LogoUploadSection } from "./LogoUploadSection";
import { FrameStyleSection } from "./FrameStyleSection";
import { ColorPickerSection } from "./ColorPickerSection";
import type { QRStyleSettings, FrameStyle } from "@/types/qr-code";

interface BatchStylePanelProps {
  style: QRStyleSettings;
  frameStyle: FrameStyle;
  frameText: string;
  logoDataUrl: string | null;
  onStyleChange: (updates: Partial<QRStyleSettings>) => void;
  onFrameStyleChange: (style: FrameStyle) => void;
  onFrameTextChange: (text: string) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  t: (key: string) => string;
}

export function BatchStylePanel({
  style,
  frameStyle,
  frameText,
  logoDataUrl,
  onStyleChange,
  onFrameStyleChange,
  onFrameTextChange,
  onLogoUpload,
  onLogoRemove,
  t,
}: BatchStylePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePresetSelect = (preset: {
    fgColor: string;
    bgColor: string;
    frameStyle: FrameStyle;
    frameText?: string;
  }) => {
    onStyleChange({ fgColor: preset.fgColor, bgColor: preset.bgColor });
    onFrameStyleChange(preset.frameStyle);
    if (preset.frameText) {
      onFrameTextChange(preset.frameText);
    }
  };

  const handleColorChange = (type: "fgColor" | "bgColor", color: string) => {
    onStyleChange({ [type]: color });
  };

  return (
    <div className="border border-zinc-200 dark:border-dark-border rounded-lg overflow-hidden">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">🎨</span>
          {t("tools.qrCode.batchStyleOptions")}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-5 bg-white dark:bg-dark-card">
          {/* Quick Presets */}
          <StylePresetsSection onSelect={handlePresetSelect} t={t} compact />

          {/* Logo Upload */}
          <LogoUploadSection
            logoDataUrl={logoDataUrl}
            onUpload={onLogoUpload}
            onRemove={onLogoRemove}
            t={t}
            compact
          />

          {/* Frame Style */}
          <FrameStyleSection
            frameStyle={frameStyle}
            frameText={frameText}
            onFrameStyleChange={onFrameStyleChange}
            onFrameTextChange={onFrameTextChange}
            t={t}
            compact
          />

          {/* Colors - Only color presets and custom colors, no advanced */}
          <ColorPickerSection
            style={style}
            onColorChange={handleColorChange}
            t={t}
            compact
          />
        </div>
      )}
    </div>
  );
}
