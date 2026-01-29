// ============================================================================
// Cover Image Generator - Constants & Configuration
// ============================================================================

export interface SizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "social" | "blog" | "general";
}

export interface GradientPreset {
  id: string;
  name: string;
  colors: string[];
  category: "vibrant" | "dark" | "nature" | "minimal";
}

export interface Pattern {
  id: string;
  name: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface Font {
  id: string;
  name: string;
  family: string;
  weight: string;
}

export interface DevIcon {
  id: string;
  name: string;
  icon: string | null;
}

export interface Template {
  id: string;
  name: string;
  preview: string;
  settings: Partial<CoverSettings>;
}

export interface CoverSettings {
  title: string;
  subtitle: string;
  author: string;
  sizePreset: string;
  customWidth: number;
  customHeight: number;
  gradientPreset: string;
  customGradientStart: string;
  customGradientEnd: string;
  useCustomGradient: boolean;
  gradientAngle: number;
  pattern: string;
  patternOpacity: number;
  theme: string;
  font: string;
  textColor: string;
  textAlign: "left" | "center" | "right";
  showAuthor: boolean;
  fontSize: number;
  padding: number;
  devIcon: string;
  customLogo: string | null;
  logoSize: number;
  borderRadius: number;
}

export type TabId = "content" | "style" | "layout" | "export";

// Storage key for localStorage
export const STORAGE_KEY = "cover-image-generator-settings";

// Platform size presets
export const SIZE_PRESETS: SizePreset[] = [
  // Social Media
  {
    id: "twitter",
    name: "Twitter/X",
    width: 1200,
    height: 675,
    category: "social",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    width: 1200,
    height: 627,
    category: "social",
  },
  {
    id: "facebook",
    name: "Facebook",
    width: 1200,
    height: 630,
    category: "social",
  },
  {
    id: "instagram-landscape",
    name: "Instagram Landscape",
    width: 1080,
    height: 566,
    category: "social",
  },
  {
    id: "instagram-square",
    name: "Instagram Square",
    width: 1080,
    height: 1080,
    category: "social",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    category: "social",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    width: 1000,
    height: 1500,
    category: "social",
  },
  {
    id: "youtube",
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    category: "social",
  },
  // Blogging Platforms
  { id: "devto", name: "Dev.to", width: 1000, height: 420, category: "blog" },
  { id: "medium", name: "Medium", width: 1400, height: 787, category: "blog" },
  {
    id: "hashnode",
    name: "Hashnode",
    width: 1600,
    height: 840,
    category: "blog",
  },
  {
    id: "substack",
    name: "Substack",
    width: 1456,
    height: 816,
    category: "blog",
  },
  { id: "ghost", name: "Ghost", width: 2000, height: 1200, category: "blog" },
  {
    id: "wordpress",
    name: "WordPress",
    width: 1200,
    height: 628,
    category: "blog",
  },
  // General
  {
    id: "og",
    name: "Open Graph",
    width: 1200,
    height: 630,
    category: "general",
  },
  {
    id: "custom",
    name: "Custom Size",
    width: 1600,
    height: 900,
    category: "general",
  },
];

// Gradient presets organized by mood
export const GRADIENT_PRESETS: GradientPreset[] = [
  // Vibrant
  {
    id: "purple-blue",
    name: "Purple Dream",
    colors: ["#667eea", "#764ba2"],
    category: "vibrant",
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    colors: ["#f093fb", "#f5576c"],
    category: "vibrant",
  },
  {
    id: "ocean",
    name: "Ocean Wave",
    colors: ["#4facfe", "#00f2fe"],
    category: "vibrant",
  },
  {
    id: "flamingo",
    name: "Flamingo",
    colors: ["#f857a6", "#ff5858"],
    category: "vibrant",
  },
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#7028e4", "#e5b2ca"],
    category: "vibrant",
  },
  {
    id: "citrus",
    name: "Citrus Punch",
    colors: ["#f5af19", "#f12711"],
    category: "vibrant",
  },
  {
    id: "neon",
    name: "Neon Lights",
    colors: ["#00d2ff", "#3a47d5"],
    category: "vibrant",
  },
  {
    id: "candy",
    name: "Cotton Candy",
    colors: ["#d299c2", "#fef9d7"],
    category: "vibrant",
  },
  // Dark & Professional
  {
    id: "midnight",
    name: "Midnight",
    colors: ["#0f0c29", "#302b63", "#24243e"],
    category: "dark",
  },
  {
    id: "deep-sea",
    name: "Deep Sea",
    colors: ["#0f2027", "#203a43", "#2c5364"],
    category: "dark",
  },
  {
    id: "noir",
    name: "Noir",
    colors: ["#232526", "#414345"],
    category: "dark",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    colors: ["#1a1a2e", "#16213e", "#0f3460"],
    category: "dark",
  },
  {
    id: "space",
    name: "Deep Space",
    colors: ["#000428", "#004e92"],
    category: "dark",
  },
  {
    id: "dark-violet",
    name: "Dark Violet",
    colors: ["#1a0533", "#4a0066", "#240046"],
    category: "dark",
  },
  // Nature
  {
    id: "forest",
    name: "Forest",
    colors: ["#11998e", "#38ef7d"],
    category: "nature",
  },
  {
    id: "sky",
    name: "Clear Sky",
    colors: ["#00c6fb", "#005bea"],
    category: "nature",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    colors: ["#ff512f", "#f09819"],
    category: "nature",
  },
  {
    id: "meadow",
    name: "Meadow",
    colors: ["#56ab2f", "#a8e063"],
    category: "nature",
  },
  {
    id: "autumn",
    name: "Autumn Leaves",
    colors: ["#d38312", "#a83279"],
    category: "nature",
  },
  {
    id: "ocean-deep",
    name: "Ocean Deep",
    colors: ["#1a2980", "#26d0ce"],
    category: "nature",
  },
  // Minimal & Clean
  {
    id: "clean",
    name: "Clean White",
    colors: ["#f5f7fa", "#c3cfe2"],
    category: "minimal",
  },
  {
    id: "soft-gray",
    name: "Soft Gray",
    colors: ["#e0eafc", "#cfdef3"],
    category: "minimal",
  },
  {
    id: "cream",
    name: "Cream",
    colors: ["#fffdf9", "#f5ebe0"],
    category: "minimal",
  },
  {
    id: "misty",
    name: "Misty Rose",
    colors: ["#eecda3", "#ef629f"],
    category: "minimal",
  },
];

// Pattern overlays
export const PATTERNS: Pattern[] = [
  { id: "none", name: "None" },
  { id: "dots", name: "Polka Dots" },
  { id: "grid", name: "Grid" },
  { id: "diagonal", name: "Diagonal Lines" },
  { id: "waves", name: "Waves" },
  { id: "circuit", name: "Circuit Board" },
  { id: "topography", name: "Topography" },
  { id: "hexagons", name: "Hexagons" },
  { id: "triangles", name: "Triangles" },
  { id: "crosses", name: "Crosses" },
  { id: "noise", name: "Noise/Grain" },
  { id: "confetti", name: "Confetti" },
];

// Theme layouts
export const THEMES: Theme[] = [
  {
    id: "centered",
    name: "Centered",
    description: "Title centered with optional icon",
  },
  {
    id: "modern",
    name: "Modern Split",
    description: "Split layout with icon on left",
  },
  { id: "minimal", name: "Minimal", description: "Clean and simple" },
  { id: "bold", name: "Bold", description: "Large text, high impact" },
  { id: "card", name: "Card", description: "Content in a card overlay" },
  {
    id: "corner",
    name: "Corner Badge",
    description: "Title with corner decoration",
  },
  {
    id: "gradient-text",
    name: "Gradient Text",
    description: "Gradient applied to text",
  },
  {
    id: "outlined",
    name: "Outlined",
    description: "Text with outline/stroke effect",
  },
];

// Font options
export const FONTS: Font[] = [
  {
    id: "inter",
    name: "Inter",
    family: "Inter, system-ui, sans-serif",
    weight: "700",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: "'Space Grotesk', sans-serif",
    weight: "700",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: "'Playfair Display', Georgia, serif",
    weight: "700",
  },
  {
    id: "roboto-mono",
    name: "Roboto Mono",
    family: "'Roboto Mono', monospace",
    weight: "700",
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "Poppins, sans-serif",
    weight: "700",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat, sans-serif",
    weight: "800",
  },
  {
    id: "bebas",
    name: "Bebas Neue",
    family: "'Bebas Neue', Impact, sans-serif",
    weight: "400",
  },
  {
    id: "fira-code",
    name: "Fira Code",
    family: "'Fira Code', monospace",
    weight: "600",
  },
];

// Dev icons from devicon CDN
export const DEV_ICONS: DevIcon[] = [
  { id: "none", name: "No Icon", icon: null },
  { id: "react", name: "React", icon: "react" },
  { id: "nextjs", name: "Next.js", icon: "nextjs" },
  { id: "typescript", name: "TypeScript", icon: "typescript" },
  { id: "javascript", name: "JavaScript", icon: "javascript" },
  { id: "nodejs", name: "Node.js", icon: "nodejs" },
  { id: "python", name: "Python", icon: "python" },
  { id: "rust", name: "Rust", icon: "rust" },
  { id: "go", name: "Go", icon: "go" },
  { id: "docker", name: "Docker", icon: "docker" },
  { id: "kubernetes", name: "Kubernetes", icon: "kubernetes" },
  { id: "aws", name: "AWS", icon: "amazonwebservices" },
  { id: "firebase", name: "Firebase", icon: "firebase" },
  { id: "postgresql", name: "PostgreSQL", icon: "postgresql" },
  { id: "mongodb", name: "MongoDB", icon: "mongodb" },
  { id: "graphql", name: "GraphQL", icon: "graphql" },
  { id: "tailwindcss", name: "Tailwind CSS", icon: "tailwindcss" },
  { id: "vue", name: "Vue.js", icon: "vuejs" },
  { id: "angular", name: "Angular", icon: "angularjs" },
  { id: "svelte", name: "Svelte", icon: "svelte" },
  { id: "java", name: "Java", icon: "java" },
  { id: "csharp", name: "C#", icon: "csharp" },
  { id: "swift", name: "Swift", icon: "swift" },
  { id: "kotlin", name: "Kotlin", icon: "kotlin" },
  { id: "flutter", name: "Flutter", icon: "flutter" },
  { id: "git", name: "Git", icon: "git" },
  { id: "github", name: "GitHub", icon: "github" },
  { id: "linux", name: "Linux", icon: "linux" },
  { id: "vscode", name: "VS Code", icon: "vscode" },
  { id: "figma", name: "Figma", icon: "figma" },
];

// Quick-start templates
export const TEMPLATES: Template[] = [
  {
    id: "tech-blog",
    name: "Tech Blog",
    preview: "🚀",
    settings: {
      gradientPreset: "purple-blue",
      pattern: "circuit",
      theme: "centered",
      font: "space-grotesk",
      textColor: "#ffffff",
      fontSize: 64,
      devIcon: "react",
    },
  },
  {
    id: "tutorial",
    name: "Tutorial",
    preview: "📚",
    settings: {
      gradientPreset: "ocean",
      pattern: "dots",
      theme: "modern",
      font: "inter",
      textColor: "#ffffff",
      fontSize: 56,
      devIcon: "none",
    },
  },
  {
    id: "announcement",
    name: "Announcement",
    preview: "📢",
    settings: {
      gradientPreset: "sunset",
      pattern: "none",
      theme: "bold",
      font: "montserrat",
      textColor: "#ffffff",
      fontSize: 72,
      devIcon: "none",
    },
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    preview: "🌙",
    settings: {
      gradientPreset: "noir",
      pattern: "noise",
      theme: "minimal",
      font: "inter",
      textColor: "#ffffff",
      fontSize: 60,
      devIcon: "none",
    },
  },
  {
    id: "professional",
    name: "Professional",
    preview: "💼",
    settings: {
      gradientPreset: "deep-sea",
      pattern: "topography",
      theme: "card",
      font: "playfair",
      textColor: "#ffffff",
      fontSize: 52,
      devIcon: "none",
    },
  },
  {
    id: "vibrant",
    name: "Vibrant",
    preview: "🎨",
    settings: {
      gradientPreset: "citrus",
      pattern: "confetti",
      theme: "corner",
      font: "poppins",
      textColor: "#ffffff",
      fontSize: 58,
      devIcon: "none",
    },
  },
  {
    id: "code-focused",
    name: "Code Focused",
    preview: "💻",
    settings: {
      gradientPreset: "charcoal",
      pattern: "grid",
      theme: "outlined",
      font: "fira-code",
      textColor: "#00ff88",
      fontSize: 54,
      devIcon: "vscode",
    },
  },
  {
    id: "clean-light",
    name: "Clean Light",
    preview: "✨",
    settings: {
      gradientPreset: "clean",
      pattern: "none",
      theme: "minimal",
      font: "inter",
      textColor: "#1a1a2e",
      fontSize: 56,
      devIcon: "none",
    },
  },
];

// Default settings
export const DEFAULT_SETTINGS: CoverSettings = {
  title: "Your Amazing Article Title Goes Here",
  subtitle: "",
  author: "",
  sizePreset: "twitter",
  customWidth: 1600,
  customHeight: 900,
  gradientPreset: "purple-blue",
  customGradientStart: "#667eea",
  customGradientEnd: "#764ba2",
  useCustomGradient: false,
  gradientAngle: 135,
  pattern: "none",
  patternOpacity: 0.1,
  theme: "centered",
  font: "space-grotesk",
  textColor: "#ffffff",
  textAlign: "center",
  showAuthor: false,
  fontSize: 64,
  padding: 60,
  devIcon: "none",
  customLogo: null,
  logoSize: 80,
  borderRadius: 0,
};

// Quick color presets for text
export const TEXT_COLOR_PRESETS = [
  "#ffffff",
  "#000000",
  "#f8fafc",
  "#1e293b",
  "#00ff88",
  "#ff6b6b",
];

// Size categories for display
export const SIZE_CATEGORIES = [
  { id: "social", label: "Social Media" },
  { id: "blog", label: "Blogging Platforms" },
  { id: "general", label: "General" },
] as const;
