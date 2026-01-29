import React from "react";
import { FRAME_TEMPLATES, FRAME_TEXT_PRESETS } from "@/types/qr-code";
import { InputField } from "./FormFields";
import type { FrameStyle } from "@/types/qr-code";

interface FrameStyleSectionProps {
  frameStyle: FrameStyle;
  frameText: string;
  onFrameStyleChange: (style: FrameStyle) => void;
  onFrameTextChange: (text: string) => void;
  t: (key: string) => string;
  compact?: boolean;
}

export function FrameStyleSection({
  frameStyle,
  frameText,
  onFrameStyleChange,
  onFrameTextChange,
  t,
  compact = false,
}: FrameStyleSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {t("tools.qrCode.frameStyle")}
      </label>
      <div
        className={`grid ${compact ? "grid-cols-5" : "grid-cols-3 sm:grid-cols-5"} gap-1.5 mb-3`}
      >
        {FRAME_TEMPLATES.map((frame) => (
          <button
            key={frame.id}
            onClick={() => onFrameStyleChange(frame.id)}
            className={`px-2 py-2 ${compact ? "text-[10px]" : "text-xs"} font-medium rounded-lg transition-colors ${
              frameStyle === frame.id
                ? "bg-violet-600 text-white"
                : "bg-white dark:bg-dark-card text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-dark-border hover:border-violet-300 dark:hover:border-violet-600"
            }`}
          >
            {t(
              `tools.qrCode.frame${frame.id.charAt(0).toUpperCase() + frame.id.slice(1)}`,
            )}
          </button>
        ))}
      </div>
      {frameStyle !== "none" && (
        <div className="space-y-2">
          <InputField
            label={t("tools.qrCode.frameTextLabel")}
            value={frameText}
            onChange={onFrameTextChange}
            placeholder={t("tools.qrCode.frameTextPlaceholder")}
          />
          <div className="flex flex-wrap gap-1.5">
            {FRAME_TEXT_PRESETS.map((text) => (
              <button
                key={text}
                onClick={() => onFrameTextChange(text)}
                className={`px-2 py-1 ${compact ? "text-[10px]" : "text-xs"} rounded transition-colors ${
                  frameText === text
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
