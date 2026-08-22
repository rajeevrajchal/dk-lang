"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, TRANSLATE_HELPER_COOKIE, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  translateHelperDefault: boolean;
  setTranslateHelperDefault: (on: boolean) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
}

export function LocaleProvider({
  initialLocale,
  initialTranslateHelperDefault,
  children,
}: {
  initialLocale: Locale;
  initialTranslateHelperDefault: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);
  const [translateHelperDefault, setTranslateHelperDefaultState] = useState(
    initialTranslateHelperDefault
  );

  const setLocale = useCallback(
    (next: Locale) => {
      setCookie(LOCALE_COOKIE, next);
      setLocaleState(next);
      router.refresh();
    },
    [router]
  );

  const setTranslateHelperDefault = useCallback(
    (on: boolean) => {
      setCookie(TRANSLATE_HELPER_COOKIE, on ? "on" : "off");
      setTranslateHelperDefaultState(on);
      router.refresh();
    },
    [router]
  );

  const dict = getDictionary(locale);

  return (
    <I18nContext.Provider
      value={{ locale, dict, setLocale, translateHelperDefault, setTranslateHelperDefault }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
