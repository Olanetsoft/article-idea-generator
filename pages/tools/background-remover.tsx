// ============================================================================
// Background Remover - AI-Powered Background Removal Tool
// Uses @imgly/background-removal for client-side processing
// ============================================================================

import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  UploadIcon,
  DownloadIcon,
  PhotographIcon,
  RefreshIcon,
  SparklesIcon,
  ShieldCheckIcon,
  LightningBoltIcon,
  ColorSwatchIcon,
  AdjustmentsIcon,
  CheckCircleIcon,
  XIcon,
  ChevronLeftIcon,
} from "@heroicons/react/outline";

// ============================================================================
// Types
// ============================================================================

type BackgroundType = "transparent" | "solid" | "image" | "blur";

interface ProcessingState {
  status: "idle" | "loading" | "processing" | "done" | "error";
  progress: number;
  message: string;
}

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

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#808080",
  "#FFA500",
  "#800080",
  "#008080",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// ============================================================================
// Feature Card Component
// ============================================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export default function BackgroundRemover() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [foregroundBlob, setForegroundBlob] = useState<Blob | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: "idle",
    progress: 0,
    message: "",
  });

  // Background options
  const [backgroundType, setBackgroundType] =
    useState<BackgroundType>("transparent");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Comparison slider
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);

  // Load recent colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bg-remover-recent-colors");
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved));
      } catch {
        // Ignore
      }
    }
  }, []);

  // Save recent colors
  const addRecentColor = useCallback((color: string) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      const updated = [color, ...filtered].slice(0, 8);
      localStorage.setItem("bg-remover-recent-colors", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or WebP image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 20MB");
      return;
    }

    // Reset state
    setProcessedImage(null);
    setForegroundBlob(null);
    setBackgroundType("transparent");

    // Read and display original
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start processing
    setProcessingState({
      status: "loading",
      progress: 0,
      message: "Loading AI model...",
    });

    try {
      // Dynamic import to avoid SSR issues
      const { removeBackground } = await import("@imgly/background-removal");

      setProcessingState({
        status: "processing",
        progress: 20,
        message: "Analyzing image...",
      });

      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          const progress = Math.round((current / total) * 100);
          setProcessingState({
            status: "processing",
            progress: 20 + progress * 0.8,
            message:
              key === "fetch:inference"
                ? "Removing background..."
                : "Processing...",
          });
        },
      });

      setForegroundBlob(blob);

      // Convert blob to data URL for display
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);

      setProcessingState({
        status: "done",
        progress: 100,
        message: "Complete!",
      });

      trackToolUsage("background-remover", "process");
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error removing background:", error);
      setProcessingState({
        status: "error",
        progress: 0,
        message: "Failed to process image",
      });
      toast.error("Failed to remove background. Please try again.");
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Composite final image with background
  const compositeImage = useCallback(async (): Promise<Blob | null> => {
    if (!foregroundBlob || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Load foreground
    const fgImg = new Image();
    fgImg.src = URL.createObjectURL(foregroundBlob);
    await new Promise((resolve) => (fgImg.onload = resolve));

    canvas.width = fgImg.width;
    canvas.height = fgImg.height;

    // Draw background based on type
    if (backgroundType === "transparent") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (backgroundType === "solid") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      addRecentColor(backgroundColor);
    } else if (backgroundType === "image" && backgroundImage) {
      const bgImg = new Image();
      bgImg.src = backgroundImage;
      await new Promise((resolve) => (bgImg.onload = resolve));
      // Cover fit
      const scale = Math.max(
        canvas.width / bgImg.width,
        canvas.height / bgImg.height,
      );
      const x = (canvas.width - bgImg.width * scale) / 2;
      const y = (canvas.height - bgImg.height * scale) / 2;
      ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
    } else if (backgroundType === "blur" && originalImage) {
      // Draw blurred original
      const bgImg = new Image();
      bgImg.src = originalImage;
      await new Promise((resolve) => (bgImg.onload = resolve));
      ctx.filter = `blur(${blurIntensity}px)`;
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    }

    // Draw foreground
    ctx.drawImage(fgImg, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        backgroundType === "transparent" ? "image/png" : "image/jpeg",
        0.95,
      );
    });
  }, [
    foregroundBlob,
    backgroundType,
    backgroundColor,
    backgroundImage,
    originalImage,
    blurIntensity,
    addRecentColor,
  ]);

  // Download handlers
  const handleDownload = useCallback(
    async (format: "png" | "jpg") => {
      const blob = await compositeImage();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `background-removed.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolUsage("background-remover", `download-${format}`);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    },
    [compositeImage],
  );

  // Reset
  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setForegroundBlob(null);
    setProcessingState({ status: "idle", progress: 0, message: "" });
    setBackgroundType("transparent");
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Handle background image upload
  const handleBgImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
        setBackgroundType("image");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // SEO
  const ogLocale = LOCALE_MAP[locale] || "en_US";
  const pageTitle = t("tools.backgroundRemover.pageTitle");
  const pageDescription = t("tools.backgroundRemover.pageDescription");
  const canonicalUrl = `${SITE_URL}/${locale === "en" ? "" : locale + "/"}tools/background-remover`;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-dark-bg dark:to-dark-bg">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={ogLocale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <Header />
      <Toaster position="top-center" />

      {/* Hidden canvas for compositing */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={bgCanvasRef} className="hidden" />

      <main className="flex-grow flex flex-col items-center px-4 py-8 sm:py-12">
        {/* Back to Tools */}
        <div className="w-full max-w-6xl mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            {t("tools.backToTools")}
          </Link>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            {t("tools.backgroundRemover.badge")}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.backgroundRemover.h1Title")}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.backgroundRemover.subtitle")}
          </p>
        </motion.div>

        {/* Privacy Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
            <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              100% Private — Images never leave your device
            </span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-6xl">
          {processingState.status === "idle" && !originalImage ? (
            // Upload Area
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="p-12 sm:p-16 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <PhotographIcon className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3
                    className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${spaceGrotesk.className}`}
                  >
                    {t("tools.backgroundRemover.uploadTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t("tools.backgroundRemover.uploadSubtitle")}
                  </p>
                  <button className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors">
                    {t("tools.backgroundRemover.selectFile")}
                  </button>
                  <p className="text-sm text-gray-400 mt-4">
                    {t("tools.backgroundRemover.maxSize")}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : processingState.status === "loading" ||
            processingState.status === "processing" ? (
            // Processing State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-violet-200 dark:border-violet-900 rounded-full" />
                <div
                  className="absolute inset-0 border-4 border-violet-600 rounded-full animate-spin"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + processingState.progress / 2}% 0%, ${50 + processingState.progress / 2}% ${processingState.progress}%, 50% 50%)`,
                  }}
                />
                <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-violet-600" />
              </div>
              <h3
                className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${spaceGrotesk.className}`}
              >
                {t("tools.backgroundRemover.processing")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {processingState.message}
              </p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-dark-border rounded-full h-2">
                <div
                  className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingState.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {Math.round(processingState.progress)}%
              </p>
            </motion.div>
          ) : (
            // Result View
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Image Preview */}
              <div className="lg:col-span-2 space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden"
                >
                  {/* Comparison Toggle */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowComparison(false)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          !showComparison
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
                        }`}
                      >
                        {t("tools.backgroundRemover.result")}
                      </button>
                      <button
                        onClick={() => setShowComparison(true)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          showComparison
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
                        }`}
                      >
                        Compare
                      </button>
                    </div>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      {t("tools.backgroundRemover.tryAnother")}
                    </button>
                  </div>

                  {/* Image Display */}
                  <div
                    className="relative aspect-video bg-[url('/checkerboard.svg')] bg-repeat"
                    style={{ backgroundColor: "#e5e5e5" }}
                  >
                    {showComparison ? (
                      // Comparison View
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Original (full width) */}
                        <img
                          src={originalImage || ""}
                          alt="Original"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        {/* Result (clipped) */}
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${comparisonPosition}%` }}
                        >
                          <img
                            src={processedImage || ""}
                            alt="Result"
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{
                              minWidth: `${100 / (comparisonPosition / 100)}%`,
                            }}
                          />
                        </div>
                        {/* Slider */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                          style={{ left: `${comparisonPosition}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <AdjustmentsIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={comparisonPosition}
                          onChange={(e) =>
                            setComparisonPosition(Number(e.target.value))
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                        />
                        {/* Labels */}
                        <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          Result
                        </div>
                        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          Original
                        </div>
                      </div>
                    ) : (
                      // Result View with background
                      <div
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            backgroundType === "solid"
                              ? backgroundColor
                              : undefined,
                          backgroundImage:
                            backgroundType === "image" && backgroundImage
                              ? `url(${backgroundImage})`
                              : backgroundType === "blur" && originalImage
                                ? `url(${originalImage})`
                                : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter:
                            backgroundType === "blur"
                              ? `blur(${blurIntensity}px)`
                              : undefined,
                        }}
                      >
                        {backgroundType === "blur" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${originalImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              filter: `blur(${blurIntensity}px)`,
                            }}
                          />
                        )}
                        <img
                          src={processedImage || ""}
                          alt="Result"
                          className="relative max-w-full max-h-full object-contain"
                          style={{ filter: "none" }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Download Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDownload("png")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    {t("tools.backgroundRemover.downloadPng")}
                  </button>
                  <button
                    onClick={() => handleDownload("jpg")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    {t("tools.backgroundRemover.downloadJpg")}
                  </button>
                </div>
              </div>

              {/* Background Options Panel */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border p-6"
                >
                  <h3
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
                  >
                    {t("tools.backgroundRemover.backgroundOptions")}
                  </h3>

                  {/* Background Type Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(
                      [
                        {
                          type: "transparent",
                          label: t("tools.backgroundRemover.transparent"),
                        },
                        {
                          type: "solid",
                          label: t("tools.backgroundRemover.solidColor"),
                        },
                        {
                          type: "image",
                          label: t("tools.backgroundRemover.customImage"),
                        },
                        {
                          type: "blur",
                          label: t("tools.backgroundRemover.blur"),
                        },
                      ] as { type: BackgroundType; label: string }[]
                    ).map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setBackgroundType(type)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          backgroundType === type
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700"
                            : "bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-dark-card"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Solid Color Options */}
                  {backgroundType === "solid" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("tools.backgroundRemover.chooseColor")}
                        </label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preset Colors
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setBackgroundColor(color)}
                              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                                backgroundColor === color
                                  ? "border-violet-500 ring-2 ring-violet-200"
                                  : "border-gray-200 dark:border-dark-border"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {recentColors.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("tools.backgroundRemover.recentColors")}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {recentColors.map((color, i) => (
                              <button
                                key={i}
                                onClick={() => setBackgroundColor(color)}
                                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                                  backgroundColor === color
                                    ? "border-violet-500"
                                    : "border-gray-200 dark:border-dark-border"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Image Upload */}
                  {backgroundType === "image" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("tools.backgroundRemover.uploadBackground")}
                      </label>
                      <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl cursor-pointer hover:border-violet-400 transition-colors">
                        <UploadIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                      </label>
                      {backgroundImage && (
                        <div className="mt-3 relative">
                          <img
                            src={backgroundImage}
                            alt="Background"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setBackgroundImage(null)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Blur Intensity */}
                  {backgroundType === "blur" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("tools.backgroundRemover.blurIntensity")}:{" "}
                        {blurIntensity}px
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={blurIntensity}
                        onChange={(e) =>
                          setBlurIntensity(Number(e.target.value))
                        }
                        className="w-full accent-violet-600"
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Features Section */}
          {processingState.status === "idle" && !originalImage && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12"
            >
              <h2
                className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
              >
                {t("tools.backgroundRemover.featuresTitle")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t("tools.backgroundRemover.featuresDescription")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FeatureCard
                  icon={
                    <SparklesIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  }
                  title={t("tools.backgroundRemover.featureAiTitle")}
                  description={t("tools.backgroundRemover.featureAiDesc")}
                />
                <FeatureCard
                  icon={
                    <ShieldCheckIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  }
                  title={t("tools.backgroundRemover.featurePrivacyTitle")}
                  description={t("tools.backgroundRemover.featurePrivacyDesc")}
                />
                <FeatureCard
                  icon={
                    <CheckCircleIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  }
                  title={t("tools.backgroundRemover.featureFreeTitle")}
                  description={t("tools.backgroundRemover.featureFreeDesc")}
                />
                <FeatureCard
                  icon={
                    <AdjustmentsIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  }
                  title={t("tools.backgroundRemover.featureQualityTitle")}
                  description={t("tools.backgroundRemover.featureQualityDesc")}
                />
                <FeatureCard
                  icon={
                    <ColorSwatchIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  }
                  title={t("tools.backgroundRemover.featureBackgroundsTitle")}
                  description={t(
                    "tools.backgroundRemover.featureBackgroundsDesc",
                  )}
                />
                <FeatureCard
                  icon={
                    <LightningBoltIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  }
                  title={t("tools.backgroundRemover.featureFastTitle")}
                  description={t("tools.backgroundRemover.featureFastDesc")}
                />
              </div>
            </motion.section>
          )}

          {/* FAQ Section */}
          {processingState.status === "idle" && !originalImage && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 sm:mt-16"
            >
              <h2
                className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center ${spaceGrotesk.className}`}
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-3 max-w-3xl mx-auto">
                {[
                  {
                    q: "Is this background remover free?",
                    a: "Yes, this AI background remover is completely free with no limits. Remove backgrounds from unlimited images without signing up or paying anything. There are no watermarks added to your images.",
                  },
                  {
                    q: "Is my image secure? Do you store my files?",
                    a: "Your images are 100% secure. All processing happens directly in your browser using AI - your images are never uploaded to our servers. This makes it safe for product photos, personal photos, and confidential images.",
                  },
                  {
                    q: "What image formats are supported?",
                    a: "You can upload PNG, JPG, and WebP images up to 20MB. The AI works best with clear subjects and good lighting.",
                  },
                  {
                    q: "How does the AI background removal work?",
                    a: "We use a state-of-the-art machine learning model that runs directly in your browser. It analyzes the image to detect the main subject and automatically separates it from the background with high precision.",
                  },
                  {
                    q: "Can I add a custom background?",
                    a: "Yes! After removing the background, you can keep it transparent, add a solid color, upload your own background image, or blur the original background.",
                  },
                ].map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                      <span className="font-medium text-gray-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <span className="text-violet-600 dark:text-violet-400 transition-transform group-open:rotate-180">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
