"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { READING_TOPICS, type ReadingTopic } from "@/lib/reading/library";

// What the learner likes reading about.
//
// Optional, and it only reorders — nothing is hidden by not picking anything,
// which is why this can live quietly in Settings rather than blocking the way
// into the library.

export function InterestsPicker({ initial }: { initial: ReadingTopic[] }) {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.reading;

  const [selected, setSelected] = useState<ReadingTopic[]>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  function toggle(topic: ReadingTopic) {
    setSelected((s) => (s.includes(topic) ? s.filter((x) => x !== topic) : [...s, topic]));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/profile/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests: selected }),
    });
    setSaving(false);
    setSavedAt(Date.now());
    router.refresh();
  }

  const dirty =
    selected.length !== initial.length || selected.some((x) => !initial.includes(x));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <p className="text-xs text-slate-500">{t.interestsNote}</p>

      <div className="flex flex-wrap gap-2">
        {READING_TOPICS.map((topic) => {
          const on = selected.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => toggle(topic)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                on
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.topics[topic] ?? topic}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
        >
          {saving ? dict.level.saving : t.saveInterests}
        </button>
        {savedAt > 0 && !dirty && (
          <span className="text-xs text-emerald-700">{t.saved}</span>
        )}
      </div>
    </div>
  );
}
