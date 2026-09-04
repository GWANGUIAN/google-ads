import type { Dictionary } from "./types";
import ko from "./dictionaries/ko";
import en from "./dictionaries/en";

export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

const dictionaries: Record<Locale, Dictionary> = { ko, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Builds the locale-prefixed href for a locale-neutral path (e.g. "/about"). */
export function localizePath(lang: Locale, path: string): string {
  if (lang === DEFAULT_LOCALE) return path;
  return path === "/" ? "/en/" : `/en${path}`;
}
