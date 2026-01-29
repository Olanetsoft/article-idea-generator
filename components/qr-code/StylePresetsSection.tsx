import React from "react";
import { STYLE_PRESETS } from "@/types/qr-code";
import type { QRStyleSettings, FrameStyle } from "@/types/qr-code";

interface StylePresetsSectionProps {
  onSelect: (preset: {
    fgColor: string;
    bgColor: string;
    frameStyle: FrameStyle;
    frameText?: string;
  }) => void;
  t: (key: string) => string;
  compact?: boolean;
}

export function StylePresetsSection({
  onSelect,
  t,
  compact = false,
}: StylePresetsSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        {t("tools.qrCode.quickPresets")}
      </label>
      <div
        className={`grid ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"} gap-2`}
      >
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() =>
              onSelect({
                fgColor: preset.fgColor,
                bgColor: preset.bgColor,
                frameStyle: preset.frameStyle,
                frameText: preset.frameText,
              })
            }
            className={`flex items-center gap-2 ${compact ? "p-1.5" : "p-2"} bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border hover:border-violet-300 dark:hover:border-violet-600 transition-colors text-left`}
          >
            <div
              className={`${compact ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"} rounded flex items-center justify-center border`}
              style={{
                backgroundColor: preset.bgColor,
                color: preset.fgColor,
                borderColor: preset.fgColor + "40",
              }}
            >
              ▣
            </div>
            <span
              className={`${compact ? "text-[10px]" : "text-xs"} font-medium text-zinc-700 dark:text-zinc-300`}
            >
              {preset.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
