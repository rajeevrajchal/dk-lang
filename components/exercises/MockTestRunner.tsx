"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ExerciseBody, expectedAnswerKeys, wantsWideLayout } from "./renderers";
import { OpgaveExplain } from "./OpgaveExplain";
import { practiceHrefFor, summariseMock } from "@/lib/exercises/mock-summary";
import type {
  ExerciseResponse,
  MockPartResult,
  MockPhase,
  MockResult,
  PublicExercise,
} from "@/types";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// A cold part answers "preparing" immediately rather than holding the
// request open for however long generation takes (see
// app/api/mock-test/start/route.ts). Kept in the same "preparing" phase the
// UI already had for the normal case — it just now sometimes lasts longer
// than a moment instead of always being one.
//
// Backs off rather than polling at a flat interval — see the matching
// comment in components/tasks/TaskRunner.tsx.
const POLL_INTERVAL_START_MS = 2000;
const POLL_INTERVAL_STEP_MS = 1000;
const POLL_INTERVAL_MAX_MS = 8000;
const MAX_WAIT_MS = 5 * 60 * 1000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const pollDelay = (attempt: number): number =>
  Math.min(POLL_INTERVAL_START_MS + attempt * POLL_INTERVAL_STEP_MS, POLL_INTERVAL_MAX_MS);

export const MockTestRunner = ({
  generationEnabled,
  backHref,
  testNumber,
  category,
  title,
}: {
  generationEnabled: boolean;
  /** Where "back" goes. */
  backHref?: string;
  /**
   * Which numbered test to sit. Omitted, a fresh test is assembled — the
   * behaviour this runner always had.
   */
  testNumber?: number;
  /** Limits the test to one section. Omitted, it is the full test. */
  category?: string;
  /** Overrides the heading, so a section says what section it is. */
  title?: string;
}) => {
  const { dict } = useI18n();
  const t = dict.mockTest;
  const te = dict.exercises;

  const [phase, setPhase] = useState<MockPhase>("intro");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<PublicExercise[]>([]);
  const [index, setIndex] = useState(0);
  // Responses are held per attemptId so moving between parts keeps the work.
  const [responses, setResponses] = useState<Record<string, ExerciseResponse>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<MockResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unsentParts, setUnsentParts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishingRef = useRef(false);

  // The answers and the parts, held in refs as well as in state.
  //
  // `finish` reads them, and the countdown effect depends on `finish`. Reading
  // them from state would make `finish` a new function on every keystroke,
  // which tears down and recreates the interval - so the clock would restart
  // its tick every time the learner typed a character. A ref keeps `finish`
  // stable and the clock honest.
  const responsesRef = useRef<Record<string, ExerciseResponse>>({});
  const exercisesRef = useRef<PublicExercise[]>([]);
  // Synced in an effect rather than during render: a ref written while
  // rendering is not a render input and React says so. By the time anything
  // can call `finish` - a click, or the countdown - the effect has run.
  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);
  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  const finish = useCallback(async (id: string) => {
    // Guards the timer firing while the learner is already handing in.
    if (finishingRef.current) return;
    finishingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setError(null);

    // Submit every part first so nothing typed is lost, then grade the test.
    // A part that fails to submit is counted rather than swallowed: it would
    // otherwise be scored as unanswered and the learner would never know why.
    const outcomes = await Promise.all(
      exercisesRef.current.map((ex) =>
        fetch(`/api/exercises/${ex.attemptId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responsesRef.current[ex.attemptId] ?? {} }),
        })
          .then((r) => r.ok)
          .catch(() => false)
      )
    );
    setUnsentParts(outcomes.filter((ok) => !ok).length);

    try {
      const res = await fetch(`/api/mock-test/${id}/complete`, { method: "POST" });
      if (res.ok) {
        setResult(await res.json());
        setPhase("result");
        return;
      }
      setError("Could not hand the test in. Your answers are saved - try again.");
    } catch {
      setError("Could not hand the test in. Your answers are saved - try again.");
    }
    // Handing in failed, so it has to be possible to try again. Without this
    // the guard above would refuse every further attempt and the learner would
    // be stuck on a finished test they cannot submit.
    finishingRef.current = false;
  }, []);

  const start = async () => {
    setPhase("preparing");
    setError(null);
    const deadline = Date.now() + MAX_WAIT_MS;

    for (let attempt = 0; ; attempt++) {
      // No module in the payload: the server reads it from the learner's
      // profile. A mock test simulates the test they are preparing for, and
      // which one that is has already been answered at onboarding.
      const res = await fetch("/api/mock-test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testNumber, category }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error ?? "Could not start the test.");
        setPhase("intro");
        return;
      }
      const data = await res.json();
      if (data.ready === false) {
        if (Date.now() >= deadline) {
          setError("This is taking longer than expected. Please try again.");
          setPhase("intro");
          return;
        }
        await sleep(pollDelay(attempt));
        continue;
      }
      setSessionId(data.sessionId);
      setExercises(data.exercises);
      setSecondsLeft(data.timeLimitSeconds);
      setIndex(0);
      setResponses({});
      setPhase("running");
      return;
    }
  };

  useEffect(() => {
    if (phase !== "running" || !sessionId) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          finish(sessionId);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, sessionId, finish]);

  // ---- intro ----------------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
        <Link href={backHref ?? "/mock"} className="text-sm text-slate-500 hover:underline">
          {te.backToModule}
        </Link>
        <div className="rounded-xl border-2 border-slate-900 bg-white p-8">
          <h1 className="text-xl font-semibold">{title ?? t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
          <p className="mt-4 text-sm text-slate-700 leading-relaxed">{t.introBody}</p>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              {t.structure}
            </p>
            <ul className="space-y-1.5">
              {[t.readingPart, t.writingPart, t.timeLimit(40)].map((line) => (
                <li key={line} className="text-sm text-slate-700 flex gap-2">
                  <span aria-hidden className="text-slate-400">
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-xs text-slate-500 leading-relaxed">{t.disclaimer}</p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={start}
            className="mt-6 rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5"
          >
            {t.start}
          </button>
        </div>
      </div>
    );
  }

  // ---- preparing ------------------------------------------------------
  if (phase === "preparing") {
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-sm font-medium text-slate-700">
            <span className="inline-block animate-pulse">{t.preparing}</span>
          </p>
          {generationEnabled && <p className="mt-1 text-xs text-slate-500">{t.preparingNote}</p>}
        </div>
      </div>
    );
  }

  // ---- result ---------------------------------------------------------
  if (phase === "result" && result) {
    const pct = Math.round(result.reading.score * 100);
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
        <h1 className="text-xl font-semibold">{t.resultTitle}</h1>

        {unsentParts > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              {unsentParts} part{unsentParts === 1 ? "" : "s"} could not be sent
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Those parts are scored as unanswered below. It was a connection problem,
              not your answers.
            </p>
          </div>
        )}

        <section
          className={`rounded-xl border-2 p-6 ${
            result.reading.passed ? "border-emerald-600 bg-emerald-50" : "border-slate-900 bg-white"
          }`}
        >
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="font-semibold">{t.readingResult}</h2>
            <span
              className={`text-sm font-semibold ${
                result.reading.passed ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {result.reading.passed ? t.passed : t.notPassed}
            </span>
          </div>
          <p className="mt-2 text-lg">
            {t.readingScore(result.reading.correct, result.reading.total, pct)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t.thresholdNote(Math.round(result.reading.threshold * 100))}
          </p>
          {result.reading.passed && (
            <p className="mt-2 text-sm text-emerald-800">{t.passedNote}</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">{t.writingResult}</h2>
          {result.writing?.answered ? (
            <p className="mt-2 text-sm text-slate-700">
              {t.writingWordCount(result.writing.wordCount, result.writing.minWords ?? 70)}
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-700">{t.writingSkipped}</p>
          )}
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.writingNotScored}</p>
        </section>

        {/* Strengths and weak areas, read straight off the per-opgave scores
            above. Each weak area links to the Class practice for exactly that
            task type — the point of a mock test is to tell you what to go and
            work on. */}
        <MockBreakdown parts={result.parts} />

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t.perPart}
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {result.parts.map((p) => (
              <div key={p.attemptId} className="p-4 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">
                  {te.categories[p.category] ?? p.category}
                  {p.taskNumber != null && ` — ${te.opgaveLabel(p.taskNumber)}`}
                  <span className="text-slate-400"> · {p.topic}</span>
                </span>
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  {p.total != null ? `${p.score}/${p.total}` : te.historyCompleted}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Full per-question review, now that the test is handed in. */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t.reviewAnswers}
          </h2>
          <div className="space-y-5">
            {result.parts.map((p) => (
              <div key={p.attemptId} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold mb-3">
                  {p.taskNumber != null ? `${te.opgaveLabel(p.taskNumber)} — ` : ""}
                  {p.title}
                </p>

                {p.answers.length > 0 && (
                  <ul className="space-y-2">
                    {p.answers.map((a) => (
                      <li
                        key={a.key}
                        className={`rounded-lg p-3 ${a.isCorrect ? "bg-emerald-50" : "bg-red-50"}`}
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {a.isCorrect ? "✓" : "✗"} {a.label}
                        </p>
                        {!a.isCorrect && (
                          <p className="mt-1 text-xs text-slate-600">
                            {te.yourAnswer}: {a.given ?? te.notAnswered} · {te.correctAnswer}:{" "}
                            <span className="font-medium">{a.expected}</span>
                          </p>
                        )}
                        {a.why && <p className="mt-1 text-xs text-slate-600">{a.why}</p>}
                      </li>
                    ))}
                  </ul>
                )}

                {p.explainable && <OpgaveExplain attemptId={p.attemptId} />}
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3 flex-wrap">
          <Link
            href={backHref ?? "/mock"}
            className="rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5"
          >
            {t.backToModule}
          </Link>
          <button
            onClick={() => {
              finishingRef.current = false;
              setResult(null);
              setPhase("intro");
            }}
            className="rounded-md border border-slate-300 text-sm font-medium px-5 py-2.5"
          >
            {t.retake}
          </button>
        </div>
      </div>
    );
  }

  // ---- running --------------------------------------------------------
  const exercise = exercises[index];
  if (!exercise) return null;

  const response = responses[exercise.attemptId] ?? {};
  const setResponse = (next: ExerciseResponse) =>
    setResponses((r) => ({ ...r, [exercise.attemptId]: next }));

  const unansweredCount = exercises.reduce((n, ex) => {
    const keys = expectedAnswerKeys(ex.content);
    const given = responses[ex.attemptId] ?? {};
    const done = keys.filter((k) => (given[k] ?? "").trim().length > 0).length;
    return n + (done < keys.length ? 1 : 0);
  }, 0);

  const isLast = index === exercises.length - 1;
  // Same rule as the practice runner: the side-by-side opgaver get the wider page.
  const wide = wantsWideLayout(exercise.content);

  return (
    <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto p-6 sm:p-8 space-y-5`}>
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 pb-3">
        <span className="text-sm text-slate-500">
          {t.partProgress(index + 1, exercises.length)}
        </span>
        <span
          className={`font-mono font-medium text-sm ${
            secondsLeft < 300 ? "text-red-600" : "text-slate-700"
          }`}
        >
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="flex gap-1.5">
        {exercises.map((ex, i) => (
          <button
            key={ex.attemptId}
            onClick={() => setIndex(i)}
            className={`flex-1 h-1.5 rounded-full transition ${
              i === index ? "bg-slate-900" : i < index ? "bg-slate-400" : "bg-slate-200"
            }`}
            aria-label={t.partProgress(i + 1, exercises.length)}
          />
        ))}
      </div>

      <header>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium rounded-full bg-slate-900 text-white px-2.5 py-1">
            {te.categories[exercise.category]}
            {exercise.taskNumber != null && ` — ${te.opgaveLabel(exercise.taskNumber)}`}
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
        disabled={false}
        dict={dict}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3 flex-wrap border-t border-slate-200 pt-5">
        {unansweredCount > 0 && (
          <span className="text-xs text-amber-700">{t.unanswered(unansweredCount)}</span>
        )}
        <div className="ml-auto flex gap-3">
          {!isLast && (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5"
            >
              {t.next}
            </button>
          )}
          {isLast && (
            <button
              onClick={() => {
                if (sessionId && confirm(t.confirmFinish)) finish(sessionId);
              }}
              className="rounded-md bg-emerald-600 text-white text-sm font-medium px-5 py-2.5"
            >
              {t.finish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * "Strengths / needs practice" for a finished mock test.
 *
 * Grouped by task type, so the advice is actionable ("Opgave 3 — missing
 * words") rather than a single number. Only scored opgaver appear: writing has
 * no examiner here, so it is not turned into a strength or a weakness.
 */
const MockBreakdown = ({ parts }: { parts: MockPartResult[] }) => {
  const { dict } = useI18n();
  const t = dict.mock;
  const te = dict.exercises;
  const summary = summariseMock(parts);

  if (summary.all.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">{t.noBreakdown}</p>
      </section>
    );
  }

  const label = (taskType: string) => {
    return te.taskTypeNames[taskType] ?? te.categories[taskType] ?? taskType;
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      {summary.overall != null && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.overall}
          </p>
          <p className="mt-1 text-2xl font-semibold">{Math.round(summary.overall * 100)}%</p>
        </div>
      )}

      {summary.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            {t.strengths}
          </p>
          <ul className="mt-2 space-y-1">
            {summary.strengths.map((e) => (
              <li key={e.taskType} className="text-sm text-slate-700">
                {label(e.taskType)}{" "}
                <span className="text-slate-400">
                  {e.correct}/{e.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.needsPractice.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            {t.needsPractice}
          </p>
          <ul className="mt-2 space-y-1">
            {summary.needsPractice.map((e) => (
              <li key={e.taskType} className="text-sm text-slate-700 flex items-baseline gap-2 flex-wrap">
                <span>
                  {label(e.taskType)}{" "}
                  <span className="text-slate-400">
                    {e.correct}/{e.total}
                  </span>
                </span>
                <Link
                  href={practiceHrefFor(e)}
                  className="text-xs text-slate-500 underline hover:text-slate-900"
                >
                  {dict.class2.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
