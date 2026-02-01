import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

interface AnalyticsData {
  code: string;
  originalUrl: string;
  title: string | null;
  createdAt: string;
  totalClicks: number;
  uniqueClicks: number;
  qrScans: number;
  countries: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
  sources: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  timeline: Array<{ date: string; clicks: number }>;
  recentClicks: Array<{
    timestamp: string;
    country: string | null;
    city: string | null;
    deviceType: string | null;
    browser: string | null;
    sourceType: string | null;
    referrer: string | null;
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
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [isExporting, setIsExporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            originalUrl: url.original_url,
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
    if (!selectedCode) return;

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/urls/${selectedCode}/analytics?period=${period}`,
        );
        if (!response.ok) throw new Error("Failed to fetch analytics");

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [selectedCode, period]);

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

  const handleLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCode(newCode);
    router.push(`/dashboard/analytics?code=${newCode}`, undefined, {
      shallow: true,
    });
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
                          aigl.ink/{selectedLink.code}
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
                      <div className="max-h-80 overflow-y-auto">
                        {links.map((link) => (
                          <button
                            key={link.id}
                            type="button"
                            onClick={() => {
                              setSelectedCode(link.code);
                              setIsDropdownOpen(false);
                              router.push(
                                `/dashboard/analytics?code=${link.code}`,
                                undefined,
                                { shallow: true },
                              );
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0 ${
                              selectedCode === link.code
                                ? "bg-violet-50 dark:bg-violet-500/10"
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
                                aigl.ink/{link.code}
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
                              {link.title || truncateUrl(link.originalUrl, 50)}
                            </p>
                          </button>
                        ))}
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
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Period:
                </span>
                <div className="flex bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-1">
                  {(["7d", "30d", "90d", "all"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
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
                            : "All Time"}
                    </button>
                  ))}
                </div>
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
                    <a
                      href={`https://aigl.ink/${selectedLink.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 font-mono hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                      aigl.ink/{selectedLink.code}
                    </a>
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                      → {selectedLink.originalUrl}
                    </p>
                  </div>
                  <Link
                    href={`/tools/qr-code-generator?url=https://aigl.ink/${selectedLink.code}`}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm"
                  >
                    Generate QR Code
                  </Link>
                </div>
              </motion.div>
            )}

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
      {analytics.timeline.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <ClicksChart data={analytics.timeline} />
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

      {/* Recent Clicks */}
      <motion.div variants={itemVariants}>
        <RecentClicksTable clicks={analytics.recentClicks} />
      </motion.div>
    </motion.div>
  );
}

// Stat Card with icon support
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: "cursor" | "users" | "qr";
  color: "violet" | "emerald";
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
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </p>
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
