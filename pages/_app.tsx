import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import { Inter } from "@next/font/google";
import ErrorBoundary from "../components/ErrorBoundary";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/gtag";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url, document.title);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* Google Analytics 4 */}
      {GA_MEASUREMENT_ID && (
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
        <ErrorBoundary>
          <main className={inter.className}>
            <Component {...pageProps} />
            <Analytics />
          </main>
        </ErrorBoundary>
      </ThemeProvider>
    </>
  );
}
