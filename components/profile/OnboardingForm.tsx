"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Onboarding asks for the learner's level once. Nowhere else in the app asks
// again — the only other way it changes is an official test result they record
// in Settings.

export function OnboardingForm({
  initialEducation,
  initialModule,
}: {
  initialEducation: string | null;
  initialModule: number | null;
}) {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.onboarding;

  const [education, setEducation] = useState<string | null>(initialEducation);
  const [moduleId, setModuleId] = useState<number | null>(initialModule);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function save(skip: boolean) {
    setSaving(true);
    setError(false);
    const res = skip
      ? await fetch("/api/profile/level", { method: "PATCH" })
      : await fetch("/api/profile/level", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ education, currentModule: moduleId, source: "ONBOARDING" }),
        });

    if (!res.ok) {
      setError(true);
      setSaving(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.educationQuestion}
        </h2>
        <div className="flex gap-3">
          {(["DU2", "DU3"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEducation(option)}
              className={`rounded-md border px-5 py-2.5 text-sm font-medium transition ${
                education === option
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option === "DU2" ? t.du2 : t.du3}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.moduleQuestion}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setModuleId(n)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                moduleId === n
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {n}
            </button>
          ))}
          {/* Not knowing is a real answer. Guessing would put a number in the
              official-level field that nobody actually stands behind. */}
          <button
            type="button"
            onClick={() => setModuleId(null)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
              moduleId === null
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t.dontKnow}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-900">{t.officialQuestion}</p>
        <p className="mt-1 text-xs text-slate-500">{t.officialNote}</p>
      </section>

      {error && <p className="text-sm text-red-600">{t.error}</p>}

      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          disabled={saving || !education}
          onClick={() => save(false)}
          className="rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5 disabled:opacity-40"
        >
          {saving ? t.saving : t.save}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(true)}
          className="text-sm text-slate-500 hover:underline"
        >
          {t.skip}
        </button>
      </div>
    </div>
  );
}
