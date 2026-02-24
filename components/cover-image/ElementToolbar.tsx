// ============================================================================
// Cover Image Generator - Element Toolbar
// Provides buttons for adding shapes, badges, emojis, and images
// ============================================================================

import React, { useState, useRef } from "react";
import type { ShapeElement } from "@/lib/cover-image/editor-types";
import {
  BADGE_PRESETS,
  EMOJI_PRESETS,
  SHAPE_PRESETS,
} from "@/lib/cover-image/editor-types";

interface ElementToolbarProps {
  onAddText: () => void;
  onAddShape: (type: ShapeElement["shapeType"]) => void;
  onAddBadge: (text: string, bgColor: string, textColor: string) => void;
  onAddEmoji: (emoji: string) => void;
  onAddImage: (src: string) => void;
  disabled?: boolean;
}

type ToolbarPanel = "shapes" | "badges" | "emojis" | null;

export function ElementToolbar({
  onAddText,
  onAddShape,
  onAddBadge,
  onAddEmoji,
  onAddImage,
  disabled = false,
}: ElementToolbarProps) {
  const [activePanel, setActivePanel] = useState<ToolbarPanel>(null);
  const [customBadge, setCustomBadge] = useState({
    text: "",
    bgColor: "#3B82F6",
    textColor: "#FFFFFF",
  });
  const imageInputRef = useRef<HTMLInputElement>(null);

  const togglePanel = (panel: ToolbarPanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      onAddImage(src);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      {/* Main toolbar buttons - scrollable on small screens */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-white/10 overflow-x-auto">
        {/* Add Text */}
        <button
          onClick={onAddText}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm dark:shadow-none flex-shrink-0"
          title="Add Text"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
          <span className="text-sm font-medium">Text</span>
        </button>

        {/* Shapes dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => togglePanel("shapes")}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activePanel === "shapes"
                ? "bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300"
                : "bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white shadow-sm dark:shadow-none"
            }`}
            title="Add Shape"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <span className="text-sm font-medium">Shapes</span>
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Badges dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => togglePanel("badges")}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activePanel === "badges"
                ? "bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300"
                : "bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white shadow-sm dark:shadow-none"
            }`}
            title="Add Badge"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-sm font-medium">Badges</span>
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Emoji dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => togglePanel("emojis")}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activePanel === "emojis"
                ? "bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300"
                : "bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white shadow-sm dark:shadow-none"
            }`}
            title="Add Emoji"
          >
            <span className="text-base">😊</span>
            <span className="text-sm font-medium">Emoji</span>
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Image upload */}
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm dark:shadow-none flex-shrink-0"
          title="Add Image"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium">Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Click outside to close - must be before dropdown for proper z-index */}
      {activePanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActivePanel(null)}
        />
      )}

      {/* Dropdown panels */}
      {activePanel && (
        <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-white dark:bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-white/10 shadow-2xl w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[320px] max-w-[320px]">
          {/* Shapes panel */}
          {activePanel === "shapes" && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                Add Shape
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {SHAPE_PRESETS.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => {
                      onAddShape(shape.shapeType);
                      setActivePanel(null);
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/15 rounded-lg transition-colors"
                  >
                    <div className="text-2xl">{shape.icon}</div>
                    <span className="text-xs text-gray-600 dark:text-white/70">
                      {shape.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badges panel */}
          {activePanel === "badges" && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                Preset Badges
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {BADGE_PRESETS.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => {
                      onAddBadge(badge.text, badge.bgColor, badge.textColor);
                      setActivePanel(null);
                    }}
                    className="flex items-center justify-center p-2 rounded-lg transition-colors hover:scale-105"
                    style={{ backgroundColor: badge.bgColor }}
                  >
                    <span
                      className="text-xs font-bold px-2 py-1"
                      style={{ color: badge.textColor }}
                    >
                      {badge.text}
                    </span>
                  </button>
                ))}
              </div>

              <h4 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                Custom Badge
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={customBadge.text}
                  onChange={(e) =>
                    setCustomBadge({ ...customBadge, text: e.target.value })
                  }
                  placeholder="Badge text..."
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-white/60 mb-1 block">
                      Background
                    </label>
                    <input
                      type="color"
                      value={customBadge.bgColor}
                      onChange={(e) =>
                        setCustomBadge({
                          ...customBadge,
                          bgColor: e.target.value,
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-white/60 mb-1 block">
                      Text
                    </label>
                    <input
                      type="color"
                      value={customBadge.textColor}
                      onChange={(e) =>
                        setCustomBadge({
                          ...customBadge,
                          textColor: e.target.value,
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (customBadge.text.trim()) {
                      onAddBadge(
                        customBadge.text,
                        customBadge.bgColor,
                        customBadge.textColor,
                      );
                      setCustomBadge({
                        text: "",
                        bgColor: "#3B82F6",
                        textColor: "#FFFFFF",
                      });
                      setActivePanel(null);
                    }
                  }}
                  disabled={!customBadge.text.trim()}
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                  Add Custom Badge
                </button>
              </div>
            </div>
          )}

          {/* Emoji panel */}
          {activePanel === "emojis" && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                Pick an Emoji
              </h4>
              <div className="grid grid-cols-8 gap-1 max-h-[240px] overflow-y-auto">
                {EMOJI_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onAddEmoji(preset.emoji);
                      setActivePanel(null);
                    }}
                    className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title={preset.name}
                  >
                    {preset.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
