"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { LessonExercise } from "@/lib/curriculum/course-types";
import type { ExerciseCheck } from "@/lib/curriculum/progress";

// The practice half of a lesson.
//
// One component renders all seven rungs of the ladder, because they are the
// same shape of interaction at different levels of support — and because a
// learner should not have to relearn the interface every chapter.
//
// Grading happens server-side (POST /api/course/progress); this only collects
// answers and renders the verdict that comes back.

const card = "rounded-lg border border-slate-200 bg-white p-4";

export function LessonExercises({
  lessonSlug,
  exercises,
}: {
  lessonSlug: string;
  exercises: LessonExercise[];
}) {
  const { dict } = useI18n();
  const t = dict.course;

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, ExerciseCheck> | null>(null);
  const [score, setScore] = useState<{ score: number | null; total: number | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (id: string, value: string) => setResponses((r) => ({ ...r, [id]: value }));

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/course/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug, responses }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const byId: Record<string, ExerciseCheck> = {};
      for (const c of data.checks as ExerciseCheck[]) byId[c.id] = c;
      setChecks(byId);
      setScore({ score: data.score, total: data.total });
    } finally {
      setBusy(false);
    }
  }

  const passed =
    score?.total == null || score.total === 0
      ? true
      : (score.score ?? 0) / score.total >= 0.6;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t.practice}</h2>

      {exercises.map((ex, i) => {
        const check = checks?.[ex.id];
        const verdictClass =
          check?.correct === true
            ? "border-emerald-300 bg-emerald-50"
            : check?.correct === false
              ? "border-red-300 bg-red-50"
              : check
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-white";

        return (
          <div key={ex.id} className={`rounded-lg border p-4 ${verdictClass}`}>
            <p className="text-sm font-medium text-slate-900">
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {ex.instruction}
            </p>

            <div className="mt-3">
              {/* Recognition — pick one word out of a sentence. */}
              {ex.kind === "recognition" && (
                <div className="flex flex-wrap gap-1.5">
                  {ex.sentence.split(/\s+/).map((word, wi) => (
                    <button
                      key={wi}
                      type="button"
                      disabled={!!checks}
                      onClick={() => set(ex.id, String(wi))}
                      className={`rounded px-2 py-1 text-sm transition ${
                        responses[ex.id] === String(wi)
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      } disabled:opacity-70`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}

              {ex.kind === "selection" && (
                <div>
                  <p className="text-sm text-slate-700 mb-2">{ex.sentence}</p>
                  <div className="flex flex-wrap gap-2">
                    {ex.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={!!checks}
                        onClick={() => set(ex.id, opt)}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${
                          responses[ex.id] === opt
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 hover:border-slate-400"
                        } disabled:opacity-70`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ex.kind === "matching" && (
                <MatchingInput
                  pairs={ex.pairs}
                  disabled={!!checks}
                  onChange={(v) => set(ex.id, v)}
                />
              )}

              {ex.kind === "ordering" && (
                <OrderingInput
                  scrambled={ex.scrambled}
                  disabled={!!checks}
                  resetLabel={t.reset}
                  hint={t.buildSentence}
                  onChange={(v) => set(ex.id, v)}
                />
              )}

              {ex.kind === "controlled_production" && (
                <div>
                  <p className="text-sm text-slate-700 mb-2">{ex.prompt}</p>
                  <input
                    disabled={!!checks}
                    value={responses[ex.id] ?? ""}
                    onChange={(e) => set(ex.id, e.target.value)}
                    placeholder={t.yourAnswerHere}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-70"
                  />
                  {ex.hint && <p className="mt-1 text-xs text-slate-400">{ex.hint}</p>}
                </div>
              )}

              {ex.kind === "free_production" && (
                <div>
                  <p className="text-sm text-slate-700 mb-2">{ex.prompt}</p>
                  <textarea
                    disabled={!!checks}
                    value={responses[ex.id] ?? ""}
                    onChange={(e) => set(ex.id, e.target.value)}
                    rows={3}
                    placeholder={t.yourAnswerHere}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-70"
                  />
                  <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {t.checklistLabel}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {ex.checklist.map((c) => (
                      <li key={c} className="text-xs text-slate-600">
                        · {c}
                      </li>
                    ))}
                  </ul>
                  {checks && ex.modelAnswer && (
                    <p className="mt-2 text-xs text-blue-800">
                      <span className="font-semibold">{t.modelAnswer}: </span>
                      {ex.modelAnswer}
                    </p>
                  )}
                </div>
              )}

              {ex.kind === "communication" && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {t.sayItAloud}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{ex.prompt}</p>
                  {ex.usefulPhrases && (
                    <ul className="mt-2 space-y-0.5">
                      {ex.usefulPhrases.map((p) => (
                        <li key={p} className="text-xs text-slate-600">
                          · {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {check && (
              <div className="mt-3 text-xs">
                <p
                  className={
                    check.correct === true
                      ? "font-medium text-emerald-800"
                      : check.correct === false
                        ? "font-medium text-red-800"
                        : "font-medium text-blue-800"
                  }
                >
                  {check.correct === true
                    ? `✓ ${t.correctMark}`
                    : check.correct === false
                      ? `✗ ${t.wrongMark}`
                      : t.selfCheckMark}
                </p>
                {check.correct === false && check.expected && (
                  <p className="mt-0.5 text-slate-600">
                    {t.expectedWas}: <span className="font-medium">{check.expected}</span>
                  </p>
                )}
                {check.explanation && <p className="mt-0.5 text-slate-600">{check.explanation}</p>}
              </div>
            )}
          </div>
        );
      })}

      {!checks ? (
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5 disabled:opacity-50"
        >
          {t.checkAnswers}
        </button>
      ) : (
        <div className={`${card} ${passed ? "border-emerald-300" : "border-amber-300"}`}>
          {score?.total != null && score.total > 0 && (
            <p className="text-sm font-medium">{t.lessonScore(score.score ?? 0, score.total)}</p>
          )}
          <p className={`mt-1 text-sm ${passed ? "text-emerald-800" : "text-amber-800"}`}>
            {passed ? t.lessonPassed : t.lessonRetry}
          </p>
          {!passed && (
            <button
              onClick={() => {
                setChecks(null);
                setScore(null);
                setResponses({});
              }}
              className="mt-3 rounded-md border border-slate-300 text-sm font-medium px-4 py-2"
            >
              {t.tryAgain}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function MatchingInput({
  pairs,
  disabled,
  onChange,
}: {
  pairs: { left: string; right: string }[];
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  // Right-hand options are shuffled once, deterministically by content, so the
  // answer isn't simply "match them in order".
  const rights = [...pairs.map((p) => p.right)].sort((a, b) => a.localeCompare(b));

  function choose(left: string, right: string) {
    const next = { ...picked, [left]: right };
    setPicked(next);
    onChange(
      Object.entries(next)
        .map(([l, r]) => `${l}→${r}`)
        .join("|")
    );
  }

  return (
    <div className="space-y-2">
      {pairs.map((p) => (
        <div key={p.left} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm font-medium">{p.left}</span>
          <select
            disabled={disabled}
            value={picked[p.left] ?? ""}
            onChange={(e) => choose(p.left, e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:opacity-70"
          >
            <option value="">–</option>
            {rights.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function OrderingInput({
  scrambled,
  disabled,
  hint,
  resetLabel,
  onChange,
}: {
  scrambled: string[];
  disabled: boolean;
  hint: string;
  resetLabel: string;
  onChange: (v: string) => void;
}) {
  const [built, setBuilt] = useState<string[]>([]);
  const remaining = scrambled.filter(
    (w, i) => !built.some((b, bi) => b === w && bi === built.indexOf(w) && scrambled.indexOf(w) === i)
  );
  // Simple multiset removal: count how many of each word are already used.
  const used: Record<string, number> = {};
  for (const b of built) used[b] = (used[b] ?? 0) + 1;
  const pool = scrambled.filter((w) => {
    if ((used[w] ?? 0) > 0) {
      used[w] -= 1;
      return false;
    }
    return true;
  });
  void remaining;

  function add(word: string) {
    const next = [...built, word];
    setBuilt(next);
    onChange(next.join(" "));
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2">{hint}</p>
      <div className="min-h-[2.5rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
        {built.length === 0 ? <span className="text-slate-300">…</span> : built.join(" ")}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pool.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            disabled={disabled}
            onClick={() => add(word)}
            className="rounded bg-slate-100 px-2 py-1 text-sm hover:bg-slate-200 disabled:opacity-70"
          >
            {word}
          </button>
        ))}
        {built.length > 0 && !disabled && (
          <button
            type="button"
            onClick={() => {
              setBuilt([]);
              onChange("");
            }}
            className="rounded px-2 py-1 text-xs text-slate-500 hover:underline"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}
