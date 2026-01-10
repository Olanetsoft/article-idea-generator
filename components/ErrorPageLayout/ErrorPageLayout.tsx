import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface ErrorPageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  statusCode: number;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function ErrorPageLayout({
  children,
  title,
  description,
  statusCode,
  noindex = true,
  nofollow = false,
}: ErrorPageLayoutProps) {
  const robotsContent = `${noindex ? "noindex" : "index"}, ${
    nofollow ? "nofollow" : "follow"
  }`;

  return (
    <>
      <Head>
        <title>
          {statusCode} - {title} | {SITE_NAME}
        </title>
        <meta name="description" content={description} />
        <meta name="robots" content={robotsContent} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`${statusCode} - ${title} | ${SITE_NAME}`}
        />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/${statusCode}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`${statusCode} - ${title} | ${SITE_NAME}`}
        />
        <meta name="twitter:description" content={description} />
      </Head>

      <main className="flex-grow flex flex-col items-center justify-center w-full px-4">
        {children}
      </main>
    </>
  );
}

interface ErrorActionsProps {
  primaryLabel: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function ErrorActions({
  primaryLabel,
  primaryHref,
  primaryOnClick,
  secondaryLabel,
  secondaryHref,
}: ErrorActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {primaryOnClick ? (
        <button
          onClick={primaryOnClick}
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {primaryLabel}
        </button>
      ) : (
        <Link
          href={primaryHref || "/"}
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {primaryLabel}
        </Link>
      )}
      {secondaryLabel && secondaryHref && (
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {secondaryLabel}
        </Link>
      )}
    </div>
  );
}
