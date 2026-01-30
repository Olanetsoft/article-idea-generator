import { useState, useCallback, useRef, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  ClipboardCopyIcon,
  TrashIcon,
  CheckIcon,
  ClipboardIcon,
  DownloadIcon,
  UploadIcon,
  CodeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
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

const SAMPLE_JSON = {
  simple: '{"name":"John","age":30,"city":"New York"}',
  nested:
    '{"user":{"id":1,"name":"Alice","email":"alice@example.com"},"posts":[{"id":1,"title":"Hello World"},{"id":2,"title":"JSON is great"}]}',
  array: '[1,2,3,{"key":"value"},["nested","array"]]',
};

const INDENT_OPTIONS = [
  { value: 2, label: "2 spaces" },
  { value: 4, label: "4 spaces" },
  { value: 8, label: "8 spaces" },
  { value: "tab", label: "Tab" },
];

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorPosition?: { line: number; column: number };
}

interface JsonStats {
  keys: number;
  values: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

function validateJson(input: string): ValidationResult {
  if (!input.trim()) {
    return { isValid: true };
  }

  try {
    JSON.parse(input);
    return { isValid: true };
  } catch (e) {
    const error = e as SyntaxError;
    const message = error.message;

    // Try to extract position from error message
    const posMatch = message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = input.substring(0, pos).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      return {
        isValid: false,
        error: message,
        errorPosition: { line, column },
      };
    }

    return { isValid: false, error: message };
  }
}

function formatJson(input: string, indent: number | "tab"): string {
  try {
    const parsed = JSON.parse(input);
    const indentStr = indent === "tab" ? "\t" : indent;
    return JSON.stringify(parsed, null, indentStr);
  } catch {
    return input;
  }
}

function minifyJson(input: string): string {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return input;
  }
}

function traverseJson(obj: unknown, depth: number, stats: JsonStats): void {
  if (depth > stats.depth) stats.depth = depth;

  if (obj === null) {
    stats.nulls++;
    stats.values++;
  } else if (Array.isArray(obj)) {
    stats.arrays++;
    obj.forEach((item) => traverseJson(item, depth + 1, stats));
  } else if (typeof obj === "object") {
    stats.objects++;
    const entries = Object.entries(obj as Record<string, unknown>);
    stats.keys += entries.length;
    entries.forEach(([, value]) => traverseJson(value, depth + 1, stats));
  } else if (typeof obj === "string") {
    stats.strings++;
    stats.values++;
  } else if (typeof obj === "number") {
    stats.numbers++;
    stats.values++;
  } else if (typeof obj === "boolean") {
    stats.booleans++;
    stats.values++;
  }
}

function analyzeJson(input: string): JsonStats | null {
  try {
    const parsed = JSON.parse(input);

    const stats: JsonStats = {
      keys: 0,
      values: 0,
      depth: 0,
      arrays: 0,
      objects: 0,
      strings: 0,
      numbers: 0,
      booleans: 0,
      nulls: 0,
    };

    traverseJson(parsed, 0, stats);
    return stats;
  } catch {
    return null;
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

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
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function JsonFormatterPage(): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<number | "tab">(2);
  const [copied, setCopied] = useState(false);
  const hasTrackedUsage = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed values
  const validation = useMemo(() => validateJson(input), [input]);
  const stats = useMemo(
    () => (validation.isValid ? analyzeJson(input) : null),
    [input, validation.isValid],
  );

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newInput = e.target.value;
      setInput(newInput);
      setOutput("");

      if (!hasTrackedUsage.current && newInput.length > 10) {
        trackToolUsage("JSON Formatter", "input_started");
        hasTrackedUsage.current = true;
      }
    },
    [],
  );

  const handleFormat = useCallback(() => {
    if (!input.trim() || !validation.isValid) return;

    const formatted = formatJson(input, indent);
    setOutput(formatted);
    trackToolUsage("JSON Formatter", "format");
    toast.success(t("tools.jsonFormatter.successFormatted"));
  }, [input, indent, validation.isValid, t]);

  const handleMinify = useCallback(() => {
    if (!input.trim() || !validation.isValid) return;

    const minified = minifyJson(input);
    setOutput(minified);
    trackToolUsage("JSON Formatter", "minify");
    toast.success(t("tools.jsonFormatter.successMinified"));
  }, [input, validation.isValid, t]);

  const handleCopy = useCallback(() => {
    const textToCopy = output || input;
    if (!textToCopy.trim()) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success(t("tools.jsonFormatter.successCopied"));
      trackToolUsage("JSON Formatter", "copy");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [input, output, t]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInput(clipboardText);
      setOutput("");
      textareaRef.current?.focus();
      if (clipboardText) {
        toast.success(t("tools.jsonFormatter.successPasted"));
      }
      if (!hasTrackedUsage.current && clipboardText.length > 10) {
        trackToolUsage("JSON Formatter", "paste");
        hasTrackedUsage.current = true;
      }
    } catch {
      toast.error(t("tools.jsonFormatter.errorPasteFailed"));
    }
  }, [t]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    textareaRef.current?.focus();
  }, []);

  const handleSampleClick = useCallback(
    (sampleKey: keyof typeof SAMPLE_JSON) => {
      setInput(SAMPLE_JSON[sampleKey]);
      setOutput("");
    },
    [],
  );

  const handleDownload = useCallback(() => {
    const textToDownload = output || input;
    if (!textToDownload.trim()) return;

    const blob = new Blob([textToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("tools.jsonFormatter.successDownloaded"));
    trackToolUsage("JSON Formatter", "download");
  }, [input, output, t]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        toast.error(t("tools.jsonFormatter.errorInvalidFile"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInput(content);
        setOutput("");
        toast.success(t("tools.jsonFormatter.successFileLoaded"));
        trackToolUsage("JSON Formatter", "file_upload");
      };
      reader.readAsText(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [t],
  );

  // Router & Locale
  const currentLocale = router.locale || router.defaultLocale || "en";
  const locales = router.locales || ["en"];
  const defaultLocale = router.defaultLocale || "en";

  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/json-formatter`
      : `${SITE_URL}/${currentLocale}/tools/json-formatter`;

  const ogLocale = LOCALE_MAP[currentLocale] || "en_US";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-dark-bg dark:to-darkOffset">
      <Head>
        <title>{t("tools.jsonFormatter.pageTitle")}</title>
        <meta
          name="description"
          content={t("tools.jsonFormatter.pageDescription")}
        />
        <meta
          name="keywords"
          content="json formatter, json beautifier, json validator, json minifier, json parser, format json online, prettify json, json viewer"
        />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={t("tools.jsonFormatter.pageTitle")}
        />
        <meta
          property="og:description"
          content={t("tools.jsonFormatter.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={ogLocale} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={t("tools.jsonFormatter.pageTitle")}
        />
        <meta
          name="twitter:description"
          content={t("tools.jsonFormatter.pageDescription")}
        />

        {/* Alternate languages */}
        {locales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/json-formatter`
                : `${SITE_URL}/${locale}/tools/json-formatter`
            }
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        {/* Schema.org WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.jsonFormatter.name"),
              description: t("tools.jsonFormatter.pageDescription"),
              url: pageUrl,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "JSON formatting and beautification with syntax highlighting",
                "JSON minification for smaller file sizes",
                "Real-time JSON validation with error highlighting",
                "Multiple indentation options (2, 4, 8 spaces, tabs)",
                "One-click copy to clipboard",
                "Download formatted or minified JSON files",
                "Drag-and-drop file upload support",
                "Sample JSON templates for testing",
                "JSON statistics (keys, values, depth, size)",
                "Works offline - no server uploads",
                "Dark mode support",
                "Mobile-friendly responsive design",
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
                  name: "What is JSON and why do I need to format it?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "JSON (JavaScript Object Notation) is a lightweight data format used for storing and exchanging data between servers and web applications. Formatting JSON makes it human-readable by adding proper indentation and line breaks, which is essential for debugging, reviewing API responses, and understanding data structures.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is this JSON formatter free to use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, this JSON formatter is completely free with no limits. Format, validate, and minify as much JSON as you need without signing up or paying anything. There are no premium features locked behind a paywall.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my JSON data secure?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. All JSON processing happens directly in your browser - your data never leaves your device or gets uploaded to any server. This makes it safe for formatting sensitive configuration files, API keys, or private data.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the difference between formatting and minifying JSON?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Formatting (beautifying) JSON adds indentation and line breaks to make it readable. Minifying removes all unnecessary whitespace to reduce file size, which is useful for production environments where smaller payloads improve performance.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does JSON validation work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The validator checks your JSON against the official JSON specification. It detects syntax errors like missing commas, unquoted keys, trailing commas, mismatched brackets, and invalid values. Error messages show the exact line and position of problems.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I upload JSON files directly?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, you can drag and drop JSON files or click to browse and upload. The tool accepts .json files and will automatically process them for formatting, validation, or minification.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What indentation options are available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can choose from 2 spaces, 4 spaces, 8 spaces, or tabs for indentation. 2-space indentation is common for web development, while 4 spaces is the default for many languages and editors.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does this work offline?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, once the page loads, you can format JSON without an internet connection. All processing is done client-side in your browser using JavaScript.",
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
              name: "How to Format JSON Online",
              description:
                "Learn how to format, validate, and beautify JSON data using our free online tool.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Enter or upload JSON",
                  text: "Paste your JSON data into the input field, or drag and drop a .json file. You can also try our sample JSON templates.",
                  position: 1,
                },
                {
                  "@type": "HowToStep",
                  name: "Choose formatting options",
                  text: "Select your preferred indentation (2, 4, or 8 spaces, or tabs). The tool will automatically validate your JSON as you type.",
                  position: 2,
                },
                {
                  "@type": "HowToStep",
                  name: "Format or minify",
                  text: "Click 'Format' to beautify your JSON with proper indentation, or 'Minify' to compress it by removing all whitespace.",
                  position: 3,
                },
                {
                  "@type": "HowToStep",
                  name: "Copy or download",
                  text: "Copy the formatted JSON to your clipboard with one click, or download it as a .json file for use in your projects.",
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
        <nav className="w-full max-w-5xl mb-4">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Tools
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              JSON Formatter
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 w-full max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium mb-4">
            <CodeIcon className="w-3.5 h-3.5" />
            {t("tools.jsonFormatter.badge")}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.jsonFormatter.title")}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.jsonFormatter.subtitle")}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card/50">
              <div className="flex flex-wrap items-center gap-2">
                {/* Indent selector */}
                <select
                  value={indent.toString()}
                  onChange={(e) =>
                    setIndent(
                      e.target.value === "tab"
                        ? "tab"
                        : parseInt(e.target.value),
                    )
                  }
                  className="px-3 py-1.5 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {INDENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Format button */}
                <button
                  onClick={handleFormat}
                  disabled={!input.trim() || !validation.isValid}
                  className="px-4 py-1.5 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("tools.jsonFormatter.format")}
                </button>

                {/* Minify button */}
                <button
                  onClick={handleMinify}
                  disabled={!input.trim() || !validation.isValid}
                  className="px-4 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("tools.jsonFormatter.minify")}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* File upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-file-upload"
                />
                <label
                  htmlFor="json-file-upload"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
                >
                  <UploadIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("tools.jsonFormatter.upload")}
                  </span>
                </label>

                {/* Paste */}
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("tools.jsonFormatter.paste")}
                  </span>
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  disabled={!input.trim() && !output.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ClipboardCopyIcon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {copied
                      ? t("tools.jsonFormatter.copied")
                      : t("tools.jsonFormatter.copy")}
                  </span>
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={!input.trim() && !output.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("tools.jsonFormatter.download")}
                  </span>
                </button>

                {/* Clear */}
                <button
                  onClick={handleClear}
                  disabled={!input.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-dark-border">
              {/* Input */}
              <div className="relative">
                <div className="absolute top-3 left-4 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {t("tools.jsonFormatter.input")}
                </div>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={t("tools.jsonFormatter.placeholder")}
                  spellCheck={false}
                  className="w-full h-64 sm:h-80 lg:h-[500px] pt-10 px-4 pb-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-mono text-sm"
                />

                {/* Validation indicator */}
                {input.trim() && (
                  <div
                    className={`absolute bottom-4 left-4 flex items-center gap-1.5 text-xs ${
                      validation.isValid
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {validation.isValid ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        {t("tools.jsonFormatter.valid")}
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="w-4 h-4" />
                        {validation.errorPosition
                          ? `Line ${validation.errorPosition.line}, Col ${validation.errorPosition.column}`
                          : t("tools.jsonFormatter.invalid")}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="relative bg-gray-50 dark:bg-dark-card/30">
                <div className="absolute top-3 left-4 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {t("tools.jsonFormatter.output")}
                </div>
                <textarea
                  value={output}
                  readOnly
                  placeholder={t("tools.jsonFormatter.outputPlaceholder")}
                  spellCheck={false}
                  className="w-full h-64 sm:h-80 lg:h-[500px] pt-10 px-4 pb-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-mono text-sm"
                />
              </div>
            </div>

            {/* Stats bar */}
            {stats && input.trim() && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-3 sm:p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card/50">
                <StatBadge
                  label={t("tools.jsonFormatter.statKeys")}
                  value={stats.keys}
                />
                <StatBadge
                  label={t("tools.jsonFormatter.statObjects")}
                  value={stats.objects}
                />
                <StatBadge
                  label={t("tools.jsonFormatter.statArrays")}
                  value={stats.arrays}
                />
                <StatBadge
                  label={t("tools.jsonFormatter.statDepth")}
                  value={stats.depth}
                />
                <StatBadge
                  label={t("tools.jsonFormatter.statStrings")}
                  value={stats.strings}
                />
                <StatBadge
                  label={t("tools.jsonFormatter.statNumbers")}
                  value={stats.numbers}
                />
              </div>
            )}
          </motion.div>

          {/* Sample JSON buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("tools.jsonFormatter.trySample")}:
            </span>
            {Object.keys(SAMPLE_JSON).map((key) => (
              <button
                key={key}
                onClick={() =>
                  handleSampleClick(key as keyof typeof SAMPLE_JSON)
                }
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors capitalize"
              >
                {key}
              </button>
            ))}
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 sm:mt-12"
          >
            <h2
              className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 ${spaceGrotesk.className}`}
            >
              {t("tools.jsonFormatter.aboutTitle")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("tools.jsonFormatter.aboutDescription")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Feature cards */}
              {[
                {
                  icon: "✨",
                  titleKey: "tools.jsonFormatter.featureFormatTitle",
                  descKey: "tools.jsonFormatter.featureFormatDesc",
                },
                {
                  icon: "📦",
                  titleKey: "tools.jsonFormatter.featureMinifyTitle",
                  descKey: "tools.jsonFormatter.featureMinifyDesc",
                },
                {
                  icon: "✅",
                  titleKey: "tools.jsonFormatter.featureValidateTitle",
                  descKey: "tools.jsonFormatter.featureValidateDesc",
                },
                {
                  icon: "🔒",
                  titleKey: "tools.jsonFormatter.featurePrivacyTitle",
                  descKey: "tools.jsonFormatter.featurePrivacyDesc",
                },
                {
                  icon: "📁",
                  titleKey: "tools.jsonFormatter.featureFileTitle",
                  descKey: "tools.jsonFormatter.featureFileDesc",
                },
                {
                  icon: "📊",
                  titleKey: "tools.jsonFormatter.featureStatsTitle",
                  descKey: "tools.jsonFormatter.featureStatsDesc",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border"
                >
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(feature.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 sm:mt-16"
          >
            <h2
              className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center ${spaceGrotesk.className}`}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {[
                {
                  q: "What is JSON and why do I need to format it?",
                  a: "JSON (JavaScript Object Notation) is a lightweight data format used for storing and exchanging data between servers and web applications. Formatting JSON makes it human-readable by adding proper indentation and line breaks, which is essential for debugging, reviewing API responses, and understanding data structures.",
                },
                {
                  q: "Is this JSON formatter free to use?",
                  a: "Yes, this JSON formatter is completely free with no limits. Format, validate, and minify as much JSON as you need without signing up or paying anything.",
                },
                {
                  q: "Is my JSON data secure?",
                  a: "Absolutely. All JSON processing happens directly in your browser - your data never leaves your device or gets uploaded to any server. This makes it safe for formatting sensitive configuration files, API keys, or private data.",
                },
                {
                  q: "What is the difference between formatting and minifying JSON?",
                  a: "Formatting (beautifying) JSON adds indentation and line breaks to make it readable. Minifying removes all unnecessary whitespace to reduce file size, which is useful for production environments where smaller payloads improve performance.",
                },
                {
                  q: "How does JSON validation work?",
                  a: "The validator checks your JSON against the official JSON specification. It detects syntax errors like missing commas, unquoted keys, trailing commas, mismatched brackets, and invalid values.",
                },
                {
                  q: "Can I upload JSON files directly?",
                  a: "Yes, you can drag and drop JSON files or click to browse and upload. The tool accepts .json files and will automatically process them.",
                },
                {
                  q: "What indentation options are available?",
                  a: "You can choose from 2 spaces, 4 spaces, 8 spaces, or tabs for indentation. 2-space indentation is common for web development, while 4 spaces is the default for many languages.",
                },
                {
                  q: "Does this work offline?",
                  a: "Yes, once the page loads, you can format JSON without an internet connection. All processing is done client-side in your browser.",
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
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
