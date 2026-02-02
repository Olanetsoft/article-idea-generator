/**
 * Site configuration constants
 */

export const SITE_URL = "https://www.articleideagenerator.com";
export const SITE_NAME = "Article Idea Generator";

/**
 * OpenGraph locale mapping for internationalization
 * Maps app locales to OpenGraph locale format
 */
export const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

/**
 * Get locale-aware path
 */
export function getLocalePath(path: string, locale: string): string {
  const localePath = locale === "en" ? "" : `/${locale}`;
  return `${localePath}${path}`;
}

/**
 * Get full URL with locale
 */
export function getFullUrl(path: string, locale: string): string {
  return `${SITE_URL}${getLocalePath(path, locale)}`;
}
