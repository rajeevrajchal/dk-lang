import type { Locale } from "@/types";

export const LOCALES = ["en", "da"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "dk-locale";
export const TRANSLATE_HELPER_COOKIE = "dk-translate-default";

export const isLocale = (value: string | undefined | null): value is Locale => {
  return !!value && (LOCALES as readonly string[]).includes(value);
};
