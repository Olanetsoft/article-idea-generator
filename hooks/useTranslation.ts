import { useRouter } from "next/router";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";

const translations: Record<string, typeof en> = {
  en,
  es,
  fr,
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

    return value || key;
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
