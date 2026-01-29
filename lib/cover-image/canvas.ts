// ============================================================================
// Cover Image Generator - Canvas Drawing Utilities
// ============================================================================

import type { CoverSettings, Font } from "./constants";
import { SIZE_PRESETS, GRADIENT_PRESETS, DEV_ICONS, FONTS } from "./constants";
import { drawPattern } from "./patterns";

type CanvasContext = CanvasRenderingContext2D;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current size dimensions from settings
 */
export function getCurrentSize(settings: CoverSettings): {
  width: number;
  height: number;
  name: string;
} {
  if (settings.sizePreset === "custom") {
    return {
      width: settings.customWidth,
      height: settings.customHeight,
      name: "Custom",
    };
  }
  const preset = SIZE_PRESETS.find((s) => s.id === settings.sizePreset);
  return preset || SIZE_PRESETS[0];
}

/**
 * Get gradient CSS string for preview
 */
export function getGradientCSS(settings: CoverSettings): string {
  if (settings.useCustomGradient) {
    return `linear-gradient(${settings.gradientAngle}deg, ${settings.customGradientStart} 0%, ${settings.customGradientEnd} 100%)`;
  }

  const gradient = GRADIENT_PRESETS.find(
    (g) => g.id === settings.gradientPreset,
  );
  if (!gradient) return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  const colorStops =
    gradient.colors.length === 2
      ? `${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%`
      : `${gradient.colors[0]} 0%, ${gradient.colors[1]} 50%, ${gradient.colors[2]} 100%`;

  return `linear-gradient(${settings.gradientAngle}deg, ${colorStops})`;
}

/**
 * Adjust hex color brightness
 */
export function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Get font configuration by ID
 */
export function getFontById(fontId: string): Font {
  return FONTS.find((f) => f.id === fontId) || FONTS[0];
}

// ============================================================================
// Canvas Drawing Functions
// ============================================================================

/**
 * Draw gradient background on canvas
 */
function drawGradientBackground(
  ctx: CanvasContext,
  settings: CoverSettings,
  width: number,
  height: number,
): void {
  const gradient = settings.useCustomGradient
    ? { colors: [settings.customGradientStart, settings.customGradientEnd] }
    : GRADIENT_PRESETS.find((g) => g.id === settings.gradientPreset);

  if (!gradient) return;

  const angle = (settings.gradientAngle * Math.PI) / 180;
  const x1 = width / 2 - (Math.cos(angle) * width) / 2;
  const y1 = height / 2 - (Math.sin(angle) * height) / 2;
  const x2 = width / 2 + (Math.cos(angle) * width) / 2;
  const y2 = height / 2 + (Math.sin(angle) * height) / 2;

  const grd = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.colors.forEach((color, index) => {
    grd.addColorStop(index / (gradient.colors.length - 1), color);
  });

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw card overlay for card theme
 */
function drawCardOverlay(
  ctx: CanvasContext,
  width: number,
  height: number,
): void {
  const cardPadding = 40;
  const cardWidth = width - cardPadding * 2;
  const cardHeight = height - cardPadding * 2;

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.roundRect(cardPadding, cardPadding, cardWidth, cardHeight, 20);
  ctx.fill();
}

/**
 * Calculate icon position based on theme
 */
function getIconPosition(
  settings: CoverSettings,
  width: number,
  height: number,
  iconSize: number,
): { x: number; y: number } {
  switch (settings.theme) {
    case "modern":
      return { x: settings.padding, y: height / 2 - iconSize / 2 };
    case "corner":
      return { x: width - settings.padding - iconSize, y: settings.padding };
    default:
      return { x: width / 2 - iconSize / 2, y: settings.padding + 20 };
  }
}

/**
 * Draw icon or custom logo on canvas
 */
async function drawIcon(
  ctx: CanvasContext,
  settings: CoverSettings,
  width: number,
  height: number,
): Promise<void> {
  const iconSize = settings.logoSize;
  const { x: iconX, y: iconY } = getIconPosition(
    settings,
    width,
    height,
    iconSize,
  );

  if (settings.customLogo) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = settings.customLogo!;
    });
  }

  if (settings.devIcon !== "none") {
    const icon = DEV_ICONS.find((i) => i.id === settings.devIcon);
    if (icon?.icon) {
      ctx.save();

      // Draw circle background
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(
        iconX + iconSize / 2,
        iconY + iconSize / 2,
        iconSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Draw icon text (first 2 chars as fallback)
      ctx.fillStyle = settings.textColor;
      ctx.font = `${iconSize * 0.4}px ${settings.font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        icon.name.substring(0, 2).toUpperCase(),
        iconX + iconSize / 2,
        iconY + iconSize / 2,
      );

      ctx.restore();
    }
  }
}

/**
 * Calculate text position and alignment based on theme
 */
function getTextConfig(
  settings: CoverSettings,
  width: number,
  height: number,
): { x: number; startY: number; align: CanvasTextAlign; maxWidth: number } {
  const padding = settings.padding;
  const maxWidth = width - padding * 2;
  const hasIcon = settings.devIcon !== "none" || settings.customLogo;

  switch (settings.theme) {
    case "modern":
      return {
        x: padding + settings.logoSize + 40,
        startY: height / 2,
        align: "left",
        maxWidth: maxWidth - settings.logoSize - 60,
      };
    case "corner":
      return {
        x: padding,
        startY: height - padding - 100,
        align: "left",
        maxWidth,
      };
    case "bold":
      return {
        x: width / 2,
        startY: height / 2,
        align: "center",
        maxWidth,
      };
    default: {
      const x =
        settings.textAlign === "center"
          ? width / 2
          : settings.textAlign === "right"
            ? width - padding
            : padding;
      const startY = hasIcon
        ? settings.padding + settings.logoSize + 60
        : height / 2;
      return { x, startY, align: settings.textAlign, maxWidth };
    }
  }
}

/**
 * Wrap text to fit within max width
 */
function wrapText(
  ctx: CanvasContext,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Draw text content on canvas
 */
async function drawText(
  ctx: CanvasContext,
  settings: CoverSettings,
  currentFont: Font,
  width: number,
  height: number,
): Promise<void> {
  const {
    x: textX,
    startY,
    align,
    maxWidth,
  } = getTextConfig(settings, width, height);
  const fontSize =
    settings.theme === "bold" ? settings.fontSize * 1.3 : settings.fontSize;
  const lineHeight = fontSize * 1.2;

  // Set up font and measure text
  ctx.font = `${currentFont.weight} ${fontSize}px ${currentFont.family}`;
  ctx.textAlign = align;
  ctx.fillStyle = settings.textColor;

  const lines = wrapText(ctx, settings.title, maxWidth);

  // Calculate total height for vertical centering
  const subtitleFontSize = fontSize * 0.4;
  const authorFontSize = fontSize * 0.35;
  let totalHeight = lines.length * lineHeight;
  if (settings.subtitle) totalHeight += subtitleFontSize + 20;
  if (settings.showAuthor && settings.author)
    totalHeight += authorFontSize + 30;

  // Calculate starting Y position
  let currentY =
    settings.theme !== "modern" && settings.theme !== "corner"
      ? (height - totalHeight) / 2 + fontSize * 0.8
      : startY;

  // Draw title lines based on theme
  if (settings.theme === "outlined") {
    ctx.strokeStyle = settings.textColor;
    ctx.lineWidth = 2;
    for (const line of lines) {
      ctx.strokeText(line, textX, currentY);
      currentY += lineHeight;
    }
  } else if (settings.theme === "gradient-text") {
    const gradient = ctx.createLinearGradient(
      0,
      currentY - fontSize,
      0,
      currentY + totalHeight,
    );
    gradient.addColorStop(0, settings.textColor);
    gradient.addColorStop(1, adjustColor(settings.textColor, -50));
    ctx.fillStyle = gradient;
    for (const line of lines) {
      ctx.fillText(line, textX, currentY);
      currentY += lineHeight;
    }
  } else {
    for (const line of lines) {
      ctx.fillText(line, textX, currentY);
      currentY += lineHeight;
    }
  }

  // Draw subtitle
  if (settings.subtitle) {
    currentY += 10;
    ctx.font = `400 ${subtitleFontSize}px ${currentFont.family}`;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = settings.textColor;
    ctx.fillText(settings.subtitle, textX, currentY);
    ctx.globalAlpha = 1;
    currentY += subtitleFontSize;
  }

  // Draw author
  if (settings.showAuthor && settings.author) {
    currentY += 30;
    ctx.font = `400 ${authorFontSize}px ${currentFont.family}`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(`by ${settings.author}`, textX, currentY);
    ctx.globalAlpha = 1;
  }
}

// ============================================================================
// Main Drawing Function
// ============================================================================

/**
 * Draw complete cover image on canvas
 */
export async function drawCoverImage(
  canvas: HTMLCanvasElement,
  settings: CoverSettings,
  currentFont: Font,
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const { width, height } = getCurrentSize(settings);
  canvas.width = width;
  canvas.height = height;

  // 1. Draw gradient background
  drawGradientBackground(ctx, settings, width, height);

  // 2. Draw pattern overlay
  if (settings.pattern !== "none") {
    drawPattern(ctx, settings.pattern, width, height, settings.patternOpacity);
  }

  // 3. Draw card overlay for card theme
  if (settings.theme === "card") {
    drawCardOverlay(ctx, width, height);
  }

  // 4. Draw icon or custom logo
  if (settings.devIcon !== "none" || settings.customLogo) {
    await drawIcon(ctx, settings, width, height);
  }

  // 5. Draw text content
  await drawText(ctx, settings, currentFont, width, height);
}
