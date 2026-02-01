import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import { Inter } from "@next/font/google";
import ErrorBoundary from "../components/ErrorBoundary";
import { AuthProvider } from "@/contexts";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/gtag";
import {
  CookieConsent,
  hasAnalyticsConsent,
} from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Check consent status on mount and when consent changes
  useEffect(() => {
    setAnalyticsEnabled(hasAnalyticsConsent());

    const handleConsentUpdate = () => {
      setAnalyticsEnabled(hasAnalyticsConsent());
    };

    window.addEventListener("consent-updated", handleConsentUpdate);
    return () =>
      window.removeEventListener("consent-updated", handleConsentUpdate);
  }, []);

  // Track page views on route change (only if consented)
  useEffect(() => {
    if (!analyticsEnabled) return;

    const handleRouteChange = (url: string) => {
      pageview(url, document.title);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, analyticsEnabled]);

  return (
    <>
      {/* Google Analytics 4 - Only load if user has consented */}
      {GA_MEASUREMENT_ID && analyticsEnabled && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      <ThemeProvider enableSystem={true} attribute="class">
        <AuthProvider>
          <ErrorBoundary>
            <main className={inter.className}>
              <Component {...pageProps} />
              {/* Vercel Analytics - Only load if user has consented */}
              {analyticsEnabled && <Analytics />}
              <CookieConsent />
            </main>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
