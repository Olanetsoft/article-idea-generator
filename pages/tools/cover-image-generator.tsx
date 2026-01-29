import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  DownloadIcon,
  PhotographIcon,
  RefreshIcon,
  AdjustmentsIcon,
} from "@heroicons/react/outline";

// ============================================================================
// Constants
// ============================================================================

const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

// Image size presets for different platforms
const SIZE_PRESETS = [
  { id: "twitter", name: "Twitter/X", width: 1200, height: 675 },
  { id: "linkedin", name: "LinkedIn", width: 1200, height: 627 },
  { id: "devto", name: "Dev.to", width: 1000, height: 420 },
  { id: "medium", name: "Medium", width: 1400, height: 787 },
  { id: "hashnode", name: "Hashnode", width: 1600, height: 840 },
  { id: "og", name: "Open Graph", width: 1200, height: 630 },
  { id: "youtube", name: "YouTube", width: 1280, height: 720 },
  { id: "instagram", name: "Instagram", width: 1080, height: 1080 },
];

// Gradient presets
const GRADIENT_PRESETS = [
  { id: "purple-blue", name: "Purple Blue", colors: ["#667eea", "#764ba2"] },
  { id: "orange-red", name: "Sunset", colors: ["#f093fb", "#f5576c"] },
  { id: "green-teal", name: "Ocean", colors: ["#4facfe", "#00f2fe"] },
  {
    id: "dark-purple",
    name: "Midnight",
    colors: ["#0f0c29", "#302b63", "#24243e"],
  },
  { id: "pink-orange", name: "Flamingo", colors: ["#f857a6", "#ff5858"] },
  { id: "blue-cyan", name: "Sky", colors: ["#00c6fb", "#005bea"] },
  { id: "green-lime", name: "Forest", colors: ["#11998e", "#38ef7d"] },
  { id: "orange-yellow", name: "Sunrise", colors: ["#f12711", "#f5af19"] },
  { id: "indigo-pink", name: "Aurora", colors: ["#7028e4", "#e5b2ca"] },
  {
    id: "dark-blue",
    name: "Deep Sea",
    colors: ["#0f2027", "#203a43", "#2c5364"],
  },
  { id: "black", name: "Noir", colors: ["#232526", "#414345"] },
  { id: "white", name: "Clean", colors: ["#f5f7fa", "#c3cfe2"] },
];

// Pattern overlays
const PATTERNS = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "grid", name: "Grid" },
  { id: "diagonal", name: "Diagonal Lines" },
  { id: "waves", name: "Waves" },
  { id: "circuit", name: "Circuit" },
  { id: "noise", name: "Noise" },
];

// Font options
const FONTS = [
  { id: "inter", name: "Inter", family: "Inter, sans-serif" },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: "Space Grotesk, sans-serif",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: "Playfair Display, serif",
  },
  { id: "roboto-mono", name: "Roboto Mono", family: "Roboto Mono, monospace" },
  { id: "poppins", name: "Poppins", family: "Poppins, sans-serif" },
];

// Text alignment options
const ALIGNMENTS = [
  { id: "left", name: "Left" },
  { id: "center", name: "Center" },
  { id: "right", name: "Right" },
];

// ============================================================================
// Types
// ============================================================================

interface CoverSettings {
  title: string;
  subtitle: string;
  author: string;
  sizePreset: string;
  gradientPreset: string;
  pattern: string;
  font: string;
  textColor: string;
  textAlign: string;
  showAuthor: boolean;
  fontSize: number;
  padding: number;
}

const DEFAULT_SETTINGS: CoverSettings = {
  title: "Your Amazing Article Title Goes Here",
  subtitle: "",
  author: "",
  sizePreset: "twitter",
  gradientPreset: "purple-blue",
  pattern: "none",
  font: "space-grotesk",
  textColor: "#ffffff",
  textAlign: "center",
  showAuthor: false,
  fontSize: 64,
  padding: 60,
};

// ============================================================================
// Utility Functions
// ============================================================================

function getGradientCSS(gradientId: string): string {
  const gradient = GRADIENT_PRESETS.find((g) => g.id === gradientId);
  if (!gradient) return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  if (gradient.colors.length === 2) {
    return `linear-gradient(135deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%)`;
  }
  return `linear-gradient(135deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 50%, ${gradient.colors[2]} 100%)`;
}

function getPatternCSS(patternId: string, opacity: number = 0.1): string {
  switch (patternId) {
    case "dots":
      return `radial-gradient(circle, rgba(255,255,255,${opacity}) 1px, transparent 1px)`;
    case "grid":
      return `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`;
    case "diagonal":
      return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,${opacity}) 10px, rgba(255,255,255,${opacity}) 11px)`;
    case "waves":
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(255,255,255,${opacity})' d='M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`;
    case "circuit":
      return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='rgba(255,255,255,${opacity})' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
    case "noise":
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${opacity}'/%3E%3C/svg%3E")`;
    default:
      return "none";
  }
}

function getPatternSize(patternId: string): string {
  switch (patternId) {
    case "dots":
      return "20px 20px";
    case "grid":
      return "20px 20px, 20px 20px";
    case "diagonal":
      return "auto";
    case "circuit":
      return "60px 60px";
    default:
      return "cover";
  }
}

// ============================================================================
// Main Component
// ============================================================================

export default function CoverImageGeneratorPage(): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const [settings, setSettings] = useState<CoverSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hasTrackedUsage = useRef(false);

  // Get current size
  const currentSize =
    SIZE_PRESETS.find((s) => s.id === settings.sizePreset) || SIZE_PRESETS[0];
  const currentFont = FONTS.find((f) => f.id === settings.font) || FONTS[0];

  // Update a setting
  const updateSetting = useCallback(
    <K extends keyof CoverSettings>(key: K, value: CoverSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Generate and download image
  const handleDownload = useCallback(async () => {
    if (!hasTrackedUsage.current) {
      trackToolUsage("cover_image_generator", "download");
      hasTrackedUsage.current = true;
    }

    setIsGenerating(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = currentSize.width;
      canvas.height = currentSize.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas not supported");
      }

      // Draw gradient background
      const gradient = GRADIENT_PRESETS.find(
        (g) => g.id === settings.gradientPreset,
      );
      if (gradient) {
        const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.colors.forEach((color, index) => {
          grd.addColorStop(index / (gradient.colors.length - 1), color);
        });
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw pattern overlay
      if (settings.pattern !== "none") {
        ctx.globalAlpha = 0.1;
        // For complex patterns, we'd need to draw SVG or use pattern fills
        // Simplified for now with basic shapes
        if (settings.pattern === "dots") {
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          for (let x = 0; x < canvas.width; x += 30) {
            for (let y = 0; y < canvas.height; y += 30) {
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (settings.pattern === "grid") {
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // Draw text
      ctx.fillStyle = settings.textColor;
      ctx.textAlign = settings.textAlign as CanvasTextAlign;

      const padding = settings.padding;
      const maxWidth = canvas.width - padding * 2;

      // Calculate x position based on alignment
      let textX = padding;
      if (settings.textAlign === "center") {
        textX = canvas.width / 2;
      } else if (settings.textAlign === "right") {
        textX = canvas.width - padding;
      }

      // Draw title with word wrap
      const fontSize = settings.fontSize;
      ctx.font = `bold ${fontSize}px ${currentFont.family}`;

      const words = settings.title.split(" ");
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

      // Calculate total text height
      const lineHeight = fontSize * 1.2;
      const subtitleFontSize = fontSize * 0.4;
      const authorFontSize = fontSize * 0.35;

      let totalHeight = lines.length * lineHeight;
      if (settings.subtitle) totalHeight += subtitleFontSize + 20;
      if (settings.showAuthor && settings.author)
        totalHeight += authorFontSize + 30;

      // Start Y position (vertically centered)
      let currentY = (canvas.height - totalHeight) / 2 + fontSize * 0.8;

      // Draw title lines
      for (const line of lines) {
        ctx.fillText(line, textX, currentY);
        currentY += lineHeight;
      }

      // Draw subtitle
      if (settings.subtitle) {
        currentY += 10;
        ctx.font = `${subtitleFontSize}px ${currentFont.family}`;
        ctx.globalAlpha = 0.8;
        ctx.fillText(settings.subtitle, textX, currentY);
        ctx.globalAlpha = 1;
        currentY += subtitleFontSize;
      }

      // Draw author
      if (settings.showAuthor && settings.author) {
        currentY += 30;
        ctx.font = `${authorFontSize}px ${currentFont.family}`;
        ctx.globalAlpha = 0.7;
        ctx.fillText(`by ${settings.author}`, textX, currentY);
        ctx.globalAlpha = 1;
      }

      // Download
      const link = document.createElement("a");
      link.download = `cover-${settings.sizePreset}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success(t("tools.coverImage.downloadSuccess"));
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error(t("tools.coverImage.downloadError"));
    } finally {
      setIsGenerating(false);
    }
  }, [settings, currentSize, currentFont, t]);

  // Randomize settings
  const handleRandomize = () => {
    const randomGradient =
      GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
    const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];

    updateSetting("gradientPreset", randomGradient.id);
    updateSetting("pattern", randomPattern.id);
    updateSetting("font", randomFont.id);

    toast.success(t("tools.coverImage.randomized"));
  };

  // SEO
  const { locale: currentLocale, locales, defaultLocale } = router;
  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/cover-image-generator`
      : `${SITE_URL}/${currentLocale}/tools/cover-image-generator`;

  const ogLocale = LOCALE_MAP[currentLocale || "en"] || "en_US";

  // Preview styles
  const previewStyle = {
    background: getGradientCSS(settings.gradientPreset),
    aspectRatio: `${currentSize.width}/${currentSize.height}`,
  };

  const patternStyle =
    settings.pattern !== "none"
      ? {
          backgroundImage: getPatternCSS(settings.pattern),
          backgroundSize: getPatternSize(settings.pattern),
        }
      : {};

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-dark-bg dark:to-darkOffset">
      <Head>
        <title>{t("tools.coverImage.pageTitle")}</title>
        <meta
          name="description"
          content={t("tools.coverImage.pageDescription")}
        />
        <meta
          name="keywords"
          content="cover image generator, blog cover, article header, social media image, twitter card, og image, thumbnail generator, free cover maker"
        />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={t("tools.coverImage.pageTitle")} />
        <meta
          property="og:description"
          content={t("tools.coverImage.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={ogLocale} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("tools.coverImage.pageTitle")} />
        <meta
          name="twitter:description"
          content={t("tools.coverImage.pageDescription")}
        />

        {/* Alternate languages */}
        {locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/cover-image-generator`
                : `${SITE_URL}/${locale}/tools/cover-image-generator`
            }
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.coverImage.name"),
              description: t("tools.coverImage.pageDescription"),
              url: pageUrl,
              applicationCategory: "DesignApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </Head>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Header />

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="w-full max-w-6xl mb-4">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Tools
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              Cover Image Generator
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 w-full max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium mb-4">
            <PhotographIcon className="w-3.5 h-3.5" />
            {t("tools.coverImage.badge")}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.coverImage.title")}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.coverImage.subtitle")}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-6 space-y-5">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tools.coverImage.titleLabel")}
                  </label>
                  <textarea
                    value={settings.title}
                    onChange={(e) => updateSetting("title", e.target.value)}
                    placeholder={t("tools.coverImage.titlePlaceholder")}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                {/* Subtitle Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tools.coverImage.subtitleLabel")}
                  </label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={(e) => updateSetting("subtitle", e.target.value)}
                    placeholder={t("tools.coverImage.subtitlePlaceholder")}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Author */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("tools.coverImage.authorLabel")}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showAuthor}
                        onChange={(e) =>
                          updateSetting("showAuthor", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      {t("tools.coverImage.showAuthor")}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.author}
                    onChange={(e) => updateSetting("author", e.target.value)}
                    placeholder={t("tools.coverImage.authorPlaceholder")}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Size Preset */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tools.coverImage.sizeLabel")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => updateSetting("sizePreset", preset.id)}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                          settings.sizePreset === preset.id
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-gray-50 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-violet-400"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {currentSize.width} × {currentSize.height}px
                  </p>
                </div>

                {/* Gradient Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tools.coverImage.backgroundLabel")}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {GRADIENT_PRESETS.map((gradient) => (
                      <button
                        key={gradient.id}
                        onClick={() =>
                          updateSetting("gradientPreset", gradient.id)
                        }
                        title={gradient.name}
                        className={`aspect-square rounded-lg border-2 transition-all ${
                          settings.gradientPreset === gradient.id
                            ? "border-violet-600 scale-105 shadow-lg"
                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        style={{ background: getGradientCSS(gradient.id) }}
                      />
                    ))}
                  </div>
                </div>

                {/* Pattern */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tools.coverImage.patternLabel")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PATTERNS.map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => updateSetting("pattern", pattern.id)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          settings.pattern === pattern.id
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-gray-50 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-violet-400"
                        }`}
                      >
                        {pattern.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font & Alignment Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Font */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("tools.coverImage.fontLabel")}
                    </label>
                    <select
                      value={settings.font}
                      onChange={(e) => updateSetting("font", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {FONTS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("tools.coverImage.alignLabel")}
                    </label>
                    <div className="flex gap-1">
                      {ALIGNMENTS.map((align) => (
                        <button
                          key={align.id}
                          onClick={() => updateSetting("textAlign", align.id)}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                            settings.textAlign === align.id
                              ? "bg-violet-600 text-white border-violet-600"
                              : "bg-gray-50 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-violet-400"
                          }`}
                        >
                          {align.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tools.coverImage.fontSizeLabel")}: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="32"
                    max="120"
                    value={settings.fontSize}
                    onChange={(e) =>
                      updateSetting("fontSize", parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleRandomize}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-dark-border transition-colors border border-gray-200 dark:border-dark-border"
                  >
                    <RefreshIcon className="w-5 h-5" />
                    {t("tools.coverImage.randomize")}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isGenerating || !settings.title.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("tools.coverImage.generating")}
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="w-5 h-5" />
                        {t("tools.coverImage.download")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                <h2 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <AdjustmentsIcon className="w-5 h-5 text-gray-500" />
                  {t("tools.coverImage.preview")}
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {/* Preview Container */}
                <div
                  ref={previewRef}
                  className="relative w-full overflow-hidden rounded-xl shadow-lg"
                  style={previewStyle}
                >
                  {/* Pattern Overlay */}
                  {settings.pattern !== "none" && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={patternStyle}
                    />
                  )}

                  {/* Text Content */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-8 ${
                      settings.textAlign === "center"
                        ? "items-center text-center"
                        : settings.textAlign === "right"
                          ? "items-end text-right"
                          : "items-start text-left"
                    }`}
                    style={{ color: settings.textColor }}
                  >
                    <h2
                      className="font-bold leading-tight"
                      style={{
                        fontFamily: currentFont.family,
                        fontSize: `clamp(1rem, ${settings.fontSize / 20}vw, ${settings.fontSize / 16}rem)`,
                      }}
                    >
                      {settings.title || t("tools.coverImage.titlePlaceholder")}
                    </h2>
                    {settings.subtitle && (
                      <p
                        className="mt-2 opacity-80"
                        style={{
                          fontFamily: currentFont.family,
                          fontSize: `clamp(0.5rem, ${settings.fontSize / 50}vw, ${settings.fontSize / 40}rem)`,
                        }}
                      >
                        {settings.subtitle}
                      </p>
                    )}
                    {settings.showAuthor && settings.author && (
                      <p
                        className="mt-4 opacity-70"
                        style={{
                          fontFamily: currentFont.family,
                          fontSize: `clamp(0.4rem, ${settings.fontSize / 60}vw, ${settings.fontSize / 48}rem)`,
                        }}
                      >
                        by {settings.author}
                      </p>
                    )}
                  </div>
                </div>

                {/* Size info */}
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {currentSize.name} — {currentSize.width} ×{" "}
                  {currentSize.height}px
                </p>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("tools.coverImage.featuresTitle")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("tools.coverImage.featuresDescription")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: "🎨",
                  titleKey: "tools.coverImage.featureGradientsTitle",
                  descKey: "tools.coverImage.featureGradientsDesc",
                },
                {
                  icon: "📐",
                  titleKey: "tools.coverImage.featureSizesTitle",
                  descKey: "tools.coverImage.featureSizesDesc",
                },
                {
                  icon: "✍️",
                  titleKey: "tools.coverImage.featureFontsTitle",
                  descKey: "tools.coverImage.featureFontsDesc",
                },
                {
                  icon: "🔲",
                  titleKey: "tools.coverImage.featurePatternsTitle",
                  descKey: "tools.coverImage.featurePatternsDesc",
                },
                {
                  icon: "⚡",
                  titleKey: "tools.coverImage.featureInstantTitle",
                  descKey: "tools.coverImage.featureInstantDesc",
                },
                {
                  icon: "💾",
                  titleKey: "tools.coverImage.featureDownloadTitle",
                  descKey: "tools.coverImage.featureDownloadDesc",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(feature.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
