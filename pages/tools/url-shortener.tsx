import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { RelatedTools } from "@/components/tools";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  generateShortCode,
  saveLocalShortUrl,
  deleteLocalShortUrl,
  getLocalShortUrls,
  SHORT_URL_BASE,
} from "@/lib/analytics";
import type { LocalShortUrl } from "@/types/analytics";
import {
  ClipboardCopyIcon,
  TrashIcon,
  CheckIcon,
  LinkIcon,
  ExternalLinkIcon,
  QrcodeIcon,
  ClockIcon,
  XIcon,
  ChartBarIcon,
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

// Create a short URL with aig.link domain
function createTrackedShortUrl(
  originalUrl: string,
  title?: string,
): LocalShortUrl {
  const code = generateShortCode();
  const shortUrl: LocalShortUrl = {
    id: code,
    code,
    originalUrl,
    shortUrl: `${SHORT_URL_BASE}/${code}`,
    title: title || extractTitleFromUrl(originalUrl),
    createdAt: new Date().toISOString(),
    clicks: 0,
  };

  saveLocalShortUrl(shortUrl);
  return shortUrl;
}

// Extract a reasonable title from URL
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const path = urlObj.pathname.replace(/\//g, " ").trim();
    if (path && path.length > 2) {
      return `${hostname} - ${path.substring(0, 30)}`;
    }
    return hostname;
  } catch {
    return "Untitled Link";
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
  onViewAnalytics?: (item: HistoryItem) => void;
  t: (key: string) => string;
}

function HistoryItemCard({
  item,
  onCopy,
  onDelete,
  onGenerateQr,
  onViewAnalytics,
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
        <div className="flex items-center gap-2">
          <a
            href={item.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 font-medium hover:underline flex items-center gap-1.5"
          >
            {item.shortUrl}
            <ExternalLinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {truncateUrl(item.originalUrl, 60)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {formatDate(item.createdAt)}
          </p>
          {typeof item.clicks === "number" && (
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <ChartBarIcon className="w-3 h-3" />
              {item.clicks} {item.clicks === 1 ? "click" : "clicks"}
            </p>
          )}
        </div>
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

        {onViewAnalytics && (
          <button
            onClick={() => onViewAnalytics(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
            title="View analytics"
          >
            <ChartBarIcon className="w-4 h-4 text-cyan-500" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        )}

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

// Analytics Modal Component
interface AnalyticsModalProps {
  item: HistoryItem;
  onClose: () => void;
}

function AnalyticsModal({ item, onClose }: AnalyticsModalProps) {
  const [clickEvents, setClickEvents] = useState<
    import("@/types/analytics").ClickEvent[]
  >([]);
  const [analytics, setAnalytics] = useState<
    import("@/types/analytics").AnalyticsSummary | null
  >(null);
  const [sourceStats, setSourceStats] = useState<{
    direct: number;
    qr: number;
  }>({ direct: 0, qr: 0 });

  useEffect(() => {
    // Load click events for this URL
    const {
      getLocalClickEvents,
      calculateAnalytics,
    } = require("@/lib/analytics");
    const events = getLocalClickEvents(item.id);
    setClickEvents(events);
    if (events.length > 0) {
      setAnalytics(calculateAnalytics(events));
      // Calculate source breakdown
      const qrClicks = events.filter(
        (e: import("@/types/analytics").ClickEvent) => e.sourceType === "qr",
      ).length;
      setSourceStats({
        direct: events.length - qrClicks,
        qr: qrClicks,
      });
    }
  }, [item.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Link Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {item.shortUrl}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {analytics ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalClicks}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Clicks
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.uniqueVisitors}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Unique Visitors
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.clicksToday}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Today
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.clicksLast7Days}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 7 Days
                  </p>
                </div>
              </div>

              {/* Source Breakdown */}
              {(sourceStats.qr > 0 || sourceStats.direct > 0) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Click Sources
                  </h4>
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Direct Links
                        </span>
                      </div>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {sourceStats.direct}
                      </p>
                    </div>
                    <div className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <QrcodeIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          QR Scans
                        </span>
                      </div>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {sourceStats.qr}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Clicks */}
              {clickEvents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Recent Clicks
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clickEvents.slice(0, 10).map((event, index) => (
                      <div
                        key={event.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-card/50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {event.sourceType === "qr" && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                              QR
                            </span>
                          )}
                          <span className="text-gray-500 dark:text-gray-400">
                            {event.country || "Unknown"}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            •
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 capitalize">
                            {event.deviceType || "unknown"}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            •
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {event.browser || "Unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-dark-card/50 flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-1">
                No clicks yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share your link to start tracking analytics
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Analytics are stored locally in your browser
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-border/80 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
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
  const [showAnalytics, setShowAnalytics] = useState<HistoryItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTrackedUsage = useRef(false);

  // Load history from localStorage and sync click counts
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const historyItems: HistoryItem[] = JSON.parse(stored);

        // Sync click counts from tracked URL storage
        const trackedUrls = getLocalShortUrls();
        const syncedHistory = historyItems.map((item) => {
          const tracked = trackedUrls.find((t) => t.id === item.id);
          if (tracked) {
            return { ...item, clicks: tracked.clicks };
          }
          return item;
        });

        setHistory(syncedHistory);

        // Save synced history back
        localStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(syncedHistory),
        );
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
      // Create short URL with aig.link domain
      const trackedUrl = createTrackedShortUrl(normalizedUrl);
      const shortened = trackedUrl.shortUrl;

      // Add to history
      const newItem: HistoryItem = {
        id: trackedUrl.id,
        originalUrl: normalizedUrl,
        shortUrl: shortened,
        createdAt: Date.now(),
        clicks: 0,
      };

      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      saveHistory(newHistory);

      setShortUrl(shortened);
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
    // Delete from tracked storage
    deleteLocalShortUrl(id);

    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    saveHistory(newHistory);
    toast.success(t("tools.urlShortener.deletedMessage"));
  };

  const handleClearHistory = () => {
    // Clear all tracked links from storage
    history.forEach((item) => {
      deleteLocalShortUrl(item.id);
    });
    setHistory([]);
    saveHistory([]);
    toast.success(t("tools.urlShortener.historyCleared"));
  };

  const handleViewAnalytics = (item: HistoryItem) => {
    setShowAnalytics(item);
  };

  const handleGenerateQr = (shortUrl: string) => {
    // Navigate to QR code generator with pre-filled URL
    // Add ?source=qr to the short URL so we can track QR code scans vs direct clicks
    const qrTrackingUrl = shortUrl.includes("?")
      ? `${shortUrl}&source=qr`
      : `${shortUrl}?source=qr`;
    router.push(
      `/tools/qr-code-generator?url=${encodeURIComponent(qrTrackingUrl)}`,
    );
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
                "Free URL shortening with no limits",
                "No registration or account required",
                "QR code generation for any shortened link",
                "Local link history saved in browser",
                "One-click copy to clipboard",
                "Clean, professional short URLs",
                "Works with any valid URL",
                "Mobile-friendly responsive design",
                "Fast, reliable shortening services",
                "Privacy-focused - no tracking",
              ],
            }),
          }}
        />

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is this URL shortener completely free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, our URL shortener is 100% free with no hidden costs or premium tiers. Shorten unlimited URLs without signing up or providing any personal information.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do shortened URLs expire?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Shortened URLs created through our service are permanent and do not expire. They will continue to redirect to the original URL as long as the shortening service remains operational.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I track clicks on my shortened URLs?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our tool focuses on simplicity and privacy. For basic link tracking, you can use UTM parameters in your original URL before shortening. For advanced analytics, consider dedicated link management platforms.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is it safe to click on shortened URLs?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "While our tool creates safe redirects, always be cautious with shortened links from unknown sources. Our tool doesn't scan destination URLs for malware, so only shorten URLs you trust.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I generate a QR code for my short URL?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Every shortened URL includes a QR code option. Click the QR code icon next to your short link to generate and download a QR code instantly.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Why should I shorten URLs?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Short URLs are easier to share, look cleaner in posts and messages, are easier to type from print materials, and don't break in emails or SMS. They're especially useful for social media with character limits.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is there a limit to how many URLs I can shorten?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There's no limit. Shorten as many URLs as you need. Your recent links are saved locally in your browser for easy access.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I customize my short URL?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our tool uses trusted shortening services that generate random short codes. For custom branded short links (like yourname.link/page), you would need a dedicated URL shortening service with custom domain support.",
                  },
                },
              ],
            }),
          }}
        />

        {/* HowTo Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to Shorten a URL",
              description:
                "Learn how to shorten long URLs into clean, shareable links using our free tool.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Paste your URL",
                  text: "Copy the long URL you want to shorten and paste it into the input field. Make sure it includes http:// or https://.",
                  position: 1,
                },
                {
                  "@type": "HowToStep",
                  name: "Click Shorten",
                  text: "Click the 'Shorten URL' button. The tool will create a shortened version using a reliable shortening service.",
                  position: 2,
                },
                {
                  "@type": "HowToStep",
                  name: "Copy your short link",
                  text: "Your new short URL appears below. Click the copy button to copy it to your clipboard instantly.",
                  position: 3,
                },
                {
                  "@type": "HowToStep",
                  name: "Generate QR code (optional)",
                  text: "Click the QR code icon to generate a scannable QR code for your short link, perfect for print materials.",
                  position: 4,
                },
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
              {/* Feature badge */}
              <div className="flex items-center justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium">
                  <ChartBarIcon className="w-3.5 h-3.5" />
                  Free analytics included • No sign-up required
                </div>
              </div>

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
                      onViewAnalytics={handleViewAnalytics}
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
            <h2
              className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
            >
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
            <h2
              className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
            >
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

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
                  q: "Is this URL shortener completely free?",
                  a: "Yes, our URL shortener is 100% free with no hidden costs or premium tiers. Shorten unlimited URLs without signing up or providing any personal information.",
                },
                {
                  q: "Do shortened URLs expire?",
                  a: "Shortened URLs created through our service are permanent and do not expire. They will continue to redirect to the original URL as long as the shortening service remains operational.",
                },
                {
                  q: "Can I track clicks on my shortened URLs?",
                  a: "Our tool focuses on simplicity and privacy. For basic link tracking, you can use UTM parameters in your original URL before shortening.",
                },
                {
                  q: "Is it safe to click on shortened URLs?",
                  a: "While our tool creates safe redirects, always be cautious with shortened links from unknown sources. Only shorten URLs you trust.",
                },
                {
                  q: "Can I generate a QR code for my short URL?",
                  a: "Yes! Every shortened URL includes a QR code option. Click the QR code icon next to your short link to generate and download a QR code instantly.",
                },
                {
                  q: "Why should I shorten URLs?",
                  a: "Short URLs are easier to share, look cleaner in posts, are easier to type from print materials, and don't break in emails or SMS. They're especially useful for social media with character limits.",
                },
                {
                  q: "Is there a limit to how many URLs I can shorten?",
                  a: "There's no limit. Shorten as many URLs as you need. Your recent links are saved locally in your browser for easy access.",
                },
                {
                  q: "Can I customize my short URL?",
                  a: "Our tool uses trusted shortening services that generate random short codes. For custom branded short links, you would need a dedicated URL shortening service with custom domain support.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform flex-shrink-0"
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
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </motion.section>

          {/* Related Tools */}
          <RelatedTools currentToolId="url-shortener" />
        </div>
      </main>

      <Footer />

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsModal
            item={showAnalytics}
            onClose={() => setShowAnalytics(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
