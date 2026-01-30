// ============================================================================
// Cover Image Generator - Advanced Editor Types
// ============================================================================

// Element types for canvas editing
export type ElementType =
  | "text"
  | "shape"
  | "icon"
  | "badge"
  | "emoji"
  | "image";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Base element interface
export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
}

// Text element
export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  maxWidth?: number;
}

// Shape element
export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: "rectangle" | "circle" | "triangle" | "line" | "star" | "hexagon";
  size: Size;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

// Badge element
export interface BadgeElement extends BaseElement {
  type: "badge";
  badgeType: "new" | "tutorial" | "part" | "featured" | "custom";
  text: string;
  backgroundColor: string;
  textColor: string;
  size: "small" | "medium" | "large";
}

// Emoji element
export interface EmojiElement extends BaseElement {
  type: "emoji";
  emoji: string;
  size: number;
}

// Image element (for background or decorative)
export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  size: Size;
  objectFit: "cover" | "contain" | "fill";
  filters: ImageFilters;
}

// Image filters
export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
}

// Union type for all elements
export type CanvasElement =
  | TextElement
  | ShapeElement
  | BadgeElement
  | EmojiElement
  | ImageElement;

// History state for undo/redo
export interface HistoryState {
  elements: CanvasElement[];
  backgroundImage: string | null;
  timestamp: number;
}

// Background settings
export interface BackgroundSettings {
  type: "gradient" | "image" | "solid";
  image: string | null;
  imageFilters: ImageFilters;
  overlay: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

// Extended settings for advanced editor
export interface AdvancedEditorSettings {
  elements: CanvasElement[];
  selectedElementId: string | null;
  background: BackgroundSettings;
  snapToGrid: boolean;
  gridSize: number;
  showGuides: boolean;
}

// Default image filters
export const DEFAULT_IMAGE_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
};

// Default background settings
export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  type: "gradient",
  image: null,
  imageFilters: DEFAULT_IMAGE_FILTERS,
  overlay: {
    enabled: false,
    color: "#000000",
    opacity: 0.5,
  },
};

// Default advanced editor settings
export const DEFAULT_ADVANCED_EDITOR_SETTINGS: AdvancedEditorSettings = {
  elements: [],
  selectedElementId: null,
  background: DEFAULT_BACKGROUND_SETTINGS,
  snapToGrid: false,
  gridSize: 10,
  showGuides: true,
};

// Predefined badges
export const BADGE_PRESETS = [
  { id: "new", text: "NEW", bgColor: "#22c55e", textColor: "#ffffff" },
  {
    id: "tutorial",
    text: "TUTORIAL",
    bgColor: "#3b82f6",
    textColor: "#ffffff",
  },
  { id: "part-1", text: "PART 1", bgColor: "#8b5cf6", textColor: "#ffffff" },
  { id: "part-2", text: "PART 2", bgColor: "#8b5cf6", textColor: "#ffffff" },
  { id: "part-3", text: "PART 3", bgColor: "#8b5cf6", textColor: "#ffffff" },
  {
    id: "featured",
    text: "FEATURED",
    bgColor: "#f59e0b",
    textColor: "#ffffff",
  },
  { id: "updated", text: "UPDATED", bgColor: "#06b6d4", textColor: "#ffffff" },
  { id: "guide", text: "GUIDE", bgColor: "#ec4899", textColor: "#ffffff" },
  { id: "tip", text: "TIP", bgColor: "#10b981", textColor: "#ffffff" },
  { id: "free", text: "FREE", bgColor: "#ef4444", textColor: "#ffffff" },
];

// Popular emojis for cover images
export const EMOJI_PRESETS = [
  { id: "rocket", emoji: "🚀", name: "Rocket" },
  { id: "bulb", emoji: "💡", name: "Lightbulb" },
  { id: "fire", emoji: "🔥", name: "Fire" },
  { id: "star", emoji: "⭐", name: "Star" },
  { id: "sparkles", emoji: "✨", name: "Sparkles" },
  { id: "target", emoji: "🎯", name: "Target" },
  { id: "laptop", emoji: "💻", name: "Laptop" },
  { id: "books", emoji: "📚", name: "Books" },
  { id: "art", emoji: "🎨", name: "Art" },
  { id: "bolt", emoji: "⚡", name: "Bolt" },
  { id: "wrench", emoji: "🔧", name: "Wrench" },
  { id: "tools", emoji: "🛠️", name: "Tools" },
  { id: "phone", emoji: "📱", name: "Phone" },
  { id: "globe", emoji: "🌐", name: "Globe" },
  { id: "party", emoji: "🎉", name: "Party" },
  { id: "muscle", emoji: "💪", name: "Muscle" },
  { id: "lock", emoji: "🔒", name: "Lock" },
  { id: "chart1", emoji: "📊", name: "Bar Chart" },
  { id: "chart2", emoji: "📈", name: "Line Chart" },
  { id: "robot", emoji: "🤖", name: "Robot" },
  { id: "brain", emoji: "🧠", name: "Brain" },
  { id: "disk", emoji: "💾", name: "Disk" },
  { id: "cloud", emoji: "☁️", name: "Cloud" },
  { id: "key", emoji: "🔑", name: "Key" },
  { id: "grad", emoji: "🎓", name: "Graduation" },
  { id: "memo", emoji: "📝", name: "Memo" },
  { id: "check", emoji: "✅", name: "Check" },
  { id: "heart", emoji: "❤️", name: "Heart" },
  { id: "trophy", emoji: "🏆", name: "Trophy" },
  { id: "glow", emoji: "🌟", name: "Glow Star" },
  { id: "gem", emoji: "💎", name: "Gem" },
  { id: "gift", emoji: "🎁", name: "Gift" },
];

// Shape presets
export const SHAPE_PRESETS: {
  id: string;
  name: string;
  icon: string;
  shapeType: ShapeElement["shapeType"];
}[] = [
  { id: "rectangle", name: "Rectangle", icon: "▢", shapeType: "rectangle" },
  { id: "circle", name: "Circle", icon: "●", shapeType: "circle" },
  { id: "triangle", name: "Triangle", icon: "▲", shapeType: "triangle" },
  { id: "star", name: "Star", icon: "★", shapeType: "star" },
  { id: "hexagon", name: "Hexagon", icon: "⬡", shapeType: "hexagon" },
  { id: "line", name: "Line", icon: "─", shapeType: "line" },
];

// Social media preview configurations
export interface SocialPreviewConfig {
  id: string;
  name: string;
  icon: string;
  cardWidth: number;
  cardHeight: number;
  imageRatio: number;
  showTitle: boolean;
  showDescription: boolean;
  showUrl: boolean;
}

export const SOCIAL_PREVIEWS: Record<string, SocialPreviewConfig> = {
  twitter: {
    id: "twitter",
    name: "Twitter/X",
    icon: "𝕏",
    cardWidth: 506,
    cardHeight: 265,
    imageRatio: 1.91,
    showTitle: true,
    showDescription: true,
    showUrl: true,
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    cardWidth: 520,
    cardHeight: 272,
    imageRatio: 1.91,
    showTitle: true,
    showDescription: true,
    showUrl: true,
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    cardWidth: 500,
    cardHeight: 261,
    imageRatio: 1.91,
    showTitle: true,
    showDescription: true,
    showUrl: true,
  },
  discord: {
    id: "discord",
    name: "Discord",
    icon: "🎮",
    cardWidth: 400,
    cardHeight: 225,
    imageRatio: 1.78,
    showTitle: true,
    showDescription: true,
    showUrl: false,
  },
  slack: {
    id: "slack",
    name: "Slack",
    icon: "#",
    cardWidth: 360,
    cardHeight: 189,
    imageRatio: 1.91,
    showTitle: true,
    showDescription: false,
    showUrl: true,
  },
};

// Generate unique element ID
export function generateElementId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create default text element
export function createTextElement(
  content: string = "New Text",
  position: Position = { x: 100, y: 100 },
): TextElement {
  return {
    id: generateElementId(),
    type: "text",
    position,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    content,
    fontSize: 32,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 1.2,
  };
}

// Create default shape element
export function createShapeElement(
  shapeType: ShapeElement["shapeType"] = "rectangle",
  position: Position = { x: 100, y: 100 },
): ShapeElement {
  return {
    id: generateElementId(),
    type: "shape",
    position,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    shapeType,
    size: { width: 100, height: 100 },
    fill: "rgba(255, 255, 255, 0.2)",
    stroke: "rgba(255, 255, 255, 0.5)",
    strokeWidth: 2,
    cornerRadius: shapeType === "rectangle" ? 8 : 0,
  };
}

// Create badge element
export function createBadgeElement(
  badgePreset: (typeof BADGE_PRESETS)[0],
  position: Position = { x: 50, y: 50 },
): BadgeElement {
  return {
    id: generateElementId(),
    type: "badge",
    position,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    badgeType: "custom",
    text: badgePreset.text,
    backgroundColor: badgePreset.bgColor,
    textColor: badgePreset.textColor,
    size: "medium",
  };
}

// Create emoji element
export function createEmojiElement(
  emoji: string = "🚀",
  position: Position = { x: 100, y: 100 },
): EmojiElement {
  return {
    id: generateElementId(),
    type: "emoji",
    position,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    emoji,
    size: 48,
  };
}

// Create image element
export function createImageElement(
  src: string,
  position: Position = { x: 0, y: 0 },
  size: Size = { width: 200, height: 200 },
): ImageElement {
  return {
    id: generateElementId(),
    type: "image",
    position,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    src,
    size,
    objectFit: "cover",
    filters: DEFAULT_IMAGE_FILTERS,
  };
}
