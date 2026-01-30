/**
 * Constants and configuration for PDF Signer tool
 * Centralized configuration to maintain DRY principles
 */

// ============================================================================
// Tool Type Definitions
// ============================================================================

export const TOOL_TYPES = [
  { id: "signature", label: "Signature", iconType: "signature" },
  { id: "fullname", label: "Full Name", iconType: "fullname" },
  { id: "initials", label: "Initials", iconType: "initials" },
  { id: "text", label: "Text", iconType: "text" },
  { id: "date", label: "Date", iconType: "date" },
  { id: "checkbox", label: "Checkbox", iconType: "checkbox" },
  { id: "highlight", label: "Highlight", iconType: "highlight" },
  { id: "circle", label: "Circle", iconType: "circle" },
  { id: "rectangle", label: "Rectangle", iconType: "rectangle" },
  { id: "line", label: "Line", iconType: "line" },
  { id: "arrow", label: "Arrow", iconType: "arrow" },
  { id: "strikethrough", label: "Strike", iconType: "strikethrough" },
  { id: "image", label: "Image", iconType: "image" },
] as const;

export type ToolType = (typeof TOOL_TYPES)[number]["id"];

// ============================================================================
// Element Default Configurations
// ============================================================================

export interface ElementDefaults {
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  fontSize?: number;
}

/**
 * Default dimensions and styles for each tool type
 * Used when placing new elements on the PDF
 */
export const ELEMENT_DEFAULTS: Record<ToolType, ElementDefaults> = {
  signature: { width: 150, height: 60 },
  fullname: { width: 180, height: 30, fontSize: 14 },
  initials: { width: 60, height: 40, fontSize: 24 },
  text: { width: 150, height: 30, fontSize: 14 },
  date: { width: 120, height: 30, fontSize: 14 },
  checkbox: { width: 24, height: 24 },
  highlight: { width: 200, height: 20, color: "rgba(255, 255, 0, 0.4)" },
  circle: { width: 80, height: 80, color: "#FF0000", strokeWidth: 2 },
  rectangle: { width: 100, height: 60, color: "#0000FF", strokeWidth: 2 },
  line: { width: 150, height: 4, color: "#000000", strokeWidth: 2 },
  arrow: { width: 150, height: 20, color: "#000000", strokeWidth: 2 },
  strikethrough: { width: 150, height: 3, color: "#FF0000", strokeWidth: 2 },
  image: { width: 100, height: 100 },
};

// ============================================================================
// Signature Font Options
// ============================================================================

export const SIGNATURE_FONTS: readonly { name: string; style: string }[] = [
  { name: "Dancing Script", style: "cursive" },
  { name: "Great Vibes", style: "cursive" },
  { name: "Pacifico", style: "cursive" },
  { name: "Caveat", style: "cursive" },
  { name: "Satisfy", style: "cursive" },
];

// ============================================================================
// Color Options
// ============================================================================

export const HIGHLIGHT_COLORS = [
  { value: "rgba(255, 255, 0, 0.4)", label: "Yellow" },
  { value: "rgba(0, 255, 0, 0.4)", label: "Green" },
  { value: "rgba(255, 0, 0, 0.4)", label: "Red" },
  { value: "rgba(0, 0, 255, 0.4)", label: "Blue" },
  { value: "rgba(255, 165, 0, 0.4)", label: "Orange" },
] as const;

export const STROKE_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#FF0000", label: "Red" },
  { value: "#0000FF", label: "Blue" },
  { value: "#008000", label: "Green" },
  { value: "#800080", label: "Purple" },
] as const;

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48] as const;

export const STROKE_WIDTHS = [1, 2, 3, 4, 5, 6] as const;

// ============================================================================
// Tool Categories
// ============================================================================

/** Tools that support color customization */
export const COLOR_TOOLS: ToolType[] = [
  "highlight",
  "circle",
  "rectangle",
  "line",
  "arrow",
  "strikethrough",
];

/** Tools that support stroke width customization */
export const STROKE_TOOLS: ToolType[] = [
  "circle",
  "rectangle",
  "line",
  "arrow",
  "strikethrough",
];

/** Tools that support font size customization */
export const FONT_SIZE_TOOLS: ToolType[] = ["text", "fullname"];

// ============================================================================
// File Constraints
// ============================================================================

export const FILE_CONSTRAINTS = {
  pdf: {
    maxSize: 50 * 1024 * 1024, // 50MB
    acceptedTypes: ["application/pdf"],
    acceptString: ".pdf,application/pdf",
  },
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    acceptString: "image/*",
  },
} as const;

// ============================================================================
// Zoom Configuration
// ============================================================================

export const ZOOM_CONFIG = {
  min: 0.5,
  max: 3,
  step: 0.25,
  default: 1,
} as const;

// ============================================================================
// Resize Handle Positions
// ============================================================================

export const RESIZE_HANDLES = [
  "nw",
  "ne",
  "sw",
  "se",
  "n",
  "s",
  "e",
  "w",
] as const;

export type ResizeHandlePosition = (typeof RESIZE_HANDLES)[number];

export const RESIZE_HANDLE_CURSORS: Record<ResizeHandlePosition, string> = {
  nw: "cursor-nw-resize",
  ne: "cursor-ne-resize",
  sw: "cursor-sw-resize",
  se: "cursor-se-resize",
  n: "cursor-n-resize",
  s: "cursor-s-resize",
  e: "cursor-e-resize",
  w: "cursor-w-resize",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Derive initials from a full name
 * @param name - The full name to extract initials from
 * @returns Two-letter initials (e.g., "John Doe" → "JD")
 */
export const getInitialsFromName = (name: string): string => {
  if (!name.trim()) return "AB";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

/**
 * Check if a tool supports color customization
 */
export const hasColorSupport = (toolType: ToolType): boolean =>
  COLOR_TOOLS.includes(toolType);

/**
 * Check if a tool supports stroke width customization
 */
export const hasStrokeSupport = (toolType: ToolType): boolean =>
  STROKE_TOOLS.includes(toolType);

/**
 * Check if a tool supports font size customization
 */
export const hasFontSizeSupport = (toolType: ToolType): boolean =>
  FONT_SIZE_TOOLS.includes(toolType);

/**
 * Get element defaults for a specific tool type
 */
export const getElementDefaults = (toolType: ToolType): ElementDefaults =>
  ELEMENT_DEFAULTS[toolType];
