import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DashboardLayout,
  ClicksChart,
  DeviceChart,
  GeoChart,
  ReferrerList,
  SourceComparison,
} from "@/components";
import { useAuth } from "@/contexts";

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
          {/* Link Selector */}
          <motion.div variants={itemVariants} className="mb-8">
            <label
              htmlFor="link-select"
              className="block text-slate-400 text-sm mb-2"
            >
              Select a link to view analytics
            </label>
            <select
              id="link-select"
              value={selectedCode || ""}
              onChange={handleLinkChange}
              className="w-full max-w-md px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
            >
              {links.map((link) => (
                <option key={link.id} value={link.code}>
                  aigl.ink/{link.code} -{" "}
                  {link.title || truncateUrl(link.originalUrl, 40)}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Date Range & Export Controls */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-wrap items-center gap-4"
          >
            {/* Date Range Picker */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Period:</span>
              <div className="flex bg-slate-800/50 rounded-lg border border-slate-700/50 p-1">
                {(["7d", "30d", "90d", "all"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      period === p
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-400 hover:text-white"
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
              <span className="text-slate-400 text-sm">Export:</span>
              <button
                onClick={() => handleExport("csv")}
                disabled={isExporting || !analytics}
                className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
                className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
              className="mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <a
                    href={`https://aigl.ink/${selectedLink.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 font-mono hover:text-cyan-300 transition-colors"
                  >
                    aigl.ink/{selectedLink.code}
                  </a>
                  <p className="text-slate-500 text-sm truncate">
                    → {selectedLink.originalUrl}
                  </p>
                </div>
                <Link
                  href={`/tools/qr-code-generator?url=https://aigl.ink/${selectedLink.code}`}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Generate QR Code
                </Link>
              </div>
            </motion.div>
          )}

          {error ? (
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
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
        <div className="h-12 bg-slate-700/50 rounded-xl w-full max-w-md mb-8" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-700/50 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-slate-700/50 rounded-xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-700/50 rounded-xl" />
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
      className="p-12 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center"
    >
      <svg
        className="w-16 h-16 mx-auto mb-4 text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-slate-400 mb-4">
        Create links to start tracking analytics.
      </p>
      <Link
        href="/tools/url-shortener"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
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
          color="cyan"
        />
        <StatCard
          title="Unique Clicks"
          value={analytics.uniqueClicks}
          icon="users"
          color="blue"
        />
        <StatCard
          title="QR Scans"
          value={analytics.qrScans}
          icon="qr"
          color="green"
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
  color: "cyan" | "blue" | "green";
}) {
  const colorClasses = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
  };

  const icons = {
    cursor: (
      <svg
        className="w-6 h-6"
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
        className="w-6 h-6"
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
        className="w-6 h-6"
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
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icons[icon]}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
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
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white">Recent Clicks</h3>
      </div>
      {clicks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">
                  Device
                </th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">
                  Browser
                </th>
                <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((click, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {formatTimestamp(click.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {click.city && click.country
                      ? `${click.city}, ${click.country}`
                      : click.country || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm capitalize">
                    {click.deviceType || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {click.browser || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        click.sourceType === "qr"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-cyan-500/20 text-cyan-400"
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
        <div className="p-8 text-center text-slate-400">
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
