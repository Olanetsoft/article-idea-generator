import React from "react";
import { COLOR_PRESETS } from "@/types/qr-code";
import type { QRStyleSettings } from "@/types/qr-code";

interface ColorPickerSectionProps {
  style: QRStyleSettings;
  onColorChange: (type: "fgColor" | "bgColor", color: string) => void;
  t: (key: string) => string;
  compact?: boolean;
}

export function ColorPickerSection({
  style,
  onColorChange,
  t,
  compact = false,
}: ColorPickerSectionProps) {
  return (
    <div className="space-y-4">
      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          {t("tools.qrCode.colorPresets")}
        </label>
        <div
          className={`grid ${compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4"} gap-2`}
        >
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                onColorChange("fgColor", preset.fgColor);
                onColorChange("bgColor", preset.bgColor);
              }}
              className={`flex flex-col items-center gap-1 ${compact ? "p-1.5" : "p-2"} rounded-lg border transition-all ${
                style.fgColor === preset.fgColor &&
                style.bgColor === preset.bgColor
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                  : "border-zinc-200 dark:border-dark-border hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <div
                className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-md border border-zinc-300 dark:border-zinc-600`}
                style={{ backgroundColor: preset.bgColor }}
              >
                <div
                  className="w-full h-full rounded-md"
                  style={{
                    backgroundColor: preset.fgColor,
                    clipPath:
                      "polygon(20% 20%, 40% 20%, 40% 40%, 20% 40%, 20% 60%, 40% 60%, 40% 80%, 60% 80%, 60% 60%, 80% 60%, 80% 40%, 60% 40%, 60% 20%, 80% 20%, 80% 40%, 60% 40%)",
                  }}
                />
              </div>
              <span
                className={`${compact ? "text-[10px]" : "text-xs"} text-zinc-600 dark:text-zinc-400`}
              >
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
            {t("tools.qrCode.foregroundColor")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.fgColor}
              onChange={(e) => onColorChange("fgColor", e.target.value)}
              className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded cursor-pointer border border-zinc-300 dark:border-zinc-600`}
            />
            <input
              type="text"
              value={style.fgColor}
              onChange={(e) => onColorChange("fgColor", e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border rounded bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-1 focus:ring-violet-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white uppercase"
              maxLength={7}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
            {t("tools.qrCode.backgroundColor")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.bgColor}
              onChange={(e) => onColorChange("bgColor", e.target.value)}
              className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded cursor-pointer border border-zinc-300 dark:border-zinc-600`}
            />
            <input
              type="text"
              value={style.bgColor}
              onChange={(e) => onColorChange("bgColor", e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border rounded bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-1 focus:ring-violet-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white uppercase"
              maxLength={7}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
