import Link from "next/link";
import { Header, Footer, ErrorPageLayout } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";

export default function Custom500() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Header />

      <ErrorPageLayout
        statusCode={500}
        title={t("serverError.title")}
        description={t("serverError.metaDescription")}
        noindex={true}
        nofollow={true}
      >
        <div className="text-center max-w-lg">
          {/* Server Error Icon */}
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            500
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {t("serverError.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t("serverError.description")}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t("serverError.tryAgain")}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t("serverError.goHome")}
            </Link>
          </div>

          {/* Status Check */}
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
            {t("serverError.persistsMessage")}{" "}
            <a
              href="https://github.com/Olanetsoft/article-idea-generator/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
            >
              {t("serverError.githubIssues")}
            </a>{" "}
            {t("serverError.orTryLater")}
          </p>
        </div>
      </ErrorPageLayout>

      <Footer />
    </div>
  );
}
