import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import localFont from "@next/font/local";
import ErrorBoundary from "../components/ErrorBoundary";

const productSans = localFont({
  src: [
    {
      path: "./ProductSans-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./ProductSans-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./ProductSans-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider enableSystem={true} attribute="class">
        <ErrorBoundary>
          <main className={productSans.className}>
            <Component {...pageProps} />
            <Analytics />
          </main>
        </ErrorBoundary>
      </ThemeProvider>
    </>
  );
}
