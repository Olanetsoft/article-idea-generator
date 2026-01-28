import Head from "next/head";
import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

export default function FAQ(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>{`FAQ - Article Idea Generator | ${t("faq.pageTitle")}`}</title>
        <meta
          name="description"
          content="Get answers to common questions about our free AI-powered article title generator. Learn how to generate SEO-optimized titles, create abstracts, and maximize your content creation."
        />
        <meta
          name="keywords"
          content="article generator FAQ, how to use article generator, AI title generator help, content creation questions, SEO title tips, article writing help"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={`${SITE_URL}/faq`} />

        {/* Hreflang for FAQ page */}
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/faq`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/faq`} />

        {/* Robots */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Open Graph */}
        <meta property="og:site_name" content="Article Idea Generator" />
        <meta
          property="og:title"
          content={`FAQ - Article Idea Generator | ${t("faq.pageTitle")}`}
        />
        <meta
          property="og:description"
          content="Get answers to common questions about our free AI-powered article title generator. Learn how to generate SEO-optimized titles and create abstracts."
        />
        <meta
          property="og:url"
          content="https://articleideagenerator.com/faq"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://articleideagenerator.com/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Article Idea Generator FAQ - Frequently Asked Questions"
        />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`FAQ - Article Idea Generator | ${t("faq.pageTitle")}`}
        />
        <meta
          name="twitter:description"
          content="Get answers to common questions about our free AI-powered article title generator."
        />
        <meta
          name="twitter:image"
          content="https://articleideagenerator.com/og-image.png"
        />

        {/* Structured Data for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: t("faq.q1"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a1"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q2"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a2"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q3"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a3"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q4"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a4"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q5"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a5"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q6"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a6"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q7"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a7"),
                  },
                },
                {
                  "@type": "Question",
                  name: t("faq.q8"),
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: t("faq.a8"),
                  },
                },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: t("header.home"),
                  item: "https://articleideagenerator.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "FAQ",
                  item: "https://articleideagenerator.com/faq",
                },
              ],
            }),
          }}
        />
      </Head>

      <Header />

      <div className="flex flex-col items-center pt-8 sm:pt-14 w-full px-4 lg:px-0 max-w-screen-md flex-grow pb-8">
        {/* Breadcrumb */}
        <nav className="w-full mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-indigo-500 dark:hover:text-indigo-400 transition"
              >
                {t("header.home")}
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 dark:text-gray-200 font-semibold">
              FAQ
            </li>
          </ol>
        </nav>

        <h1
          className={`${spaceGrotesk.className} text-2xl font-bold text-gray-900 dark:text-zinc-300 leading-tight mb-4 text-center sm:text-4xl lg:text-5xl`}
        >
          {t("faq.pageTitle")}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
          {t("faq.pageDescription")}
        </p>

        <div className="w-full space-y-4 mb-8">
          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q1")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a1")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q2")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a2")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q3")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a3")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q4")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a4")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q5")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a5")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q6")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a6")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q7")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a7")}
            </p>
          </details>

          <details className="bg-white dark:bg-dark-card p-5 rounded-lg border border-gray-200 dark:border-dark-border group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              {t("faq.q8")}
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("faq.a8")}
            </p>
          </details>
        </div>

        <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-200 mb-2">
            {t("faq.ctaTitle")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("faq.ctaDescription")}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
          >
            {t("faq.ctaButton")}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
