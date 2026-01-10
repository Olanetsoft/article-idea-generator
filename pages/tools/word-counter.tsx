import { useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import { Header, Footer } from "@/components";
import { StatsPanel, type TextStats } from "@/components/tools";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

// Common English stop words to filter from keyword analysis
const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "here",
  "there",
  "then",
  "once",
  "if",
  "because",
  "until",
  "while",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "any",
  "your",
  "my",
  "his",
  "her",
  "our",
  "their",
  "me",
  "him",
  "us",
  "them",
]);

const DEFAULT_STATS: TextStats = {
  words: 0,
  characters: 0,
  charactersNoSpaces: 0,
  sentences: 0,
  paragraphs: 0,
  readingTime: 0,
  speakingTime: 0,
  topKeywords: [],
};

export default function WordCounterPage(): JSX.Element {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [stats, setStats] = useState<TextStats>(DEFAULT_STATS);

  const analyzeText = useCallback((inputText: string) => {
    setText(inputText);

    if (!inputText.trim()) {
      setStats(DEFAULT_STATS);
      return;
    }

    // Word count
    const words = inputText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;

    // Character counts
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, "").length;

    // Sentence count (split by . ! ? followed by space or end)
    const sentences = inputText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;

    // Paragraph count (split by double newlines)
    const paragraphs =
      inputText.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length ||
      (inputText.trim() ? 1 : 0);

    // Time estimates (200 WPM reading, 150 WPM speaking)
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const speakingTime = Math.max(1, Math.ceil(wordCount / 150));

    // Keyword density analysis
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (cleanWord.length > 2 && !STOP_WORDS.has(cleanWord)) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) as [string, number][];

    setStats({
      words: wordCount,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      topKeywords,
    });
  }, []);

  const clearText = () => {
    setText("");
    setStats(DEFAULT_STATS);
  };

  const pageUrl = `${SITE_URL}/tools/word-counter`;

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>
          {t("tools.wordCounter.pageTitle")} | {SITE_NAME}
        </title>
        <meta
          name="description"
          content={t("tools.wordCounter.pageDescription")}
        />
        <meta
          name="keywords"
          content="word counter, word count, count words online, free word counter, character counter, sentence counter, paragraph counter, reading time calculator, writing tools"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={pageUrl} />

        {/* Hreflang */}
        <link
          rel="alternate"
          hrefLang="en"
          href={`${SITE_URL}/tools/word-counter`}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/tools/word-counter`}
        />

        {/* Robots */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta
          property="og:title"
          content={`${t("tools.wordCounter.pageTitle")} | ${SITE_NAME}`}
        />
        <meta
          property="og:description"
          content={t("tools.wordCounter.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Word Counter - Free Online Word Count Tool"
        />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${t("tools.wordCounter.pageTitle")} | ${SITE_NAME}`}
        />
        <meta
          name="twitter:description"
          content={t("tools.wordCounter.pageDescription")}
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.wordCounter.pageTitle"),
              description: t("tools.wordCounter.pageDescription"),
              url: pageUrl,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Word count",
                "Character count",
                "Sentence count",
                "Paragraph count",
                "Reading time estimate",
                "Speaking time estimate",
                "Keyword density analysis",
              ],
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
                  item: SITE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: t("header.tools"),
                  item: `${SITE_URL}/tools`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: t("tools.wordCounter.name"),
                  item: pageUrl,
                },
              ],
            }),
          }}
        />
      </Head>

      <Header />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="w-full max-w-screen-lg mb-6">
          <ol className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("header.home")}
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("header.tools")}
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="text-zinc-900 dark:text-white font-medium">
              {t("tools.wordCounter.name")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="w-full max-w-screen-lg text-center mb-8">
          <h1
            className={`${spaceGrotesk.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4`}
          >
            {t("tools.wordCounter.title")}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("tools.wordCounter.subtitle")}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 w-full max-w-screen-lg">
          {/* Left: Textarea */}
          <div className="flex-1 flex flex-col">
            <textarea
              value={text}
              onChange={(e) => analyzeText(e.target.value)}
              className="w-full h-48 sm:h-64 lg:flex-1 lg:h-auto lg:min-h-[300px] p-4 border rounded-lg bg-white dark:bg-darkOffset border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
              placeholder={t("tools.wordCounter.placeholder")}
              aria-label={t("tools.wordCounter.placeholder")}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={clearText}
                disabled={!text}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("tools.wordCounter.clear")}
              </button>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {stats.words.toLocaleString()}{" "}
                {t("tools.wordCounter.wordsLabel")}
              </span>
            </div>
          </div>

          {/* Right: Stats Panel */}
          <StatsPanel stats={stats} />
        </div>

        {/* CTA Banner */}
        <div className="w-full max-w-screen-lg mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center border border-indigo-100 dark:border-indigo-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            {t("tools.bottomCtaTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {t("tools.bottomCtaDescription")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            {t("tools.tryGenerator")}
            <svg
              className="w-4 h-4 ml-2"
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

        {/* SEO Content Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            {t("tools.wordCounter.aboutTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {t("tools.wordCounter.aboutDescription")}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                {t("tools.wordCounter.featuresTitle")}
              </h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                <li>{t("tools.wordCounter.feature1")}</li>
                <li>{t("tools.wordCounter.feature2")}</li>
                <li>{t("tools.wordCounter.feature3")}</li>
                <li>{t("tools.wordCounter.feature4")}</li>
                <li>{t("tools.wordCounter.feature5")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                {t("tools.wordCounter.useCasesTitle")}
              </h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                <li>{t("tools.wordCounter.useCase1")}</li>
                <li>{t("tools.wordCounter.useCase2")}</li>
                <li>{t("tools.wordCounter.useCase3")}</li>
                <li>{t("tools.wordCounter.useCase4")}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
