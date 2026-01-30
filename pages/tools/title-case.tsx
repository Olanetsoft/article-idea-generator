import { useState, useCallback, useRef, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  convertAll,
  detectCase,
  getTextStats,
  SAMPLE_TEXTS,
  type CaseResult,
  type CaseCategory,
} from "@/lib/case-converters";
import {
  ClipboardCopyIcon,
  TrashIcon,
  CheckIcon,
  ClipboardIcon,
  LightningBoltIcon,
  SparklesIcon,
} from "@heroicons/react/outline";

// ============================================================================
// Constants
// ============================================================================

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

const CATEGORY_CONFIG: Record<
  CaseCategory,
  { title: string; icon: string; color: string }
> = {
  writing: {
    title: "Writing Styles",
    icon: "✍️",
    color: "blue",
  },
  programming: {
    title: "Programming Styles",
    icon: "💻",
    color: "emerald",
  },
  special: {
    title: "Special Styles",
    icon: "🎨",
    color: "purple",
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

interface CaseCardProps {
  caseResult: CaseResult;
  onCopy: (id: string, text: string) => void;
  isCopied: boolean;
  index: number;
}

function CaseCard({ caseResult, onCopy, isCopied, index }: CaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-dark-card/50 border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">
            {caseResult.icon}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {caseResult.label}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {caseResult.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => onCopy(caseResult.id, caseResult.result)}
          disabled={!caseResult.result}
          className={`p-2 rounded-lg transition-all flex-shrink-0 ${
            isCopied
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
          aria-label={isCopied ? "Copied!" : `Copy ${caseResult.label}`}
        >
          {isCopied ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardCopyIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Result */}
      <div
        className="p-4 font-mono text-sm text-gray-800 dark:text-gray-200 min-h-[72px] break-words cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        onClick={() =>
          caseResult.result && onCopy(caseResult.id, caseResult.result)
        }
        style={{ wordBreak: "break-word" }}
      >
        {caseResult.result || (
          <span className="text-gray-400 dark:text-gray-500 italic font-sans">
            Enter text above...
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

function StatBadge({ label, value, icon }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs">
      {icon}
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TitleCasePage(): JSX.Element {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hasTrackedUsage = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Computed values
  const results = useMemo(() => convertAll(text), [text]);
  const detectedCase = useMemo(() => detectCase(text), [text]);
  const stats = useMemo(() => getTextStats(text), [text]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<CaseCategory, CaseResult[]> = {
      writing: [],
      programming: [],
      special: [],
    };
    results.forEach((r) => groups[r.category].push(r));
    return groups;
  }, [results]);

  // Handlers
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);

      if (!hasTrackedUsage.current && newText.length > 10) {
        trackToolUsage("Title Case Converter", "convert");
        hasTrackedUsage.current = true;
      }
    },
    [],
  );

  const handleCopy = useCallback(
    (id: string, text: string) => {
      if (!text.trim()) return;

      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        toast.success(t("tools.titleCase.successCopied"));
        trackToolUsage("Title Case Converter", `copy_${id}`);
        setTimeout(() => setCopiedId(null), 2000);
      });
    },
    [t],
  );

  const handleCopyAll = useCallback(() => {
    if (!text.trim()) return;

    const allResults = results
      .map((r) => `${r.label}:\n${r.result}`)
      .join("\n\n");

    navigator.clipboard.writeText(allResults).then(() => {
      setCopiedId("all");
      toast.success(t("tools.titleCase.successAllCopied"));
      trackToolUsage("Title Case Converter", "copy_all");
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [text, results, t]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      textareaRef.current?.focus();
      if (clipboardText) {
        toast.success(t("tools.titleCase.successPasted"));
      }
      if (!hasTrackedUsage.current && clipboardText.length > 10) {
        trackToolUsage("Title Case Converter", "paste");
        hasTrackedUsage.current = true;
      }
    } catch {
      toast.error(t("tools.titleCase.errorPasteFailed"));
    }
  }, [t]);

  const handleSampleClick = useCallback((sampleText: string) => {
    setText(sampleText);
    textareaRef.current?.focus();
    if (!hasTrackedUsage.current) {
      trackToolUsage("Title Case Converter", "sample");
      hasTrackedUsage.current = true;
    }
  }, []);

  const clearText = useCallback(() => {
    setText("");
    textareaRef.current?.focus();
    hasTrackedUsage.current = false;
  }, []);

  // Router & Locale
  const router = useRouter();
  const currentLocale = router.locale || router.defaultLocale || "en";
  const locales = router.locales || ["en"];
  const defaultLocale = router.defaultLocale || "en";

  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/title-case`
      : `${SITE_URL}/${currentLocale}/tools/title-case`;

  const ogLocale = LOCALE_MAP[currentLocale] || "en_US";

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>{`${t("tools.titleCase.pageTitle")} | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content={t("tools.titleCase.pageDescription")}
        />
        <meta
          name="keywords"
          content="title case converter, text case converter, capitalize text, uppercase converter, lowercase converter, camelcase converter, snake case, kebab case, sentence case, ap style, chicago style, text transformer, case changer, pascalcase, constant case"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={pageUrl} />

        {/* Hreflang */}
        {locales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/title-case`
                : `${SITE_URL}/${locale}/tools/title-case`
            }
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/tools/title-case`}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta
          property="og:title"
          content={`${t("tools.titleCase.pageTitle")} | ${SITE_NAME}`}
        />
        <meta
          property="og:description"
          content={t("tools.titleCase.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Title Case Converter - Free Online Text Capitalization Tool"
        />
        <meta property="og:locale" content={ogLocale} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${t("tools.titleCase.pageTitle")} | ${SITE_NAME}`}
        />
        <meta
          name="twitter:description"
          content={t("tools.titleCase.pageDescription")}
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Title Case Converter",
              alternateName: [
                "Text Case Converter",
                "Case Changer",
                "Capitalize Text Tool",
              ],
              description: t("tools.titleCase.pageDescription"),
              url: pageUrl,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "16 case conversion styles",
                "AP Style title case",
                "Chicago Style title case",
                "APA Style title case",
                "camelCase for JavaScript",
                "PascalCase for classes",
                "snake_case for Python",
                "kebab-case for URLs",
                "Auto case detection",
                "One-click copy",
                "Real-time conversion",
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
                  name: "Title Case Converter",
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
                  name: "What is title case?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Title case capitalizes major words while keeping minor words (articles, conjunctions, short prepositions) lowercase. AP, Chicago, and APA styles have different rules for which words to capitalize.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the difference between camelCase and PascalCase?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "camelCase starts with a lowercase letter (myVariable), while PascalCase starts with an uppercase letter (MyClass). camelCase is used for variables/functions, PascalCase for classes/types.",
                  },
                },
                {
                  "@type": "Question",
                  name: "When should I use snake_case vs kebab-case?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "snake_case uses underscores and is common in Python, Ruby, and databases. kebab-case uses hyphens and is used for URLs, CSS classes, and file names.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is this tool free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, this title case converter is 100% free with no signup required. All conversions happen in your browser - your text never leaves your device.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the difference between AP, Chicago, and APA title case?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "AP Style capitalizes words with 4+ letters. Chicago Style capitalizes words with 5+ letters and follows more traditional rules. APA Style is similar to Chicago but has specific rules for scientific writing.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is CONSTANT_CASE used for?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "CONSTANT_CASE (all uppercase with underscores) is used for constants and environment variables in most programming languages. For example: MAX_SIZE, API_KEY, DATABASE_URL.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can this tool detect what case my text is already in?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The tool automatically detects the current case of your input text (camelCase, snake_case, Title Case, etc.) and displays it above the input field.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is sentence case vs title case?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sentence case capitalizes only the first word and proper nouns (like a normal sentence). Title case capitalizes most words except small words like 'and', 'the', 'of'.",
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
              name: "How to Convert Text Case Online",
              description:
                "Learn how to convert text between different cases like title case, camelCase, snake_case, and more.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Enter your text",
                  text: "Type or paste your text into the input field. The tool will automatically detect the current case.",
                  position: 1,
                },
                {
                  "@type": "HowToStep",
                  name: "Choose a case style",
                  text: "Click on any of the 16 case conversion buttons: Title Case, UPPERCASE, lowercase, camelCase, PascalCase, snake_case, kebab-case, and more.",
                  position: 2,
                },
                {
                  "@type": "HowToStep",
                  name: "View the result",
                  text: "The converted text appears instantly in the output area. Review the transformation to ensure it meets your needs.",
                  position: 3,
                },
                {
                  "@type": "HowToStep",
                  name: "Copy the result",
                  text: "Click the copy button to copy the converted text to your clipboard. Use it in your documents, code, or wherever needed.",
                  position: 4,
                },
              ],
            }),
          }}
        />
      </Head>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Header />

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="w-full mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {t("header.home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {t("header.tools")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              {t("tools.titleCase.name")}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-6 w-full">
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 ${spaceGrotesk.className}`}
          >
            {t("tools.titleCase.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            {t("tools.titleCase.subtitle")}
          </p>
        </section>

        {/* Input Section */}
        <section className="w-full mb-6">
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-lg overflow-hidden">
            {/* Input Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-dark-border">
              <label
                htmlFor="text-input"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <LightningBoltIcon className="w-4 h-4 text-violet-500" />
                {t("tools.titleCase.inputLabel")}
              </label>

              <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                <AnimatePresence mode="wait">
                  {detectedCase && text.trim() && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full font-medium"
                    >
                      {t("tools.titleCase.detected")}: {detectedCase}
                    </motion.span>
                  )}
                </AnimatePresence>
                <StatBadge label="Chars" value={stats.inputLength} />
                <StatBadge label="Words" value={stats.wordCount} />
              </div>
            </div>

            {/* Textarea */}
            <div className="p-4 sm:p-6">
              <textarea
                ref={textareaRef}
                id="text-input"
                value={text}
                onChange={handleTextChange}
                placeholder={t("tools.titleCase.placeholder")}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[26rem] p-4 text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all text-base"
                aria-label="Text input for case conversion"
                spellCheck={false}
              />

              {/* Quick Samples */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Try:
                </span>
                {SAMPLE_TEXTS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleClick(sample.text)}
                    className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-dark-card/50 border-t border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePaste}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  {t("tools.titleCase.paste")}
                </button>
                <button
                  onClick={clearText}
                  disabled={!text}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-4 h-4" />
                  {t("tools.titleCase.clear")}
                </button>
              </div>
              <div className="hidden sm:block flex-1" />
              <button
                onClick={handleCopyAll}
                disabled={!text.trim()}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 text-sm font-semibold rounded-lg transition-all ${
                  copiedId === "all"
                    ? "bg-green-500 text-white"
                    : "bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {copiedId === "all" ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    {t("tools.titleCase.copied")}
                  </>
                ) : (
                  <>
                    <ClipboardCopyIcon className="w-4 h-4" />
                    {t("tools.titleCase.copyAll")}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        {(["writing", "programming", "special"] as CaseCategory[]).map(
          (category) => {
            const config = CATEGORY_CONFIG[category];
            const categoryResults = groupedResults[category];

            return (
              <section key={category} className="w-full mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-xl" role="img" aria-hidden="true">
                    {config.icon}
                  </span>
                  {t(`tools.titleCase.${category}Styles`)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({categoryResults.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryResults.map((caseResult, index) => (
                    <CaseCard
                      key={caseResult.id}
                      caseResult={caseResult}
                      onCopy={handleCopy}
                      isCopied={copiedId === caseResult.id}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            );
          },
        )}

        {/* About Section */}
        <section className="w-full bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-6 sm:p-8 mb-8">
          <h2
            className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.titleCase.aboutTitle")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("tools.titleCase.aboutDescription")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Writing */}
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-lg">✍️</span>
                {t("tools.titleCase.writingStylesTitle")}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>
                  <strong>AP Style:</strong> {t("tools.titleCase.apDesc")}
                </li>
                <li>
                  <strong>Chicago:</strong> {t("tools.titleCase.chicagoDesc")}
                </li>
                <li>
                  <strong>APA:</strong> {t("tools.titleCase.apaDesc")}
                </li>
              </ul>
            </div>

            {/* Programming */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-lg">💻</span>
                {t("tools.titleCase.programmingStylesTitle")}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>
                  <strong>camelCase:</strong> {t("tools.titleCase.camelDesc")}
                </li>
                <li>
                  <strong>snake_case:</strong> {t("tools.titleCase.snakeDesc")}
                </li>
                <li>
                  <strong>kebab-case:</strong> {t("tools.titleCase.kebabDesc")}
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                Features
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>• 16 different case styles</li>
                <li>• Auto-detects input format</li>
                <li>• One-click copy any result</li>
                <li>• 100% private - runs locally</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              {
                q: "What is title case?",
                a: "Title case capitalizes major words while keeping minor words (articles, conjunctions, short prepositions) lowercase. AP, Chicago, and APA styles have different rules for which words to capitalize.",
              },
              {
                q: "What is the difference between camelCase and PascalCase?",
                a: "camelCase starts with a lowercase letter (myVariable), while PascalCase starts with an uppercase letter (MyClass). camelCase is used for variables/functions, PascalCase for classes/types.",
              },
              {
                q: "When should I use snake_case vs kebab-case?",
                a: "snake_case uses underscores and is common in Python, Ruby, and databases. kebab-case uses hyphens and is used for URLs, CSS classes, and file names.",
              },
              {
                q: "Is this tool free?",
                a: "Yes, this title case converter is 100% free with no signup required. All conversions happen in your browser - your text never leaves your device.",
              },
              {
                q: "What is the difference between AP, Chicago, and APA title case?",
                a: "AP Style capitalizes words with 4+ letters. Chicago Style capitalizes words with 5+ letters. APA Style is similar to Chicago but has specific rules for scientific writing.",
              },
              {
                q: "What is CONSTANT_CASE used for?",
                a: "CONSTANT_CASE (all uppercase with underscores) is used for constants and environment variables. For example: MAX_SIZE, API_KEY, DATABASE_URL.",
              },
              {
                q: "Can this tool detect what case my text is already in?",
                a: "Yes! The tool automatically detects the current case of your input text and displays it above the input field.",
              },
              {
                q: "What is sentence case vs title case?",
                a: "Sentence case capitalizes only the first word and proper nouns. Title case capitalizes most words except small words like 'and', 'the', 'of'.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white pr-4">
                    {faq.q}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {t("tools.bottomCtaTitle")}
          </h2>
          <p className="text-violet-100 mb-4">
            {t("tools.bottomCtaDescription")}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
          >
            {t("tools.tryGenerator")}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
