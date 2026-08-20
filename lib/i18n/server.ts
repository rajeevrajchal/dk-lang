import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, TRANSLATE_HELPER_COOKIE, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import type { Dictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerDictionary(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

// Default is "on" — the translation helper is opt-out, not opt-in.
export async function getTranslateHelperDefault(): Promise<boolean> {
  const value = (await cookies()).get(TRANSLATE_HELPER_COOKIE)?.value;
  return value !== "off";
}
