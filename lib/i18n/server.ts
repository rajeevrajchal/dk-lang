import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, TRANSLATE_HELPER_COOKIE, isLocale } from "./config";
import { getDictionary } from "./dictionaries";
import type { Dictionary, Locale } from "@/types";

export const getLocale = async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
};

export const getServerDictionary = async (): Promise<Dictionary> => {
  return getDictionary(await getLocale());
};

// Default is "on" — the translation helper is opt-out, not opt-in.
export const getTranslateHelperDefault = async (): Promise<boolean> => {
  const value = (await cookies()).get(TRANSLATE_HELPER_COOKIE)?.value;
  return value !== "off";
};
