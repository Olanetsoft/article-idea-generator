import Head from "next/head";
import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import { ArrowRightIcon } from "@heroicons/react/solid";
import { Header, Footer, ToolCard } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { tools } from "@/lib/tools-config";
import { SITE_URL, SITE_NAME, getFullUrl } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

export default function ToolsPage(): JSX.Element {
  const { t, locale } = useTranslation();
  const pageUrl = getFullUrl("/tools", locale);

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>
          {t("tools.pageTitle")} | {SITE_NAME}
        </title>
        <meta name="description" content={t("tools.pageDescription")} />
        <meta
          name="keywords"
          content="word counter, character counter, reading time calculator, headline analyzer, title case converter, case changer, qr code generator, free writing tools, content writing tools, SEO tools, blog writing tools, article writing tools, text analyzer"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={pageUrl} />

        {/* Hreflang */}
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/tools`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/tools`} />

        {/* Robots */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta
          property="og:title"
          content={`${t("tools.pageTitle")} | ${SITE_NAME}`}
        />
        <meta property="og:description" content={t("tools.pageDescription")} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Free Writing Tools - Word Counter, Character Counter, Reading Time Calculator"
        />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${t("tools.pageTitle")} | ${SITE_NAME}`}
        />
        <meta name="twitter:description" content={t("tools.pageDescription")} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: t("tools.pageTitle"),
              description: t("tools.pageDescription"),
              url: pageUrl,
              isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
              },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: tools.map((tool, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: t(tool.nameKey),
                  url: `${SITE_URL}${tool.href}`,
                })),
              },
            }),
          }}
        />

        {/* Breadcrumb Schema */}
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
                  item: getFullUrl("/", locale),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: t("tools.pageTitle"),
                  item: pageUrl,
                },
              ],
            }),
          }}
        />
      </Head>

      <Header />

      <main className="flex-1 w-full max-w-screen-lg px-4 py-6 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {t("header.home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 dark:text-zinc-100 font-medium">
              {t("header.tools")}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-8 sm:mb-12">
          <h1
            className={`${spaceGrotesk.className} text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-3 sm:mb-4`}
          >
            {t("tools.heroTitle")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            {t("tools.heroDescription")}
          </p>

          {/* CTA to main generator */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm sm:text-base"
          >
            {t("tools.cta")}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </section>

        {/* Tools Grid */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-4 sm:mb-6">
            {t("tools.availableTools")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                nameKey={tool.nameKey}
                descriptionKey={tool.descriptionKey}
                href={tool.href}
                icon={tool.icon}
                available={tool.available}
              />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-8 sm:mt-12 p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
            {t("tools.bottomCtaTitle")}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            {t("tools.bottomCtaDescription")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-sm sm:text-base"
          >
            {t("tools.tryGenerator")}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
