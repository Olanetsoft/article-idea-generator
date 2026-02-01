import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components";
import { useAuth } from "@/contexts";

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  uniqueClicks: number;
  qrScans: number;
  topLink: {
    code: string;
    originalUrl: string;
    title: string | null;
    clickCount: number;
  } | null;
  recentLinks: Array<{
    id: string;
    code: string;
    originalUrl: string;
    title: string | null;
    clickCount: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/urls");
        if (!response.ok) throw new Error("Failed to fetch links");

        const { urls } = await response.json();

        // Calculate stats
        const totalLinks = urls.length;
        const totalClicks = urls.reduce(
          (acc: number, url: any) => acc + (url.click_count || 0),
          0,
        );
        const uniqueClicks = urls.reduce(
          (acc: number, url: any) => acc + (url.unique_click_count || 0),
          0,
        );
        const qrScans = urls.reduce(
          (acc: number, url: any) => acc + (url.qr_scan_count || 0),
          0,
        );

        // Find top link
        const sortedByClicks = [...urls].sort(
          (a: any, b: any) => (b.click_count || 0) - (a.click_count || 0),
        );
        const topLink = sortedByClicks[0]
          ? {
              code: sortedByClicks[0].code,
              originalUrl: sortedByClicks[0].original_url,
              title: sortedByClicks[0].title,
              clickCount: sortedByClicks[0].click_count || 0,
            }
          : null;

        // Recent links
        const recentLinks = urls.slice(0, 5).map((url: any) => ({
          id: url.id,
          code: url.code,
          originalUrl: url.original_url,
          title: url.title,
          clickCount: url.click_count || 0,
          createdAt: url.created_at,
        }));

        setStats({
          totalLinks,
          totalClicks,
          uniqueClicks,
          qrScans,
          topLink,
          recentLinks,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your links and analytics"
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 animate-pulse"
            >
              <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Links"
              value={stats?.totalLinks || 0}
              icon={
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              }
              color="violet"
            />
            <StatsCard
              title="Total Clicks"
              value={stats?.totalClicks || 0}
              icon={
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
              }
              color="violet"
            />
            <StatsCard
              title="Unique Clicks"
              value={stats?.uniqueClicks || 0}
              icon={
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
              }
              color="violet"
            />
            <StatsCard
              title="QR Scans"
              value={stats?.qrScans || 0}
              icon={
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
              }
              color="emerald"
            />
          </div>

          {/* Top Performing Link */}
          {stats?.topLink && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Performing Link
              </h2>
              <div className="p-5 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-violet-600 dark:text-violet-400 font-mono text-base mb-1">
                      aigl.ink/{stats.topLink.code}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 truncate text-sm">
                      {stats.topLink.title || stats.topLink.originalUrl}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.topLink.clickCount.toLocaleString()}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      clicks
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/analytics?code=${stats.topLink.code}`}
                  className="inline-flex items-center gap-2 mt-4 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-sm font-medium"
                >
                  View Analytics
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Links */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Links
              </h2>
              <Link
                href="/dashboard/links"
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            {stats?.recentLinks && stats.recentLinks.length > 0 ? (
              <div className="space-y-3">
                {stats.recentLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-violet-600 dark:text-violet-400 font-mono text-sm">
                        aigl.ink/{link.code}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                        {link.title || link.originalUrl}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {link.clickCount}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">
                          clicks
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/analytics?code=${link.code}`}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                      >
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven&apos;t created any links yet.
                </p>
                <Link
                  href="/tools/url-shortener"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Create Your First Link
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "violet" | "emerald";
}) {
  const colorClasses = {
    violet:
      "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
    emerald:
      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
