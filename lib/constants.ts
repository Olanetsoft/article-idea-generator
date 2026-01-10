/**
 * Site configuration constants
 */

export const SITE_URL = "https://articleideagenerator.com";
export const SITE_NAME = "Article Idea Generator";

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
