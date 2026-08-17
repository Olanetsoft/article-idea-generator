import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { createServerClient } from "@/lib/supabase/server";

// Shared card treatment matching the dashboard (border, no shadow)
const CARD_STYLES =
  "bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800";

interface SharedAnalyticsProps {
  error?: string;
  code?: string;
  token?: string;
}

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
  utmSources: Array<{ name: string; count: number }>;
  utmMediums: Array<{ name: string; count: number }>;
  utmCampaigns: Array<{ name: string; count: number }>;
  hourlyDistribution: Array<{ hour: number; clicks: number }>;
}

// Inline SVG Icon Components
function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function CursorArrowRaysIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  );
}

function GlobeAltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  );
}

function DevicePhoneMobileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function SharedAnalyticsPage({
  error,
  code,
  token,
}: SharedAnalyticsProps) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("30d");
  const hasReadQueryRef = useRef(false);

  // Read initial period from the URL once
  useEffect(() => {
    if (!router.isReady || hasReadQueryRef.current) return;
    hasReadQueryRef.current = true;
    const { period: qPeriod } = router.query;
    if (
      typeof qPeriod === "string" &&
      ["24h", "7d", "30d", "all"].includes(qPeriod)
    ) {
      setPeriod(qPeriod);
    }
  }, [router.isReady, router.query]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    const query = { ...router.query };
    if (p === "30d") {
      delete query.period;
    } else {
      query.period = p;
    }
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  const fetchAnalytics = useCallback(async () => {
    if (!code || !token) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/analytics/shared?token=${token}&period=${period}`,
      );
      if (!res.ok) {
        throw new Error("Failed to load analytics");
      }
      const data = await res.json();
      setAnalytics(data);
    } catch {
      setFetchError(
        "We couldn't load these analytics. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [code, token, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Head>
          <title>Analytics Not Found | aigl.ink</title>
        </Head>
        <main id="main-content" className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Head>
        <title>
          Shared Analytics {analytics?.code ? `- ${analytics.code}` : ""} |
          aigl.ink
        </title>
      </Head>

      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Shared Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics
              ? analytics.title || analytics.code
              : "Link Analytics"}
          </h1>
          {analytics && (
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-xl">
              {analytics.originalUrl}
            </p>
          )}
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["24h", "7d", "30d", "all"].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? "bg-violet-600 text-white"
                  : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800"
              }`}
            >
              {p === "24h"
                ? "24 Hours"
                : p === "7d"
                  ? "7 Days"
                  : p === "30d"
                    ? "30 Days"
                    : "All Time"}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <span className="sr-only">Loading analytics…</span>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`${CARD_STYLES} animate-pulse`}
                aria-hidden="true"
              >
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div
            role="alert"
            className="p-6 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400"
          >
            <p className="mb-4">{fetchError}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={
                  <CursorArrowRaysIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                }
                label="Total Clicks"
                value={analytics.totalClicks}
              />
              <StatCard
                icon={
                  <CursorArrowRaysIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                }
                label="Unique Clicks"
                value={analytics.uniqueClicks}
              />
              <StatCard
                icon={
                  <GlobeAltIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                }
                label="Countries"
                value={analytics.countries.length}
              />
              <StatCard
                icon={
                  <DevicePhoneMobileIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                }
                label="QR Scans"
                value={analytics.qrScans}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Click Timeline */}
              <div className={CARD_STYLES}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Click Timeline
                </h2>
                <div className="h-64 flex items-end gap-1">
                  {(() => {
                    const timelineWindow = analytics.timeline.slice(-30);
                    // Scale against the max of the rendered window, not the
                    // full timeline, so bar heights are correct
                    const maxClicks = Math.max(
                      ...timelineWindow.map((d) => d.clicks),
                      1,
                    );
                    return timelineWindow.map((day, i) => {
                      const height = (day.clicks / maxClicks) * 100;
                      return (
                        <div
                          key={i}
                          role="img"
                          aria-label={`${day.date}: ${day.clicks} clicks`}
                          className="flex-1 bg-violet-500 rounded-t hover:bg-violet-600 transition-colors"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${day.date}: ${day.clicks} clicks`}
                        />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Time of Day Heatmap */}
              <div className={CARD_STYLES}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Time of Day
                </h2>
                {/* Scrolls horizontally on small screens so cells stay usable */}
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-12 gap-1 min-w-[420px]">
                    {analytics.hourlyDistribution.map(({ hour, clicks }) => {
                      const maxClicks = Math.max(
                        ...analytics.hourlyDistribution.map((h) => h.clicks),
                        1,
                      );
                      const intensity = clicks / maxClicks;
                      return (
                        <div
                          key={hour}
                          role="img"
                          aria-label={`${hour}:00 – ${clicks} clicks`}
                          className="aspect-square rounded flex items-center justify-center text-xs tabular-nums"
                          style={{
                            backgroundColor: `rgba(139, 92, 246, ${Math.max(intensity, 0.1)})`,
                            color: intensity > 0.5 ? "white" : "#6b7280",
                          }}
                          title={`${hour}:00 - ${clicks} clicks`}
                        >
                          {hour}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Hour of day (0-23)
                </p>
              </div>

              {/* Top Countries */}
              <div className={CARD_STYLES}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Countries
                </h2>
                <div className="space-y-3">
                  {analytics.countries.slice(0, 5).map((country) => {
                    const percent = analytics.totalClicks
                      ? (country.count / analytics.totalClicks) * 100
                      : 0;
                    return (
                      <div
                        key={country.name}
                        className="flex items-center gap-3"
                      >
                        <span className="text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">
                          {country.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                          {country.count.toLocaleString()}
                        </span>
                        <div className="w-24 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device Types */}
              <div className={CARD_STYLES}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Devices
                </h2>
                <div className="space-y-3">
                  {analytics.devices.map((device) => {
                    const percent = analytics.totalClicks
                      ? (device.count / analytics.totalClicks) * 100
                      : 0;
                    return (
                      <div
                        key={device.name}
                        className="flex items-center gap-3"
                      >
                        <span className="text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate capitalize">
                          {device.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                          {device.count.toLocaleString()}
                        </span>
                        <div className="w-24 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* UTM Section */}
            {(analytics.utmSources.length > 0 ||
              analytics.utmMediums.length > 0 ||
              analytics.utmCampaigns.length > 0) && (
              <div className={`${CARD_STYLES} mb-8`}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  UTM Parameters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <UTMList title="Sources" items={analytics.utmSources} />
                  <UTMList title="Mediums" items={analytics.utmMediums} />
                  <UTMList title="Campaigns" items={analytics.utmCampaigns} />
                </div>
              </div>
            )}

            {/* Top Referrers */}
            {analytics.referrers.length > 0 && (
              <div className={CARD_STYLES}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Referrers
                </h2>
                <div className="space-y-3">
                  {analytics.referrers.slice(0, 10).map((ref) => (
                    <div key={ref.name} className="flex items-center gap-3">
                      <span className="text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">
                        {ref.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                        {ref.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No analytics data available
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by{" "}
            <Link
              href="/"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              aigl.ink
            </Link>{" "}
            - AI-Powered URL Shortener
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className={CARD_STYLES}>
      <div className="flex items-center gap-2 mb-1">
        <span aria-hidden="true">{icon}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function UTMList({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
}) {
  if (items.length === 0) {
    return (
      <div>
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">No data</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 truncate">
              {item.name}
            </span>
            <span className="text-gray-400 dark:text-gray-500 tabular-nums">
              {item.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.params?.token as string;

  if (!token) {
    return { props: { error: "Invalid share link" } };
  }

  // Create a Supabase client using the centralized wrapper for consistent cookie handling
  const supabase = createServerClient(context.req, context.res);

  // Verify the share token exists and is valid
  const { data: shareToken, error } = await supabase
    .from("analytics_share_tokens")
    .select(
      `
      token,
      expires_at,
      is_active,
      short_urls!inner(code)
    `,
    )
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error || !shareToken) {
    return { props: { error: "This share link is invalid or has expired" } };
  }

  // Type assertion for the result - shareToken is typed from the query
  const tokenData = shareToken as {
    token: string;
    expires_at: string | null;
    is_active: boolean;
    short_urls: { code: string };
  };

  // Check expiration
  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return { props: { error: "This share link has expired" } };
  }

  return {
    props: {
      code: tokenData.short_urls.code,
      token: token,
    },
  };
};
