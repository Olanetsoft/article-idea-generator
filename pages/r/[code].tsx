import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  getLocalShortUrls,
  saveLocalClickEvent,
  parseReferrer,
  detectDeviceType,
  detectBrowser,
  detectOS,
  generateFingerprint,
  parseUtmParams,
} from "@/lib/analytics";
import { createServerClient } from "@/lib/supabase/server";
import type { ClickEvent, LocalShortUrl } from "@/types/analytics";

interface UrlData {
  code: string;
  originalUrl: string;
  title?: string;
  source: "supabase" | "localStorage";
}

interface RedirectPageProps {
  code: string;
  // URL data from Supabase (if found)
  supabaseUrl: {
    originalUrl: string;
    title: string | null;
  } | null;
  // Analytics data captured server-side
  clickData: {
    ip: string;
    userAgent: string;
    referrer: string | null;
    country?: string;
    city?: string;
    timestamp: string;
  };
}

export default function RedirectPage({
  code,
  supabaseUrl,
  clickData,
}: RedirectPageProps) {
  const [urlData, setUrlData] = useState<UrlData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // First check if we have Supabase data
    if (supabaseUrl) {
      setUrlData({
        code,
        originalUrl: supabaseUrl.originalUrl,
        title: supabaseUrl.title || undefined,
        source: "supabase",
      });
      return;
    }

    // Fall back to local storage
    const urls = getLocalShortUrls();
    const found = urls.find((u) => u.code === code);

    if (found) {
      setUrlData({
        code: found.code,
        originalUrl: found.originalUrl,
        title: found.title,
        source: "localStorage",
      });
    } else {
      setNotFound(true);
    }
  }, [code, supabaseUrl]);

  useEffect(() => {
    if (!urlData || isRedirecting) return;

    setIsRedirecting(true);

    // Check if click came from QR code scan
    const urlParams = new URLSearchParams(window.location.search);
    const sourceType = urlParams.get("source") === "qr" ? "qr" : "direct";
    const utmParams = parseUtmParams(window.location.href);

    // Track the click
    const trackClick = async () => {
      if (urlData.source === "supabase") {
        // Track via API for Supabase URLs
        try {
          await fetch("/api/urls/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              sourceType,
              utmParams,
            }),
          });
        } catch (error) {
          console.error("Failed to track click:", error);
        }
      } else {
        // Save to local storage for localStorage URLs
        const event: ClickEvent = {
          id: `${code}-${Date.now()}`,
          shortUrlId: code,
          timestamp: clickData.timestamp,
          ip: clickData.ip,
          userAgent: clickData.userAgent,
          referrer: parseReferrer(clickData.referrer),
          country: clickData.country,
          city: clickData.city,
          deviceType: detectDeviceType(clickData.userAgent),
          browser: detectBrowser(clickData.userAgent),
          os: detectOS(clickData.userAgent),
          fingerprint: generateFingerprint(
            clickData.userAgent,
            clickData.ip,
            typeof navigator !== "undefined" ? navigator.language : "",
          ),
          sourceType,
          utmSource: utmParams.utm_source,
          utmMedium: utmParams.utm_medium,
          utmCampaign: utmParams.utm_campaign,
        };

        saveLocalClickEvent(code, event);
      }

      // Redirect after tracking
      window.location.replace(urlData.originalUrl);
    };

    trackClick();
  }, [urlData, code, clickData, isRedirecting]);

  // Show 404 page for invalid codes
  if (notFound) {
    return (
      <>
        <Head>
          <title>Link Not Found | Article Idea Generator</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Link Not Found
            </h1>
            <p className="text-slate-400 mb-6">
              The shortened link{" "}
              <code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">
                aigl.ink/{code}
              </code>{" "}
              doesn&apos;t exist or has expired.
            </p>
            <Link
              href="/tools/url-shortener"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/25"
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Create a Short Link
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while looking up or redirecting
  return (
    <>
      <Head>
        <title>
          {urlData?.title
            ? `Redirecting to ${urlData.title}`
            : "Redirecting..."}{" "}
          | aigl.ink
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Redirecting...
          </h1>
          <p className="text-slate-400 text-sm">
            You&apos;re being redirected to your destination
          </p>
          {urlData?.originalUrl && (
            <p className="text-slate-500 text-xs mt-4 max-w-sm truncate">
              {urlData.originalUrl}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<RedirectPageProps> = async (
  context: GetServerSidePropsContext,
) => {
  const { code } = context.params as { code: string };

  // Get request info for analytics
  const forwarded = context.req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim() || "unknown";

  const userAgent = context.req.headers["user-agent"] || "unknown";
  const referrer = context.req.headers.referer || null;

  // Try to get geo data from Vercel headers
  const country =
    (context.req.headers["x-vercel-ip-country"] as string) || undefined;
  const city = (context.req.headers["x-vercel-ip-city"] as string) || undefined;

  const clickData = {
    ip,
    userAgent,
    referrer,
    country,
    city,
    timestamp: new Date().toISOString(),
  };

  // Try to find the URL in Supabase first
  let supabaseUrl: RedirectPageProps["supabaseUrl"] = null;

  try {
    const supabase = createServerClient(context.req, context.res);
    const { data } = await supabase
      .from("short_urls")
      .select("original_url, title")
      .eq("code", code)
      .single();

    if (data) {
      supabaseUrl = {
        originalUrl: data.original_url,
        title: data.title,
      };
    }
  } catch (error) {
    // Supabase not configured or error - will fall back to localStorage
    console.error("Supabase lookup error:", error);
  }

  return {
    props: {
      code,
      supabaseUrl,
      clickData,
    },
  };
};
