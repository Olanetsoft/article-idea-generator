import { useState, useCallback, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { Header, Footer } from "@/components";
import { StatsPanel, type TextStats } from "@/components/tools";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";

// Locale to og:locale format mapping
const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

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
  const hasTrackedUsage = useRef(false);

  const analyzeText = useCallback((inputText: string) => {
    setText(inputText);

    if (!inputText.trim()) {
      setStats(DEFAULT_STATS);
      hasTrackedUsage.current = false;
      return;
    }

    // Track tool usage once per session (when user starts typing)
    if (!hasTrackedUsage.current && inputText.length > 10) {
      trackToolUsage("Word Counter", "analyze");
      hasTrackedUsage.current = true;
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

  const router = useRouter();
  const currentLocale = router.locale || router.defaultLocale || "en";
  const locales = router.locales || ["en"];
  const defaultLocale = router.defaultLocale || "en";

  // Build locale-aware page URL
  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/word-counter`
      : `${SITE_URL}/${currentLocale}/tools/word-counter`;

  const ogLocale = LOCALE_MAP[currentLocale] || "en_US";

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>{`${t("tools.wordCounter.pageTitle")} | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content={t("tools.wordCounter.pageDescription")}
        />
        <meta
          name="keywords"
          content="word counter, word count generator, word counter generator, free word counter, article word counter, word count tool, character counter, sentence counter, paragraph counter, reading time calculator, word count machine, word counter tool online, word counter tool free, essay word counter, blog word counter"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={pageUrl} />

        {/* Hreflang - Dynamic based on available locales */}
        {locales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/word-counter`
                : `${SITE_URL}/${locale}/tools/word-counter`
            }
          />
        ))}
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
        <meta property="og:locale" content={ogLocale} />

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
                "Real-time word count",
                "Character count (with and without spaces)",
                "Sentence and paragraph count",
                "Reading time estimate (200 wpm)",
                "Speaking time estimate (150 wpm)",
                "Top keyword analysis with frequency",
                "Keyword density for SEO",
                "Works offline - no server uploads",
                "Privacy-focused (text never leaves your device)",
                "Mobile-friendly responsive design",
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

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How does the word counter work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Simply paste or type your text into the input field. The tool instantly counts words, characters, sentences, and paragraphs in real-time as you type. No submission or button click required.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is this word counter free to use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, this word counter is completely free with no limits. Count as many words as you need without signing up or paying anything. There are no premium features locked behind a paywall.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How is reading time calculated?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Reading time is calculated based on an average reading speed of 200 words per minute. Speaking time uses 150 words per minute, which is typical for presentations and speeches.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are top keywords?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Top keywords shows the most frequently used words in your text, excluding common words like 'the', 'and', 'is'. This helps identify keyword density for SEO optimization and content analysis.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does this count characters with or without spaces?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Both! The tool displays both character counts: total characters including spaces, and characters excluding spaces. This is useful for platforms with different character limits.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my text private?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. All text processing happens directly in your browser. Your text is never sent to any server, making it safe for sensitive documents, manuscripts, and confidential content.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is a good word count for blog posts?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "For SEO, long-form content (1,500-2,500+ words) often performs better in search rankings. However, the ideal length depends on your topic and audience. Our reading time estimate helps gauge article length.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I use this for academic papers?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Students and academics use our tool to check word counts for essays, dissertations, and assignments. The paragraph count is especially useful for structured writing requirements.",
                  },
                },
              ],
            }),
          }}
        />

        {/* HowTo Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to Count Words Online",
              description:
                "Learn how to count words, characters, and analyze your text using our free word counter tool.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Enter your text",
                  text: "Type directly into the text area or paste content from any source. The tool processes text instantly as you type.",
                  position: 1,
                },
                {
                  "@type": "HowToStep",
                  name: "View statistics",
                  text: "See real-time counts for words, characters (with/without spaces), sentences, and paragraphs in the stats panel.",
                  position: 2,
                },
                {
                  "@type": "HowToStep",
                  name: "Check reading time",
                  text: "Review the estimated reading time (at 200 wpm) and speaking time (at 150 wpm) to gauge content length.",
                  position: 3,
                },
                {
                  "@type": "HowToStep",
                  name: "Analyze keywords",
                  text: "Scroll down to see your top keywords and their frequency, helping optimize content for SEO.",
                  position: 4,
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
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {t("header.home")}
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
              className="w-full h-48 sm:h-64 lg:flex-1 lg:h-auto lg:min-h-[300px] p-4 border rounded-lg bg-white dark:bg-darkOffset border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
              placeholder={t("tools.wordCounter.placeholder")}
              aria-label={t("tools.wordCounter.placeholder")}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={clearText}
                disabled={!text}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-dark-card hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="w-full max-w-screen-lg mt-12 p-6 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-center border border-violet-100 dark:border-violet-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            {t("tools.bottomCtaTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {t("tools.bottomCtaDescription")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
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

        {/* About Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <h2
            className={`text-2xl font-bold text-zinc-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.wordCounter.aboutTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t("tools.wordCounter.aboutDescription")}
          </p>
        </section>

        {/* Features & Use Cases Grid */}
        <section className="w-full max-w-screen-lg mt-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-50 dark:bg-darkOffset p-6 rounded-xl border border-zinc-200 dark:border-dark-border">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-violet-600"
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
                {t("tools.wordCounter.featuresTitle")}
              </h3>
              <ul className="text-zinc-600 dark:text-zinc-400 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.feature1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.feature2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.feature3")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.feature4")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.feature5")}
                </li>
              </ul>
            </div>

            <div className="bg-zinc-50 dark:bg-darkOffset p-6 rounded-xl border border-zinc-200 dark:border-dark-border">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t("tools.wordCounter.useCasesTitle")}
              </h3>
              <ul className="text-zinc-600 dark:text-zinc-400 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.useCase1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.useCase2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.useCase3")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 mt-1">•</span>
                  {t("tools.wordCounter.useCase4")}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <h2
            className={`text-2xl font-bold text-zinc-900 dark:text-white mb-6 ${spaceGrotesk.className}`}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-3xl">
            {[
              {
                q: "How does the word counter work?",
                a: "Simply paste or type your text into the input field. The tool instantly counts words, characters, sentences, and paragraphs in real-time as you type. No submission required.",
              },
              {
                q: "Is this word counter free to use?",
                a: "Yes, this word counter is completely free with no limits. Count as many words as you need without signing up or paying anything.",
              },
              {
                q: "How is reading time calculated?",
                a: "Reading time is calculated based on an average reading speed of 200 words per minute. Speaking time uses 150 words per minute, which is typical for presentations.",
              },
              {
                q: "What are top keywords?",
                a: 'Top keywords shows the most frequently used words in your text, excluding common words like "the", "and", "is". This helps identify keyword density for SEO optimization.',
              },
              {
                q: "Does this count characters with or without spaces?",
                a: "Both! The tool displays both character counts: total characters including spaces, and characters excluding spaces. This is useful for platforms with different character limits.",
              },
              {
                q: "Is my text private?",
                a: "Absolutely. All text processing happens directly in your browser. Your text is never sent to any server, making it safe for sensitive documents and confidential content.",
              },
              {
                q: "What is a good word count for blog posts?",
                a: "For SEO, long-form content (1,500-2,500+ words) often performs better in search rankings. However, the ideal length depends on your topic and audience.",
              },
              {
                q: "Can I use this for academic papers?",
                a: "Yes! Students and academics use our tool to check word counts for essays, dissertations, and assignments. The paragraph count is especially useful for structured writing requirements.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-zinc-100 dark:bg-darkOffset rounded-lg border border-zinc-200 dark:border-dark-border"
              >
                <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-zinc-900 dark:text-white">
                  {faq.q}
                  <svg
                    className="w-5 h-5 transition-transform group-open:rotate-180 flex-shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-zinc-600 dark:text-zinc-400">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Tools Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <h2
            className={`text-2xl font-bold text-zinc-900 dark:text-white mb-6 ${spaceGrotesk.className}`}
          >
            Related Writing Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/tools"
              className="p-4 bg-zinc-100 dark:bg-darkOffset rounded-lg border border-zinc-200 dark:border-dark-border hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                Character Counter
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Track character limits for Twitter, LinkedIn, and meta
                descriptions.
              </p>
              <span className="text-xs text-violet-600 dark:text-violet-400 mt-2 inline-block">
                Coming Soon
              </span>
            </Link>

            <Link
              href="/tools"
              className="p-4 bg-zinc-100 dark:bg-darkOffset rounded-lg border border-zinc-200 dark:border-dark-border hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                Reading Time Calculator
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get &quot;X min read&quot; badges for your blog posts and
                articles.
              </p>
              <span className="text-xs text-violet-600 dark:text-violet-400 mt-2 inline-block">
                Coming Soon
              </span>
            </Link>

            <Link
              href="/tools"
              className="p-4 bg-zinc-100 dark:bg-darkOffset rounded-lg border border-zinc-200 dark:border-dark-border hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                Headline Analyzer
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Analyze headlines for SEO and emotional impact.
              </p>
              <span className="text-xs text-violet-600 dark:text-violet-400 mt-2 inline-block">
                Coming Soon
              </span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
