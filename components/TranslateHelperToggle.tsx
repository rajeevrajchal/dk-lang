"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

export const TranslateHelperToggle = () => {
  const { dict, translateHelperDefault, setTranslateHelperDefault } = useI18n();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-900">{dict.settings.translateHelperLabel}</p>
      <p className="mt-1 text-sm text-slate-500">{dict.settings.translateHelperDesc}</p>
      <div className="mt-3 inline-flex rounded-lg bg-slate-100 p-1 text-sm">
        {[
          { value: true, label: dict.settings.on },
          { value: false, label: dict.settings.off },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => setTranslateHelperDefault(opt.value)}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              translateHelperDefault === opt.value ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
