// ============================================================================
// Cover Image Generator - Module Index
// ============================================================================

// Constants & Types
export * from "./constants";

// Advanced Editor Types
export * from "./editor-types";

// Pattern utilities
export { drawPattern, getPatternSVG } from "./patterns";

// Canvas utilities
export {
  getCurrentSize,
  getGradientCSS,
  adjustColor,
  getFontById,
  drawCoverImage,
} from "./canvas";

// Canvas Editor (Fabric.js integration)
export { useCanvasEditor } from "./canvas-editor";
