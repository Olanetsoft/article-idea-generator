import React, { useId } from "react";
import { STYLE_PRESETS } from "@/types/qr-code";
import type { FrameStyle } from "@/types/qr-code";

interface StylePresetsSectionProps {
  onSelect: (preset: {
    fgColor: string;
    bgColor: string;
    frameStyle: FrameStyle;
    frameText?: string;
  }) => void;
  t: (key: string) => string;
  compact?: boolean;
  /** Current colors/frame so the active preset can show a selected state */
  selectedFgColor?: string;
  selectedBgColor?: string;
  selectedFrameStyle?: FrameStyle;
}

export function StylePresetsSection({
  onSelect,
  t,
  compact = false,
  selectedFgColor,
  selectedBgColor,
  selectedFrameStyle,
}: StylePresetsSectionProps) {
  const headingId = useId();

  return (
    <div role="group" aria-labelledby={headingId}>
      <span
        id={headingId}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3"
      >
        {t("tools.qrCode.quickPresets")}
      </span>
      <div
        className={`grid ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"} gap-2`}
      >
        {STYLE_PRESETS.map((preset) => {
          const isSelected =
            selectedFgColor === preset.fgColor &&
            selectedBgColor === preset.bgColor &&
            selectedFrameStyle === preset.frameStyle;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onSelect({
                  fgColor: preset.fgColor,
                  bgColor: preset.bgColor,
                  frameStyle: preset.frameStyle,
                  frameText: preset.frameText,
                })
              }
              aria-pressed={isSelected}
              className={`flex items-center gap-2 ${compact ? "p-1.5" : "p-2"} rounded-lg border transition-colors text-left ${
                isSelected
                  ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500"
                  : "bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border hover:border-violet-300 dark:hover:border-violet-600"
              }`}
            >
              <div
                aria-hidden="true"
                className={`${compact ? "w-6 h-6" : "w-8 h-8"} text-xs rounded flex items-center justify-center border`}
                style={{
                  backgroundColor: preset.bgColor,
                  color: preset.fgColor,
                  borderColor: preset.fgColor + "40",
                }}
              >
                ▣
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
