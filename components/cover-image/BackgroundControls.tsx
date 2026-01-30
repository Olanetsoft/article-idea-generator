// ============================================================================
// Cover Image Generator - Background Controls
// Upload background images with filters (blur, overlay, brightness, etc.)
// ============================================================================

import React, { useRef } from "react";
import type { BackgroundSettings } from "@/lib/cover-image/editor-types";
import { DEFAULT_IMAGE_FILTERS } from "@/lib/cover-image/editor-types";

interface BackgroundControlsProps {
  settings: BackgroundSettings;
  onChange: (settings: BackgroundSettings) => void;
}

// ============================================================================
// Reusable Filter Slider Component (DRY)
// ============================================================================
interface FilterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}

function FilterSlider({
  label,
  value,
  min,
  max,
  unit = "%",
  onChange,
}: FilterSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 dark:text-white/60">{label}</span>
        <span className="text-gray-700 dark:text-white/80">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
    </div>
  );
}

export function BackgroundControls({
  settings,
  onChange,
}: BackgroundControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      onChange({
        ...settings,
        type: "image",
        image: imageUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChange({
      ...settings,
      type: "gradient",
      image: null,
      imageFilters: DEFAULT_IMAGE_FILTERS,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateFilter = (
    key: keyof typeof settings.imageFilters,
    value: number,
  ) => {
    onChange({
      ...settings,
      imageFilters: {
        ...settings.imageFilters,
        [key]: value,
      },
    });
  };

  const updateOverlay = (key: keyof typeof settings.overlay, value: any) => {
    onChange({
      ...settings,
      overlay: {
        ...settings.overlay,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload section */}
      <div className="space-y-2">
        {settings.image ? (
          <div className="space-y-3">
            {/* Preview */}
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.image}
                alt="Background preview"
                className="w-full h-24 object-cover"
                style={{
                  filter: `
                    brightness(${settings.imageFilters.brightness}%)
                    contrast(${settings.imageFilters.contrast}%)
                    saturate(${settings.imageFilters.saturation}%)
                    blur(${settings.imageFilters.blur}px)
                    grayscale(${settings.imageFilters.grayscale}%)
                  `,
                }}
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                title="Remove background image"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Image filters */}
            <div className="space-y-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider">
                Image Adjustments
              </h4>

              <FilterSlider
                label="Brightness"
                value={settings.imageFilters.brightness}
                min={0}
                max={200}
                onChange={(val) => updateFilter("brightness", val)}
              />

              <FilterSlider
                label="Contrast"
                value={settings.imageFilters.contrast}
                min={0}
                max={200}
                onChange={(val) => updateFilter("contrast", val)}
              />

              <FilterSlider
                label="Saturation"
                value={settings.imageFilters.saturation}
                min={0}
                max={200}
                onChange={(val) => updateFilter("saturation", val)}
              />

              <FilterSlider
                label="Blur"
                value={settings.imageFilters.blur}
                min={0}
                max={20}
                unit="px"
                onChange={(val) => updateFilter("blur", val)}
              />

              <FilterSlider
                label="Grayscale"
                value={settings.imageFilters.grayscale}
                min={0}
                max={100}
                onChange={(val) => updateFilter("grayscale", val)}
              />

              {/* Reset filters button */}
              <button
                onClick={() =>
                  onChange({
                    ...settings,
                    imageFilters: DEFAULT_IMAGE_FILTERS,
                  })
                }
                className="w-full py-1.5 text-xs text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80 hover:bg-gray-200 dark:hover:bg-white/5 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>

            {/* Overlay settings */}
            <div className="space-y-3 p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider">
                  Color Overlay
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.overlay.enabled}
                    onChange={(e) => updateOverlay("enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {settings.overlay.enabled && (
                <>
                  {/* Overlay color */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-white/60">
                      Overlay Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.overlay.color}
                        onChange={(e) => updateOverlay("color", e.target.value)}
                        className="w-10 h-8 rounded cursor-pointer border border-gray-200 dark:border-white/10"
                      />
                      <input
                        type="text"
                        value={settings.overlay.color}
                        onChange={(e) => updateOverlay("color", e.target.value)}
                        className="flex-1 px-2 py-1 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Overlay opacity */}
                  <FilterSlider
                    label="Opacity"
                    value={Math.round(settings.overlay.opacity * 100)}
                    min={0}
                    max={100}
                    onChange={(val) => updateOverlay("opacity", val / 100)}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-purple-500/50 rounded-lg transition-colors text-center group"
          >
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-white/40 group-hover:text-purple-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-white/60 group-hover:text-gray-700 dark:group-hover:text-white/80 transition-colors">
              Click to upload background image
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              PNG, JPG, WEBP up to 5MB
            </p>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Quick preset backgrounds */}
      {!settings.image && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-500 dark:text-white/60">
            Or use a preset
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_BACKGROUNDS.map((preset, index) => (
              <button
                key={index}
                onClick={() =>
                  onChange({
                    ...settings,
                    type: "image",
                    image: preset.url,
                  })
                }
                className="aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Preset background images (placeholders - replace with actual URLs)
const PRESET_BACKGROUNDS = [
  {
    name: "Abstract Gradient 1",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=630&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=100&fit=crop",
  },
  {
    name: "Dark Code",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=100&fit=crop",
  },
  {
    name: "Tech Pattern",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=100&fit=crop",
  },
  {
    name: "Minimal Light",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=630&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&h=100&fit=crop",
  },
];
