"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ExerciseBody, expectedAnswerKeys } from "./renderers";
import type {
  ExerciseCategory,
  ExerciseResponse,
  ExerciseResult,
  PublicExercise,
} from "@/lib/exercises/types";

interface HistoryRow {
  id: string;
  category: string;
  taskType: string;
  taskNumber: number | null;
  topic: string;
  title: string;
  score: number | null;
  total: number | null;
  mistakes: number | null;
  completedAt: string | null;
}

export function ExerciseRunner({
  moduleId,
  category,
}: {
  moduleId: number;
  category: ExerciseCategory;
}) {
  const { dict } = useI18n();
  const t = dict.exercises;

  const [exercise, setExercise] = useState<PublicExercise | null>(null);
  const [response, setResponse] = useState<ExerciseResponse>({});
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/exercises/history?moduleId=${moduleId}&category=${category}`);
    if (res.ok) setHistory(await res.json());
  }, [moduleId, category]);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setResponse({});
    const res = await fetch("/api/exercises/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, category }),
    });
    if (res.ok) {
      setExercise(await res.json());
      setUnavailable(false);
    } else {
      setExercise(null);
      setUnavailable(true);
    }
    setLoading(false);
  }, [moduleId, category]);

  useEffect(() => {
    loadNext();
    loadHistory();
  }, [loadNext, loadHistory]);

  async function submit() {
    if (!exercise) return;
    setSubmitting(true);
    const res = await fetch(`/api/exercises/${exercise.attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    if (res.ok) {
      setResult(await res.json());
      await loadHistory();
    }
    setSubmitting(false);
  }

  const expected = exercise ? expectedAnswerKeys(exercise.content) : [];
  const answered = expected.filter((k) => (response[k] ?? "").trim().length > 0).length;
  const canSubmit = expected.length === 0 || answered === expected.length;
  const autoScored = result?.total != null;

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href={`/class/${moduleId}`} className="text-sm text-slate-500 hover:underline">
        {t.backToModule}
      </Link>

      {loading && <p className="text-sm text-slate-500">{t.loading}</p>}

      {unavailable && !loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="font-semibold">{t.categories[category]}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {category === "LISTENING" ? t.listeningUnavailable : t.noneAvailable}
          </p>
        </div>
      )}

      {exercise && !loading && (
        <>
          <header>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium rounded-full bg-slate-900 text-white px-2.5 py-1">
                {t.categories[exercise.category]}
                {exercise.taskNumber != null && ` — ${t.opgaveLabel(exercise.taskNumber)}`}
              </span>
              {exercise.isNew && (
                <span className="text-xs font-bold rounded-full bg-emerald-600 text-white px-2.5 py-1 tracking-wide">
                  {t.newBadge}
                </span>
              )}
              <span className="text-xs text-slate-500">
                {t.topicLabel}: {exercise.topic}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-semibold">{exercise.title}</h1>
          </header>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <ul className="space-y-1">
              {exercise.instruction.map((line) => (
                <li key={line} className="text-sm text-slate-700 flex gap-2">
                  <span aria-hidden className="text-slate-400">
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <ExerciseBody
            content={exercise.content}
            response={response}
            setResponse={setResponse}
            disabled={!!result}
            dict={dict}
          />

          {!result && (
            <div className="flex items-center justify-between gap-3 flex-wrap border-t border-slate-200 pt-5">
              {expected.length > 0 && (
                <span className="text-sm text-slate-500">
                  {t.answeredProgress(answered, expected.length)}
                </span>
              )}
              <button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5 disabled:opacity-40"
              >
                {exercise.category === "SPEAKING" ? t.markDone : t.submit}
              </button>
            </div>
          )}

          {result && (
            <div className="rounded-xl border-2 border-slate-900 bg-white p-6 space-y-4">
              <h2 className="font-semibold">{t.resultTitle}</h2>

              {autoScored ? (
                <>
                  <p className="text-lg">{t.scoreLine(result.score ?? 0, result.total ?? 0)}</p>
                  <p
                    className={`text-sm ${
                      (result.mistakes ?? 0) === 0 ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {(result.mistakes ?? 0) === 0
                      ? t.perfect
                      : t.mistakesLine(result.mistakes ?? 0)}
                  </p>

                  <ul className="space-y-3 pt-2">
                    {result.answers.map((a) => (
                      <li
                        key={a.key}
                        className={`rounded-lg p-3 ${
                          a.isCorrect ? "bg-emerald-50" : "bg-red-50"
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {a.isCorrect ? "✓" : "✗"} {a.label}
                        </p>
                        {!a.isCorrect && (
                          <p className="mt-1 text-xs text-slate-600">
                            {t.yourAnswer}: {a.given ?? t.notAnswered} · {t.correctAnswer}:{" "}
                            <span className="font-medium">{a.expected}</span>
                          </p>
                        )}
                        {a.why && <p className="mt-1 text-xs text-slate-600">{a.why}</p>}
                      </li>
                    ))}
                  </ul>
                </>
              ) : exercise.category === "WRITING" ? (
                <>
                  <p className="text-sm text-slate-700">{t.writingSubmitted}</p>
                  <p className="text-sm">
                    {t.wordCount(result.wordCount ?? 0)}
                    {result.minWords != null && (result.wordCount ?? 0) < result.minWords && (
                      <span className="ml-2 text-amber-700">{t.belowMinimum}</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-700">{t.speakingDone}</p>
              )}

              <button
                onClick={loadNext}
                className="mt-2 rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5"
              >
                {t.nextExercise}
              </button>
            </div>
          )}
        </>
      )}

      <section className="border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.history}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">{t.historyEmpty}</p>
        ) : (
          <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {history.map((h) => (
              <li key={h.id} className="p-3 px-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-700">
                  {t.categories[h.category] ?? h.category}
                  {h.taskNumber != null && ` — ${t.opgaveLabel(h.taskNumber)}`}
                  <span className="text-slate-400"> · {h.topic}</span>
                </span>
                <span className="text-slate-500 whitespace-nowrap">
                  {h.total != null
                    ? `${h.score}/${h.total} · ${t.historyMistakes(h.mistakes ?? 0)}`
                    : t.historyCompleted}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
