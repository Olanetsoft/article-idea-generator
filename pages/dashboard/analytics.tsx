import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  DashboardLayout,
  ClicksChart,
  DeviceChart,
  GeoChart,
  ReferrerList,
  SourceComparison,
} from "@/components";
import { useAuth } from "@/contexts";
import { SITE_NAME } from "@/lib/constants";
import { getAnalyticsEndpoint } from "@/lib/analytics/constants";

// Inline SVG Icons (heroicons not installed)
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// Shared card styling constant (DRY)
const CARD_STYLES =
  "rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800";

interface AnalyticsData {
  code: string;
  originalUrl: string;
  title: string | null;
  createdAt: string;
  totalClicks: number;
  uniqueClicks: number;
  qrScans: number;
  // Trend data (comparison with previous period)
  previousPeriodClicks?: number;
  clicksTrend?: number; // percentage change
  countries: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
  sources: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  timeline: Array<{ date: string; clicks: number }>;
  // UTM data
  utmSources?: Array<{ name: string; count: number }>;
  utmMediums?: Array<{ name: string; count: number }>;
  utmCampaigns?: Array<{ name: string; count: number }>;
  // Time of day data
  hourlyDistribution?: Array<{ hour: number; clicks: number }>;
  recentClicks: Array<{
    timestamp: string;
    country: string | null;
    city: string | null;
    deviceType: string | null;
    browser: string | null;
    sourceType: string | null;
    referrer: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  }>;
}

interface ShortUrl {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { code } = router.query;
  const { user } = useAuth();
  const [links, setLinks] = useState<ShortUrl[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all" | "custom">(
    "30d",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareExpiry, setShareExpiry] = useState<string>("never");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter links based on search query (defined early for use in keyboard navigation)
  const filteredLinks = links.filter((link) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.code.toLowerCase().includes(query) ||
      link.originalUrl.toLowerCase().includes(query) ||
      (link.title && link.title.toLowerCase().includes(query))
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isDropdownOpen]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredLinks.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredLinks[highlightedIndex]) {
            const link = filteredLinks[highlightedIndex];
            setSelectedCode(link.code);
            setIsDropdownOpen(false);
            setSearchQuery("");
            router.push(`/dashboard/analytics?code=${link.code}`, undefined, {
              shallow: true,
            });
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          setSearchQuery("");
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen, highlightedIndex, filteredLinks, router]);

  // Auto-refresh analytics every 30 seconds when enabled
  const fetchAnalyticsData = useCallback(
    async (showLoading = true) => {
      if (!selectedCode) return;

      if (showLoading) {
        setIsLoadingAnalytics(true);
      }
      setError(null);

      try {
        // Build URL using the endpoint helper
        const url = getAnalyticsEndpoint(selectedCode, {
          period,
          startDate: period === "custom" ? customDateRange.start : undefined,
          endDate: period === "custom" ? customDateRange.end : undefined,
        });

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch analytics");

        const data = await response.json();
        setAnalytics(data);
        setLastRefreshed(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingAnalytics(false);
      }
    },
    [selectedCode, period, customDateRange],
  );

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshEnabled && selectedCode && !isLoadingAnalytics) {
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchAnalyticsData(false); // Don't show loading spinner for auto-refresh
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [
    autoRefreshEnabled,
    selectedCode,
    fetchAnalyticsData,
    isLoadingAnalytics,
  ]);

  // Copy short URL to clipboard
  const handleCopyShortUrl = useCallback(async () => {
    if (!selectedCode) return;

    try {
      await navigator.clipboard.writeText(`https://aigl.ink/r/${selectedCode}`);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [selectedCode]);

  // Create shareable analytics link
  const handleCreateShareLink = useCallback(async () => {
    if (!selectedCode) return;

    setIsCreatingShare(true);
    try {
      const expiryHours =
        shareExpiry === "never"
          ? undefined
          : shareExpiry === "24h"
            ? 24
            : shareExpiry === "7d"
              ? 168
              : shareExpiry === "30d"
                ? 720
                : undefined;

      const response = await fetch(`/api/urls/${selectedCode}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: expiryHours }),
      });

      if (!response.ok) throw new Error("Failed to create share link");

      const data = await response.json();
      setShareUrl(data.shareUrl);
      toast.success("Share link created!");
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setIsCreatingShare(false);
    }
  }, [selectedCode, shareExpiry]);

  // Copy share URL to clipboard
  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    } catch {
      toast.error("Failed to copy share link");
    }
  }, [shareUrl]);

  // Fetch user's links
  useEffect(() => {
    if (!user) return;

    const fetchLinks = async () => {
      try {
        const response = await fetch("/api/urls");
        if (!response.ok) throw new Error("Failed to fetch links");

        const { urls } = await response.json();
        setLinks(
          urls.map((url: any) => ({
            id: url.id,
            code: url.code,
            originalUrl: url.originalUrl,
            title: url.title,
          })),
        );

        // If code is in URL, select it
        if (code && typeof code === "string") {
          setSelectedCode(code);
        } else if (urls.length > 0) {
          // Select first link by default
          setSelectedCode(urls[0].code);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingLinks(false);
      }
    };

    fetchLinks();
  }, [user, code]);

  // Fetch analytics for selected link
  useEffect(() => {
    fetchAnalyticsData(true);
  }, [selectedCode, period, customDateRange.start, customDateRange.end]);

  const handleExport = async (format: "csv" | "json") => {
    if (!selectedCode) return;

    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/urls/${selectedCode}/export?format=${format}&period=${period}`,
      );
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${selectedCode}-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedLink = links.find((l) => l.code === selectedCode);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Head>
        <title>{`Link Analytics | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content="View detailed analytics for your shortened URLs. Track clicks, visitors, locations, devices, and traffic sources."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <DashboardLayout
        title="Analytics"
        description="Detailed analytics for your links"
      >
        {isLoadingLinks ? (
          <LoadingSkeleton />
        ) : links.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Link Selector - Custom Dropdown */}
            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">
                Select a link to view analytics
              </label>
              <div ref={dropdownRef} className="relative w-full max-w-lg">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-left flex items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-zinc-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                >
                  {selectedLink ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-violet-600 dark:text-violet-400 font-mono text-sm">
                          aigl.ink/r/{selectedLink.code}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm truncate mt-0.5">
                        {selectedLink.title ||
                          truncateUrl(selectedLink.originalUrl, 50)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400">Select a link...</span>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search links..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {filteredLinks.length} of {links.length} links
                        </p>
                      </div>

                      {/* Links List */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredLinks.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No links match your search
                          </div>
                        ) : (
                          filteredLinks.map((link, index) => (
                            <button
                              key={link.id}
                              type="button"
                              onClick={() => {
                                setSelectedCode(link.code);
                                setIsDropdownOpen(false);
                                setSearchQuery("");
                                router.push(
                                  `/dashboard/analytics?code=${link.code}`,
                                  undefined,
                                  { shallow: true },
                                );
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0 ${
                                selectedCode === link.code
                                  ? "bg-violet-50 dark:bg-violet-500/10"
                                  : index === highlightedIndex
                                    ? "bg-gray-50 dark:bg-zinc-800"
                                    : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-mono text-sm ${
                                    selectedCode === link.code
                                      ? "text-violet-600 dark:text-violet-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  aigl.ink/r/{link.code}
                                </span>
                                {selectedCode === link.code && (
                                  <svg
                                    className="w-4 h-4 text-violet-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm truncate mt-0.5">
                                {link.title ||
                                  truncateUrl(link.originalUrl, 50)}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                      {/* Keyboard hint */}
                      <div className="p-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400 flex gap-3">
                        <span>↑↓ Navigate</span>
                        <span>Enter Select</span>
                        <span>Esc Close</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Date Range & Export Controls */}
            <motion.div
              variants={itemVariants}
              className="mb-8 flex flex-wrap items-center gap-4"
            >
              {/* Date Range Picker */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Period:
                </span>
                <div className="flex flex-wrap bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-1">
                  {(["7d", "30d", "90d", "all", "custom"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPeriod(p);
                        if (p === "custom") {
                          setShowCustomDatePicker(true);
                        } else {
                          setShowCustomDatePicker(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        period === p
                          ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {p === "7d"
                        ? "7 Days"
                        : p === "30d"
                          ? "30 Days"
                          : p === "90d"
                            ? "90 Days"
                            : p === "all"
                              ? "All Time"
                              : "Custom"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range Picker */}
              {showCustomDatePicker && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }))
                    }
                    className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    autoRefreshEnabled
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
                  }`}
                  title={
                    autoRefreshEnabled
                      ? "Auto-refresh on (30s)"
                      : "Auto-refresh off"
                  }
                >
                  <svg
                    className={`w-4 h-4 ${autoRefreshEnabled ? "animate-spin" : ""}`}
                    style={{ animationDuration: "3s" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {autoRefreshEnabled ? "Live" : "Paused"}
                </button>
                {lastRefreshed && (
                  <span className="text-xs text-gray-400">
                    Updated {formatTimestamp(lastRefreshed.toISOString())}
                  </span>
                )}
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Export:
                </span>
                <button
                  onClick={() => handleExport("csv")}
                  disabled={isExporting || !analytics}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={() => handleExport("json")}
                  disabled={isExporting || !analytics}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  JSON
                </button>
              </div>
            </motion.div>

            {selectedLink && (
              <motion.div
                variants={itemVariants}
                className="mb-8 p-4 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://aigl.ink/r/${selectedLink.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 dark:text-violet-400 font-mono hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                      >
                        aigl.ink/r/{selectedLink.code}
                      </a>
                      <button
                        onClick={handleCopyShortUrl}
                        className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
                        title="Copy short URL"
                      >
                        {copied ? (
                          <svg
                            className="w-4 h-4 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-violet-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShareUrl(null);
                          setShowShareModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
                        title="Share analytics"
                      >
                        <ShareIcon className="w-4 h-4 text-violet-500" />
                      </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                      → {selectedLink.originalUrl}
                    </p>
                  </div>
                  <Link
                    href={`/tools/qr-code-generator?url=https://aigl.ink/r/${selectedLink.code}`}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm"
                  >
                    Generate QR Code
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Share Analytics Modal */}
            <AnimatePresence>
              {showShareModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setShowShareModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Share Analytics
                      </h3>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                      >
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {!shareUrl ? (
                      <>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          Create a shareable link to let others view analytics
                          for this URL without signing in.
                        </p>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link Expiration
                          </label>
                          <select
                            value={shareExpiry}
                            onChange={(e) => setShareExpiry(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                          >
                            <option value="never">Never expire</option>
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="30d">30 days</option>
                          </select>
                        </div>

                        <button
                          onClick={handleCreateShareLink}
                          disabled={isCreatingShare}
                          className="w-full py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isCreatingShare ? (
                            <>
                              <svg
                                className="w-4 h-4 animate-spin"
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
                              Creating...
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-4 h-4" />
                              Create Share Link
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          Your shareable analytics link is ready!
                        </p>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg mb-4">
                          <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
                          />
                          <button
                            onClick={handleCopyShareUrl}
                            className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => setShareUrl(null)}
                          className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
                        >
                          Create another link
                        </button>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {error ? (
              <motion.div
                variants={itemVariants}
                className="p-5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            ) : isLoadingAnalytics ? (
              <LoadingSkeleton showHeader={false} />
            ) : analytics ? (
              <AnalyticsContent analytics={analytics} />
            ) : null}
          </motion.div>
        )}
      </DashboardLayout>
    </>
  );
}

// Truncate URL helper
function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}

// Loading skeleton component
function LoadingSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="animate-pulse">
      {showHeader && (
        <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg w-full max-w-md mb-8" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-200 dark:bg-zinc-700 rounded-xl"
          />
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-zinc-700 rounded-xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-56 bg-gray-200 dark:bg-zinc-700 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-12 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-center"
    >
      <svg
        className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Create links to start tracking analytics.
      </p>
      <Link
        href="/tools/url-shortener"
        className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
      >
        Create Your First Link
      </Link>
    </motion.div>
  );
}

// Analytics content component
function AnalyticsContent({ analytics }: { analytics: AnalyticsData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Stats Overview */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <StatCard
          title="Total Clicks"
          value={analytics.totalClicks}
          icon="cursor"
          color="violet"
          trend={analytics.clicksTrend}
        />
        <StatCard
          title="Unique Clicks"
          value={analytics.uniqueClicks}
          icon="users"
          color="violet"
        />
        <StatCard
          title="QR Scans"
          value={analytics.qrScans}
          icon="qr"
          color="emerald"
        />
      </motion.div>

      {/* Timeline Chart */}
      {analytics.timeline && analytics.timeline.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <ClicksChart data={analytics.timeline} />
        </motion.div>
      )}

      {/* Time of Day Heatmap */}
      {analytics.hourlyDistribution &&
        analytics.hourlyDistribution.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <TimeOfDayChart data={analytics.hourlyDistribution} />
          </motion.div>
        )}

      {/* QR vs Direct Comparison */}
      {(analytics.qrScans > 0 || analytics.totalClicks > 0) && (
        <motion.div variants={itemVariants} className="mb-8">
          <SourceComparison
            qrScans={analytics.qrScans}
            directClicks={analytics.totalClicks - analytics.qrScans}
          />
        </motion.div>
      )}

      {/* Charts Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <GeoChart
          data={analytics.countries}
          title="Top Countries"
          type="country"
        />
        <DeviceChart data={analytics.devices} title="Devices" type="device" />
        <DeviceChart
          data={analytics.browsers}
          title="Browsers"
          type="browser"
        />
        <ReferrerList data={analytics.referrers} title="Top Referrers" />
      </motion.div>

      {/* UTM Breakdown */}
      {((analytics.utmSources && analytics.utmSources.length > 0) ||
        (analytics.utmCampaigns && analytics.utmCampaigns.length > 0)) && (
        <motion.div variants={itemVariants} className="mb-8">
          <UTMBreakdown
            sources={analytics.utmSources || []}
            mediums={analytics.utmMediums || []}
            campaigns={analytics.utmCampaigns || []}
          />
        </motion.div>
      )}

      {/* Recent Clicks */}
      <motion.div variants={itemVariants}>
        <RecentClicksTable clicks={analytics.recentClicks} />
      </motion.div>
    </motion.div>
  );
}

// Stat Card with icon and trend support
function StatCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: "cursor" | "users" | "qr";
  color: "violet" | "emerald";
  trend?: number; // percentage change from previous period
}) {
  const colorClasses = {
    violet:
      "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
    emerald:
      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  };

  const icons = {
    cursor: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    qr: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
        />
      </svg>
    ),
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icons[icon]}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </p>
        {trend !== undefined && trend !== 0 && (
          <span
            className={`flex items-center text-xs font-medium mb-1 ${
              trend > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend > 0 ? (
              <svg
                className="w-3 h-3 mr-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 mr-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Recent clicks table
function RecentClicksTable({
  clicks,
}: {
  clicks: AnalyticsData["recentClicks"];
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Recent Clicks
        </h3>
      </div>
      {clicks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Device
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Browser
                </th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((click, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-zinc-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                    {formatTimestamp(click.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                    {click.city && click.country
                      ? `${click.city}, ${click.country}`
                      : click.country || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm capitalize">
                    {click.deviceType || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                    {click.browser || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        click.sourceType === "qr"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"
                      }`}
                    >
                      {click.sourceType === "qr" ? "QR Code" : "Direct"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No clicks recorded yet
        </div>
      )}
    </div>
  );
}

// Format timestamp to relative time
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Time of Day Heatmap Component
function TimeOfDayChart({
  data,
}: {
  data: Array<{ hour: number; clicks: number }>;
}) {
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  const getIntensity = (clicks: number) => {
    const ratio = clicks / maxClicks;
    if (ratio === 0) return "bg-gray-100 dark:bg-zinc-800";
    if (ratio < 0.25) return "bg-violet-100 dark:bg-violet-500/20";
    if (ratio < 0.5) return "bg-violet-200 dark:bg-violet-500/40";
    if (ratio < 0.75) return "bg-violet-300 dark:bg-violet-500/60";
    return "bg-violet-500 dark:bg-violet-500";
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12am";
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return "12pm";
    return `${hour - 12}pm`;
  };

  return (
    <div className={`${CARD_STYLES} overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Clicks by Time of Day
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          When your links get the most clicks
        </p>
      </div>
      <div className="p-4">
        {/* Mobile: 6 cols, Tablet: 8 cols, Desktop: 12 cols */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1 mb-4">
          {data.map((item, i) => (
            <div key={i} className="text-center">
              <div
                className={`h-8 sm:h-10 md:h-12 rounded ${getIntensity(item.clicks)} transition-colors cursor-pointer hover:ring-2 hover:ring-violet-400`}
                title={`${formatHour(item.hour)}: ${item.clicks} clicks`}
              />
              {/* Show labels at 12am, 6am, 12pm, 6pm */}
              {i % 6 === 0 && (
                <span className="text-[10px] sm:text-xs text-gray-400 mt-1 block">
                  {formatHour(item.hour)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 gap-1">
          <span>🌙 Night</span>
          <span>🌅 Morning</span>
          <span>☀️ Afternoon</span>
          <span>🌆 Evening</span>
        </div>
        <div className="flex items-center justify-end gap-1 sm:gap-2 mt-4">
          <span className="text-[10px] sm:text-xs text-gray-400">Less</span>
          <div className="flex gap-0.5 sm:gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-100 dark:bg-zinc-800" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-violet-100 dark:bg-violet-500/20" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-violet-200 dark:bg-violet-500/40" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-violet-300 dark:bg-violet-500/60" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-violet-500 dark:bg-violet-500" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}

// UTM Breakdown Component
function UTMBreakdown({
  sources,
  mediums,
  campaigns,
}: {
  sources: Array<{ name: string; count: number }>;
  mediums: Array<{ name: string; count: number }>;
  campaigns: Array<{ name: string; count: number }>;
}) {
  const [activeTab, setActiveTab] = useState<
    "sources" | "mediums" | "campaigns"
  >("sources");

  const activeData =
    activeTab === "sources"
      ? sources
      : activeTab === "mediums"
        ? mediums
        : campaigns;

  const total = activeData.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className={`${CARD_STYLES} overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          UTM Campaign Tracking
        </h3>
        {/* Scrollable tabs on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {[
            { key: "sources", label: "Sources", count: sources.length },
            { key: "mediums", label: "Mediums", count: mediums.length },
            { key: "campaigns", label: "Campaigns", count: campaigns.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {activeData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No UTM data tracked yet. Add ?utm_source=... to your links.
          </p>
        ) : (
          <div className="space-y-3">
            {activeData.slice(0, 10).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-5">{i + 1}.</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name || "(direct)"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.count} ({((item.count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${(item.count / total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
