"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, TRANSLATE_HELPER_COOKIE } from "./config";
import { getDictionary } from "./dictionaries";
import type { I18nContextValue, Locale } from "@/types";

const I18nContext = createContext<I18nContextValue | null>(null);

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
};

export const LocaleProvider = ({
  initialLocale,
  initialTranslateHelperDefault,
  children,
}: {
  initialLocale: Locale;
  initialTranslateHelperDefault: boolean;
  children: React.ReactNode;
}) => {
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
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
};
