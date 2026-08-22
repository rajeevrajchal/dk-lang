"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const { locale, dict, setLocale } = useI18n();

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: dict.settings.english },
    { value: "da", label: dict.settings.danish },
  ];

  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={`rounded-md px-3 py-1.5 font-medium transition ${
            locale === opt.value ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
