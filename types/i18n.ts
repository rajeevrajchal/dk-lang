import type { LOCALES } from "@/lib/i18n/config";
import type { en } from "@/lib/i18n/dictionaries/en";

export type Locale = (typeof LOCALES)[number];

/** The English dictionary is the shape every other locale must satisfy. */
export type Dictionary = typeof en;

export interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  translateHelperDefault: boolean;
  setTranslateHelperDefault: (on: boolean) => void;
}
