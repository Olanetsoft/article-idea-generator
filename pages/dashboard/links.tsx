import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { DashboardLayout } from "@/components";
import { useAuth } from "@/contexts";
import { SITE_NAME } from "@/lib/constants";

interface ShortUrl {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
  clickCount: number;
  uniqueClickCount: number;
  qrScanCount: number;
  createdAt: string;
}

export default function LinksPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchLinks();
  }, [user]);

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
          clickCount: url.click_count || 0,
          uniqueClickCount: url.unique_click_count || 0,
          qrScanCount: url.qr_scan_count || 0,
          createdAt: url.created_at,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete aigl.ink/${code}?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/urls?code=${code}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete link");

      setLinks(links.filter((link) => link.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete link");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`https://aigl.ink/${code}`);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Head>
        <title>My Links | {SITE_NAME}</title>
        <meta
          name="description"
          content="Manage and track all your shortened URLs. View click statistics and analytics for each link."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <DashboardLayout
        title="My Links"
        description="Manage and track all your shortened links"
      >
        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <Link
            href="/tools/url-shortener"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Link
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-5 w-32 bg-slate-700 rounded" />
                  <div className="h-4 w-48 bg-slate-700 rounded" />
                  <div className="ml-auto h-8 w-20 bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-12 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            {searchQuery ? (
              <>
                <p className="text-slate-400 mb-2">
                  No links found matching &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <p className="text-slate-400 mb-4">
                  You haven&apos;t created any links yet.
                </p>
                <Link
                  href="/tools/url-shortener"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors"
                >
                  Create Your First Link
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <a
                        href={`https://aigl.ink/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 font-mono text-lg hover:text-cyan-300 transition-colors"
                      >
                        aigl.ink/{link.code}
                      </a>
                      <button
                        onClick={() => handleCopy(link.code)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          copiedCode === link.code
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-700/50 text-slate-400 hover:text-white"
                        }`}
                        title="Copy link"
                      >
                        {copiedCode === link.code ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
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
                        )}
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm truncate mb-1">
                      {link.title || link.originalUrl}
                    </p>
                    <p className="text-slate-500 text-xs">
                      Created {formatDate(link.createdAt)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {link.clickCount}
                      </p>
                      <p className="text-slate-500 text-xs">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {link.uniqueClickCount}
                      </p>
                      <p className="text-slate-500 text-xs">Unique</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        {link.qrScanCount}
                      </p>
                      <p className="text-slate-500 text-xs">QR Scans</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/analytics?code=${link.code}`}
                      className="p-2.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="View Analytics"
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
                    <Link
                      href={`/tools/qr-code-generator?url=https://aigl.ink/${link.code}`}
                      className="p-2.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Generate QR Code"
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
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(link.id, link.code)}
                      disabled={deletingId === link.id}
                      className="p-2.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete Link"
                    >
                      {deletingId === link.id ? (
                        <svg
                          className="w-5 h-5 animate-spin"
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
                      ) : (
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && !error && filteredLinks.length > 0 && (
          <p className="text-slate-500 text-sm mt-6 text-center">
            Showing {filteredLinks.length} of {links.length} links
          </p>
        )}
      </DashboardLayout>
    </>
  );
}
