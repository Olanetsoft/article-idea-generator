// Background Remover - AI-Powered Background Removal Tool
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import { motion } from "framer-motion";
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

// Types & Constants
type BackgroundType = "transparent" | "solid" | "image" | "blur";
type ProcessingStatus = "idle" | "loading" | "processing" | "done" | "error";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
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
const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

// Reusable Components
const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
  </div>
);

const ColorButton = ({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${selected ? "border-violet-500 ring-2 ring-violet-200" : "border-gray-200 dark:border-dark-border"}`}
    style={{ backgroundColor: color }}
  />
);

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${active ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"}`}
  >
    {children}
  </button>
);

const BgTypeButton = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selected ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700" : "bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-dark-card"}`}
  >
    {label}
  </button>
);

// Main Component
export default function BackgroundRemover() {
  const { t, locale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [foregroundBlob, setForegroundBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState({ value: 0, message: "" });
  const [backgroundType, setBackgroundType] =
    useState<BackgroundType>("transparent");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPos, setComparisonPos] = useState(50);

  // Load recent colors
  useEffect(() => {
    const saved = localStorage.getItem("bg-remover-recent-colors");
    if (saved)
      try {
        setRecentColors(JSON.parse(saved));
      } catch {}
  }, []);

  const addRecentColor = useCallback((color: string) => {
    setRecentColors((prev) => {
      const updated = [color, ...prev.filter((c) => c !== color)].slice(0, 8);
      localStorage.setItem("bg-remover-recent-colors", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // File handling
  const handleFileSelect = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type))
      return toast.error("Please upload a PNG, JPG, or WebP image");
    if (file.size > MAX_FILE_SIZE)
      return toast.error("File size must be less than 20MB");

    setProcessedImage(null);
    setForegroundBlob(null);
    setBackgroundType("transparent");

    const reader = new FileReader();
    reader.onload = (e) => setOriginalImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setStatus("loading");
    setProgress({
      value: 0,
      message: "Loading AI model (first time may take ~30s)...",
    });

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress({ value: 20, message: "Initializing AI model..." });

      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          const base = key.includes("fetch")
            ? 30
            : key.includes("inference")
              ? 70
              : 90;
          const msg = key.includes("fetch")
            ? "Downloading AI model..."
            : key.includes("inference")
              ? "Running AI inference..."
              : "Processing...";
          setProgress({
            value: Math.min(
              base + (total > 0 ? (current / total) * 20 : 0),
              95,
            ),
            message: msg,
          });
        },
        output: { format: "image/png", quality: 1 },
      });

      setForegroundBlob(blob);
      setProcessedImage(URL.createObjectURL(blob));
      setStatus("done");
      setProgress({ value: 100, message: "Complete!" });
      trackToolUsage("background-remover", "process");
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      setProgress({ value: 0, message: "Failed" });
      toast.error("Failed to remove background. Please try again.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  // Composite image with background
  const compositeImage = useCallback(async (): Promise<Blob | null> => {
    if (!foregroundBlob || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const fgImg = new Image();
    fgImg.src = URL.createObjectURL(foregroundBlob);
    await new Promise((r) => (fgImg.onload = r));
    canvas.width = fgImg.width;
    canvas.height = fgImg.height;

    if (backgroundType === "solid") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      addRecentColor(backgroundColor);
    } else if (backgroundType === "image" && backgroundImage) {
      const bgImg = new Image();
      bgImg.src = backgroundImage;
      await new Promise((r) => (bgImg.onload = r));
      const scale = Math.max(
        canvas.width / bgImg.width,
        canvas.height / bgImg.height,
      );
      ctx.drawImage(
        bgImg,
        (canvas.width - bgImg.width * scale) / 2,
        (canvas.height - bgImg.height * scale) / 2,
        bgImg.width * scale,
        bgImg.height * scale,
      );
    } else if (backgroundType === "blur" && originalImage) {
      const bgImg = new Image();
      bgImg.src = originalImage;
      await new Promise((r) => (bgImg.onload = r));
      ctx.filter = `blur(${blurIntensity}px)`;
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    }

    ctx.drawImage(fgImg, 0, 0);
    return new Promise((r) =>
      canvas.toBlob(
        (b) => r(b),
        backgroundType === "transparent" ? "image/png" : "image/jpeg",
        0.95,
      ),
    );
  }, [
    foregroundBlob,
    backgroundType,
    backgroundColor,
    backgroundImage,
    originalImage,
    blurIntensity,
    addRecentColor,
  ]);

  const handleDownload = useCallback(
    async (format: "png" | "jpg") => {
      const blob = await compositeImage();
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `background-removed.${format}`;
      a.click();
      trackToolUsage("background-remover", `download-${format}`);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    },
    [compositeImage],
  );

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setForegroundBlob(null);
    setStatus("idle");
    setProgress({ value: 0, message: "" });
    setBackgroundType("transparent");
    setBackgroundImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

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

  // SEO & Memoized data
  const pageTitle = t("tools.backgroundRemover.pageTitle");
  const pageDescription = t("tools.backgroundRemover.pageDescription");
  const canonicalUrl = `${SITE_URL}/${locale === "en" ? "" : locale + "/"}tools/background-remover`;

  const bgTypes = useMemo(
    () => [
      {
        type: "transparent" as const,
        label: t("tools.backgroundRemover.transparent"),
      },
      {
        type: "solid" as const,
        label: t("tools.backgroundRemover.solidColor"),
      },
      {
        type: "image" as const,
        label: t("tools.backgroundRemover.customImage"),
      },
      { type: "blur" as const, label: t("tools.backgroundRemover.blur") },
    ],
    [t],
  );

  const features = useMemo(
    () => [
      {
        icon: (
          <SparklesIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        ),
        key: "Ai",
      },
      {
        icon: (
          <ShieldCheckIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        ),
        key: "Privacy",
      },
      {
        icon: (
          <CheckCircleIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        ),
        key: "Free",
      },
      {
        icon: (
          <AdjustmentsIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        ),
        key: "Quality",
      },
      {
        icon: (
          <ColorSwatchIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        ),
        key: "Backgrounds",
      },
      {
        icon: (
          <LightningBoltIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        ),
        key: "Fast",
      },
    ],
    [],
  );

  const faqs = [
    {
      q: "Is this background remover free?",
      a: "Yes, completely free with no limits, no signup, and no watermarks.",
    },
    {
      q: "Is my image secure?",
      a: "100% secure. All processing happens in your browser - images never leave your device.",
    },
    {
      q: "What formats are supported?",
      a: "PNG, JPG, and WebP images up to 20MB.",
    },
    {
      q: "How does the AI work?",
      a: "A machine learning model runs in your browser to detect and separate the subject from the background.",
    },
    {
      q: "Can I add a custom background?",
      a: "Yes! Keep it transparent, add a solid color, upload your own image, or blur the original.",
    },
  ];

  const isIdle = status === "idle" && !originalImage;
  const isProcessing = status === "loading" || status === "processing";

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
        <meta property="og:locale" content={LOCALE_MAP[locale] || "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <Header />
      <Toaster position="top-center" />
      <canvas ref={canvasRef} className="hidden" />

      <main className="flex-grow flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-6xl mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            {t("tools.backToTools")}
          </Link>
        </div>

        {/* Hero */}
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
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.backgroundRemover.h1Title")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.backgroundRemover.subtitle")}
          </p>
        </motion.div>

        {/* Privacy Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
            <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              100% Private — Images never leave your device
            </span>
          </div>
        </motion.div>

        <div className="w-full max-w-6xl">
          {isIdle ? (
            /* Upload Area */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                className="hidden"
              />
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
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
          ) : isProcessing ? (
            /* Processing */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-violet-200 dark:border-violet-900 rounded-full" />
                <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-violet-600 animate-pulse" />
              </div>
              <h3
                className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${spaceGrotesk.className}`}
              >
                {t("tools.backgroundRemover.processing")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {progress.message}
              </p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-dark-border rounded-full h-2">
                <div
                  className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.value}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {Math.round(progress.value)}%
              </p>
            </motion.div>
          ) : (
            /* Result */
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center gap-4">
                      <TabButton
                        active={!showComparison}
                        onClick={() => setShowComparison(false)}
                      >
                        {t("tools.backgroundRemover.result")}
                      </TabButton>
                      <TabButton
                        active={showComparison}
                        onClick={() => setShowComparison(true)}
                      >
                        Compare
                      </TabButton>
                    </div>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      {t("tools.backgroundRemover.tryAnother")}
                    </button>
                  </div>

                  <div
                    className="relative aspect-video bg-[length:20px_20px] bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]"
                    style={{ backgroundColor: "#e5e5e5" }}
                  >
                    {showComparison ? (
                      <div className="relative w-full h-full overflow-hidden">
                        <img
                          src={originalImage || ""}
                          alt="Original"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${comparisonPos}%` }}
                        >
                          <img
                            src={processedImage || ""}
                            alt="Result"
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{
                              minWidth: `${100 / (comparisonPos / 100)}%`,
                            }}
                          />
                        </div>
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                          style={{ left: `${comparisonPos}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <AdjustmentsIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={comparisonPos}
                          onChange={(e) =>
                            setComparisonPos(Number(e.target.value))
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                        />
                        <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          Result
                        </div>
                        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
                          Original
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            backgroundType === "solid"
                              ? backgroundColor
                              : undefined,
                        }}
                      >
                        {backgroundType === "blur" && originalImage && (
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
                        {backgroundType === "image" && backgroundImage && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${backgroundImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                        )}
                        <img
                          src={processedImage || ""}
                          alt="Result"
                          className="relative max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

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
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    {t("tools.backgroundRemover.downloadJpg")}
                  </button>
                </div>
              </div>

              {/* Background Options */}
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
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {bgTypes.map(({ type, label }) => (
                    <BgTypeButton
                      key={type}
                      label={label}
                      selected={backgroundType === type}
                      onClick={() => setBackgroundType(type)}
                    />
                  ))}
                </div>

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
                        {PRESET_COLORS.map((c) => (
                          <ColorButton
                            key={c}
                            color={c}
                            selected={backgroundColor === c}
                            onClick={() => setBackgroundColor(c)}
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
                          {recentColors.map((c, i) => (
                            <ColorButton
                              key={i}
                              color={c}
                              selected={backgroundColor === c}
                              onClick={() => setBackgroundColor(c)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      onChange={(e) => setBlurIntensity(Number(e.target.value))}
                      className="w-full accent-violet-600"
                    />
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Features */}
          {isIdle && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                {features.map(({ icon, key }) => (
                  <FeatureCard
                    key={key}
                    icon={icon}
                    title={t(`tools.backgroundRemover.feature${key}Title`)}
                    desc={t(`tools.backgroundRemover.feature${key}Desc`)}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* FAQ */}
          {isIdle && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 sm:mt-16"
            >
              <h2
                className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center ${spaceGrotesk.className}`}
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-3 max-w-3xl mx-auto">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                      <span className="font-medium text-gray-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <svg
                        className="w-5 h-5 text-violet-600 transition-transform group-open:rotate-180"
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
