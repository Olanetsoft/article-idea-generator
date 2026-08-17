import { useRouter } from "next/router";
import en from "../locales/en.json";

const translations: Record<string, typeof en> = {
  en,
};

type TranslationKey = string;

export function useTranslation() {
  const router = useRouter();
  const { locale = "en" } = router;

  const t = (key: TranslationKey): string => {
    const keys = key.split(".");
    let value: any = translations[locale] || translations.en;

    for (const k of keys) {
      value = value?.[k];
    }

    // Fallback to English if translation not found
    if (value === undefined) {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }

    if (typeof value === "string" && value) {
      return value;
    }

    // Missing key: humanize the last segment (e.g. "frameTextLabel" ->
    // "Frame Text Label") instead of exposing the raw dotted path
    const lastSegment = keys[keys.length - 1] || key;
    return lastSegment
      .replace(/[_-]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const changeLocale = (newLocale: string) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  return {
    t,
    locale,
    changeLocale,
    locales: router.locales || ["en"],
  };
}

export default useTranslation;
