import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createServerClient } from "@supabase/ssr";

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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("30d");

  useEffect(() => {
    if (!code || !token) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/analytics/shared?token=${token}&period=${period}`,
        );
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [code, token, period]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Head>
          <title>Analytics Not Found | aigl.ink</title>
        </Head>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Not Available
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>
          Shared Analytics {analytics?.code ? `- ${analytics.code}` : ""} |
          aigl.ink
        </title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="h-6 w-6 text-violet-600" />
            <span className="text-sm text-gray-500">Shared Analytics</span>
          </div>
          {analytics && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                {analytics.title || analytics.code}
              </h1>
              <p className="text-gray-500 text-sm truncate max-w-xl">
                {analytics.originalUrl}
              </p>
            </>
          )}
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {["24h", "7d", "30d", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={
                  <CursorArrowRaysIcon className="h-5 w-5 text-violet-600" />
                }
                label="Total Clicks"
                value={analytics.totalClicks}
              />
              <StatCard
                icon={<CursorArrowRaysIcon className="h-5 w-5 text-blue-600" />}
                label="Unique Clicks"
                value={analytics.uniqueClicks}
              />
              <StatCard
                icon={<GlobeAltIcon className="h-5 w-5 text-green-600" />}
                label="Countries"
                value={analytics.countries.length}
              />
              <StatCard
                icon={
                  <DevicePhoneMobileIcon className="h-5 w-5 text-orange-600" />
                }
                label="QR Scans"
                value={analytics.qrScans}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Click Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Click Timeline
                </h3>
                <div className="h-64 flex items-end gap-1">
                  {analytics.timeline.slice(-30).map((day, i) => {
                    const maxClicks = Math.max(
                      ...analytics.timeline.map((d) => d.clicks),
                      1,
                    );
                    const height = (day.clicks / maxClicks) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-violet-500 rounded-t hover:bg-violet-600 transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${day.date}: ${day.clicks} clicks`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Time of Day Heatmap */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Time of Day
                </h3>
                <div className="grid grid-cols-12 gap-1">
                  {analytics.hourlyDistribution.map(({ hour, clicks }) => {
                    const maxClicks = Math.max(
                      ...analytics.hourlyDistribution.map((h) => h.clicks),
                      1,
                    );
                    const intensity = clicks / maxClicks;
                    return (
                      <div
                        key={hour}
                        className="aspect-square rounded flex items-center justify-center text-xs"
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
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Hour of day (0-23)
                </p>
              </div>

              {/* Top Countries */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Countries
                </h3>
                <div className="space-y-3">
                  {analytics.countries.slice(0, 5).map((country) => (
                    <div key={country.name} className="flex items-center gap-3">
                      <span className="text-gray-700 flex-1">
                        {country.name}
                      </span>
                      <span className="text-gray-500">{country.count}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{
                            width: `${(country.count / analytics.totalClicks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Types */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Devices
                </h3>
                <div className="space-y-3">
                  {analytics.devices.map((device) => (
                    <div key={device.name} className="flex items-center gap-3">
                      <span className="text-gray-700 flex-1 capitalize">
                        {device.name}
                      </span>
                      <span className="text-gray-500">{device.count}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(device.count / analytics.totalClicks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UTM Section */}
            {(analytics.utmSources.length > 0 ||
              analytics.utmMediums.length > 0 ||
              analytics.utmCampaigns.length > 0) && (
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  UTM Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <UTMList title="Sources" items={analytics.utmSources} />
                  <UTMList title="Mediums" items={analytics.utmMediums} />
                  <UTMList title="Campaigns" items={analytics.utmCampaigns} />
                </div>
              </div>
            )}

            {/* Top Referrers */}
            {analytics.referrers.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Referrers
                </h3>
                <div className="space-y-3">
                  {analytics.referrers.slice(0, 10).map((ref) => (
                    <div key={ref.name} className="flex items-center gap-3">
                      <span className="text-gray-700 flex-1 truncate">
                        {ref.name}
                      </span>
                      <span className="text-gray-500">{ref.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by{" "}
            <Link href="/" className="text-violet-600 hover:underline">
              aigl.ink
            </Link>{" "}
            - AI-Powered URL Shortener
          </p>
        </div>
      </div>
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
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
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
        <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
        <p className="text-sm text-gray-400">No data</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="text-gray-600 truncate">{item.name}</span>
            <span className="text-gray-400">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const token = params?.token as string;

  if (!token) {
    return { props: { error: "Invalid share link" } };
  }

  // Create a Supabase client to verify the token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = [];
          const cookieHeader = req.headers.cookie || "";
          cookieHeader.split(";").forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split("=");
            if (name) {
              cookies.push({ name, value: rest.join("=") });
            }
          });
          return cookies;
        },
        setAll() {
          // Read-only for getServerSideProps
        },
      },
    },
  );

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

  // Check expiration
  if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
    return { props: { error: "This share link has expired" } };
  }

  const shortUrl = shareToken.short_urls as unknown as { code: string };

  return {
    props: {
      code: shortUrl.code,
      token: token,
    },
  };
};
