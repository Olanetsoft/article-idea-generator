import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  DashboardLayout,
  ClicksChart,
  DeviceChart,
  GeoChart,
  ReferrerList,
  SourceComparison,
} from "@/components";
import { useAuth } from "@/contexts";

interface Analytics {
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
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const response = await fetch(`/api/urls/${selectedCode}/analytics`);
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
  }, [selectedCode]);

  const handleLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCode(newCode);
    router.push(`/dashboard/analytics?code=${newCode}`, undefined, {
      shallow: true,
    });
  };

  const selectedLink = links.find((l) => l.code === selectedCode);

  return (
    <DashboardLayout
      title="Analytics"
      description="Detailed analytics for your links"
    >
      {isLoadingLinks ? (
        <div className="animate-pulse">
          <div className="h-12 bg-slate-700 rounded-xl w-full max-w-md mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      ) : links.length === 0 ? (
        <div className="p-12 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors"
          >
            Create Your First Link
          </Link>
        </div>
      ) : (
        <>
          {/* Link Selector */}
          <div className="mb-8">
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
              className="w-full max-w-md px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            >
              {links.map((link) => (
                <option key={link.id} value={link.code}>
                  aigl.ink/{link.code} - {link.title || link.originalUrl}
                </option>
              ))}
            </select>
          </div>

          {selectedLink && (
            <div className="mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
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
            </div>
          )}

          {error ? (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          ) : isLoadingAnalytics ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-700 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-700 rounded-xl" />
                ))}
              </div>
            </div>
          ) : analytics ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Total Clicks"
                  value={analytics.totalClicks}
                  icon={
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
                  }
                  color="cyan"
                />
                <StatCard
                  title="Unique Clicks"
                  value={analytics.uniqueClicks}
                  icon={
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
                  }
                  color="blue"
                />
                <StatCard
                  title="QR Scans"
                  value={analytics.qrScans}
                  icon={
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
                  }
                  color="green"
                />
              </div>

              {/* Timeline Chart */}
              {analytics.timeline.length > 0 && (
                <div className="mb-8">
                  <ClicksChart data={analytics.timeline} />
                </div>
              )}

              {/* QR vs Direct Comparison */}
              <div className="mb-8">
                <SourceComparison
                  qrScans={analytics.qrScans}
                  directClicks={analytics.totalClicks - analytics.qrScans}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Geographic */}
                <GeoChart
                  data={analytics.countries}
                  title="Top Countries"
                  type="country"
                />

                {/* Devices */}
                <DeviceChart
                  data={analytics.devices}
                  title="Devices"
                  type="device"
                />

                {/* Browsers */}
                <DeviceChart
                  data={analytics.browsers}
                  title="Browsers"
                  type="browser"
                />

                {/* Referrers */}
                <ReferrerList
                  data={analytics.referrers}
                  title="Top Referrers"
                />
              </div>

              {/* Recent Clicks */}
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white">
                    Recent Clicks
                  </h3>
                </div>
                {analytics.recentClicks.length > 0 ? (
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
                        {analytics.recentClicks.map((click, i) => (
                          <tr
                            key={i}
                            className="border-b border-slate-700/30 last:border-0"
                          >
                            <td className="px-4 py-3 text-slate-300 text-sm">
                              {formatTimestamp(click.timestamp)}
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-sm">
                              {click.city && click.country
                                ? `${click.city}, ${click.country}`
                                : click.country || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-sm">
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
                                {click.sourceType === "qr"
                                  ? "QR Code"
                                  : "Direct"}
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
            </>
          ) : null}
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "cyan" | "blue" | "green";
}) {
  const colorClasses = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // More than 24 hours
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
