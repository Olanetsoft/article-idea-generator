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
  ClipboardCopyIcon,
  TrashIcon,
  CheckIcon,
  LinkIcon,
  ExternalLinkIcon,
  QrcodeIcon,
  ClockIcon,
  XIcon,
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

const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = "url-shortener-history";

// ============================================================================
// Types
// ============================================================================

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: number;
  clicks?: number;
}

interface HistoryItem extends ShortenedUrl {}

// ============================================================================
// Utility Functions
// ============================================================================

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}

// ============================================================================
// API Functions
// ============================================================================

async function shortenWithTinyUrl(url: string): Promise<string> {
  const response = await fetch(
    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
  );
  if (!response.ok) throw new Error("TinyURL API failed");
  return await response.text();
}

async function shortenWithCleanUri(url: string): Promise<string> {
  const response = await fetch("https://cleanuri.com/api/v1/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `url=${encodeURIComponent(url)}`,
  });
  if (!response.ok) throw new Error("CleanURI API failed");
  const data = await response.json();
  return data.result_url;
}

async function shortenUrl(url: string): Promise<string> {
  // Try TinyURL first, fall back to CleanURI
  try {
    return await shortenWithTinyUrl(url);
  } catch {
    try {
      return await shortenWithCleanUri(url);
    } catch {
      throw new Error("All URL shortening services failed. Please try again.");
    }
  }
}

// ============================================================================
// Components
// ============================================================================

interface HistoryItemCardProps {
  item: HistoryItem;
  onCopy: (url: string) => void;
  onDelete: (id: string) => void;
  onGenerateQr: (url: string) => void;
  t: (key: string) => string;
}

function HistoryItemCard({
  item,
  onCopy,
  onDelete,
  onGenerateQr,
  t,
}: HistoryItemCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(item.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-dark-border"
    >
      <div className="flex-1 min-w-0">
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1.5"
        >
          {item.shortUrl}
          <ExternalLinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
        </a>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {truncateUrl(item.originalUrl, 60)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          {formatDate(item.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
          title={t("tools.urlShortener.copy")}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <ClipboardCopyIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
          <span className="hidden sm:inline">
            {copied
              ? t("tools.urlShortener.copied")
              : t("tools.urlShortener.copy")}
          </span>
        </button>

        <button
          onClick={() => onGenerateQr(item.shortUrl)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
          title={t("tools.urlShortener.generateQr")}
        >
          <QrcodeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="hidden sm:inline">
            {t("tools.urlShortener.qrCode")}
          </span>
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          title={t("tools.urlShortener.delete")}
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function UrlShortenerPage(): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTrackedUsage = useRef(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleShorten = async () => {
    // Validate URL
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError(t("tools.urlShortener.errorEmpty"));
      inputRef.current?.focus();
      return;
    }

    // Add protocol if missing
    let normalizedUrl = trimmedUrl;
    if (
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      normalizedUrl = "https://" + trimmedUrl;
    }

    if (!isValidUrl(normalizedUrl)) {
      setError(t("tools.urlShortener.errorInvalid"));
      inputRef.current?.focus();
      return;
    }

    setError("");
    setIsLoading(true);
    setShortUrl("");

    // Track usage
    if (!hasTrackedUsage.current) {
      trackToolUsage("url_shortener", "shorten_url");
      hasTrackedUsage.current = true;
    }

    try {
      const shortened = await shortenUrl(normalizedUrl);
      setShortUrl(shortened);

      // Add to history
      const newItem: HistoryItem = {
        id: generateId(),
        originalUrl: normalizedUrl,
        shortUrl: shortened,
        createdAt: Date.now(),
      };

      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      saveHistory(newHistory);

      toast.success(t("tools.urlShortener.successMessage"));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("tools.urlShortener.errorGeneric");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(
    async (urlToCopy: string) => {
      try {
        await navigator.clipboard.writeText(urlToCopy);
        setCopied(true);
        toast.success(t("tools.urlShortener.copiedMessage"));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t("tools.urlShortener.copyError"));
      }
    },
    [t],
  );

  const handleCopyShortUrl = () => {
    if (shortUrl) handleCopy(shortUrl);
  };

  const handleClear = () => {
    setUrl("");
    setShortUrl("");
    setError("");
    inputRef.current?.focus();
  };

  const handleDeleteHistoryItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
    toast.success(t("tools.urlShortener.deletedMessage"));
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
    toast.success(t("tools.urlShortener.historyCleared"));
  };

  const handleGenerateQr = (shortUrl: string) => {
    // Navigate to QR code generator with pre-filled URL
    router.push(`/tools/qr-code-generator?url=${encodeURIComponent(shortUrl)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleShorten();
    }
  };

  // SEO
  const { locale: currentLocale, locales, defaultLocale } = router;
  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/url-shortener`
      : `${SITE_URL}/${currentLocale}/tools/url-shortener`;

  const ogLocale = LOCALE_MAP[currentLocale || "en"] || "en_US";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-dark-bg dark:to-darkOffset">
      <Head>
        <title>{t("tools.urlShortener.pageTitle")}</title>
        <meta
          name="description"
          content={t("tools.urlShortener.pageDescription")}
        />
        <meta
          name="keywords"
          content="url shortener, link shortener, shorten url, short link, tiny url, link compressor, free url shortener, custom short links"
        />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={t("tools.urlShortener.pageTitle")} />
        <meta
          property="og:description"
          content={t("tools.urlShortener.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={ogLocale} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={t("tools.urlShortener.pageTitle")}
        />
        <meta
          name="twitter:description"
          content={t("tools.urlShortener.pageDescription")}
        />

        {/* Alternate languages */}
        {locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/url-shortener`
                : `${SITE_URL}/${locale}/tools/url-shortener`
            }
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        {/* Schema.org WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.urlShortener.name"),
              description: t("tools.urlShortener.pageDescription"),
              url: pageUrl,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Free URL shortening",
                "No registration required",
                "QR code generation",
                "Link history",
                "One-click copy",
              ],
            }),
          }}
        />
      </Head>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Header />

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="w-full max-w-3xl mb-4">
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
              URL Shortener
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
            <LinkIcon className="w-3.5 h-3.5" />
            {t("tools.urlShortener.badge")}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.urlShortener.title")}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.urlShortener.subtitle")}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden"
          >
            {/* Input Section */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t("tools.urlShortener.placeholder")}
                    className={`w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-dark-card/50 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                      error
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-200 dark:border-dark-border"
                    }`}
                  />
                  {url && (
                    <button
                      onClick={handleClear}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleShorten}
                  disabled={isLoading}
                  className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isLoading ? (
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
                      {t("tools.urlShortener.shortening")}
                    </>
                  ) : (
                    t("tools.urlShortener.shorten")
                  )}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Result Section */}
            <AnimatePresence>
              {shortUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 dark:border-dark-border bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10"
                >
                  <div className="p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {t("tools.urlShortener.yourShortUrl")}
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-violet-600 dark:text-violet-400 font-medium hover:underline truncate"
                        >
                          {shortUrl}
                        </a>
                        <ExternalLinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyShortUrl}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
                        >
                          {copied ? (
                            <CheckIcon className="w-5 h-5" />
                          ) : (
                            <ClipboardCopyIcon className="w-5 h-5" />
                          )}
                          {copied
                            ? t("tools.urlShortener.copied")
                            : t("tools.urlShortener.copy")}
                        </button>

                        <button
                          onClick={() => handleGenerateQr(shortUrl)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-dark-border transition-colors border border-gray-200 dark:border-dark-border"
                          title={t("tools.urlShortener.generateQr")}
                        >
                          <QrcodeIcon className="w-5 h-5" />
                          <span className="hidden sm:inline">
                            {t("tools.urlShortener.qrCode")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* History Section */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                  {t("tools.urlShortener.recentLinks")}
                </h2>
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  {t("tools.urlShortener.clearHistory")}
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {history.map((item) => (
                    <HistoryItemCard
                      key={item.id}
                      item={item}
                      onCopy={handleCopy}
                      onDelete={handleDeleteHistoryItem}
                      onGenerateQr={handleGenerateQr}
                      t={t}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("tools.urlShortener.whyUseTitle")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("tools.urlShortener.whyUseDescription")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: "🔗",
                  titleKey: "tools.urlShortener.featureFreeTitle",
                  descKey: "tools.urlShortener.featureFreeDesc",
                },
                {
                  icon: "⚡",
                  titleKey: "tools.urlShortener.featureFastTitle",
                  descKey: "tools.urlShortener.featureFastDesc",
                },
                {
                  icon: "📱",
                  titleKey: "tools.urlShortener.featureQrTitle",
                  descKey: "tools.urlShortener.featureQrDesc",
                },
                {
                  icon: "📋",
                  titleKey: "tools.urlShortener.featureHistoryTitle",
                  descKey: "tools.urlShortener.featureHistoryDesc",
                },
                {
                  icon: "🔒",
                  titleKey: "tools.urlShortener.featureSecureTitle",
                  descKey: "tools.urlShortener.featureSecureDesc",
                },
                {
                  icon: "🌐",
                  titleKey: "tools.urlShortener.featureShareTitle",
                  descKey: "tools.urlShortener.featureShareDesc",
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

          {/* Use Cases Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("tools.urlShortener.useCasesTitle")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  titleKey: "tools.urlShortener.useCaseSocialTitle",
                  descKey: "tools.urlShortener.useCaseSocialDesc",
                },
                {
                  titleKey: "tools.urlShortener.useCaseMarketingTitle",
                  descKey: "tools.urlShortener.useCaseMarketingDesc",
                },
                {
                  titleKey: "tools.urlShortener.useCasePrintTitle",
                  descKey: "tools.urlShortener.useCasePrintDesc",
                },
                {
                  titleKey: "tools.urlShortener.useCaseMessagingTitle",
                  descKey: "tools.urlShortener.useCaseMessagingDesc",
                },
              ].map((useCase, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-dark-card/50 dark:to-dark-card rounded-xl border border-gray-100 dark:border-dark-border"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(useCase.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t(useCase.descKey)}
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
