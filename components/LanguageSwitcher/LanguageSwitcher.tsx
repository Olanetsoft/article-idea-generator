import { useRouter } from "next/router";
import { useState, useRef, useCallback } from "react";
import { useDismiss } from "@/hooks/useDismiss";

const LANGUAGE_CONFIG: Record<string, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  pt: { name: "Português", flag: "🇧🇷" },
  zh: { name: "中文", flag: "🇨🇳" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
};

// Fallback locales in case router.locales is undefined
const SUPPORTED_LOCALES = ["en"];

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale = "en", locales, asPath } = router;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const availableLocales =
    locales && locales.length > 0 ? locales : SUPPORTED_LOCALES;

  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(dropdownRef, isOpen, close, { returnFocusRef: triggerRef });

  // Don't render if only one locale is available
  if (availableLocales.length <= 1) {
    return null;
  }

  const changeLanguage = (newLocale: string) => {
    router.push(asPath, asPath, { locale: newLocale });
    setIsOpen(false);
  };

  const currentLang = LANGUAGE_CONFIG[locale] || LANGUAGE_CONFIG.en;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-3 -my-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-base" aria-hidden="true">
          {currentLang.flag}
        </span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-1 z-50"
          aria-label="Available languages"
        >
          {availableLocales.map((loc) => {
            const lang = LANGUAGE_CONFIG[loc] || { name: loc, flag: "🌐" };
            return (
              <button
                key={loc}
                type="button"
                onClick={() => changeLanguage(loc)}
                aria-current={locale === loc ? "true" : undefined}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 ${
                  locale === loc
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="text-base" aria-hidden="true">
                  {lang.flag}
                </span>
                <span>{lang.name}</span>
                {locale === loc && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
