"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { apiFetch, isApiError } from "@/lib/http/client";
import { useAction } from "@/lib/hooks/useAction";
import {
  ActionButton,
  EmptyState,
  ErrorState,
  SkeletonCard,
  SkeletonList,
} from "@/components/ui/states";
import { SideNotes } from "@/components/ui/SideNotes";
import { AnswerFeedbackList } from "./AnswerFeedbackList";
import { ExerciseBody, expectedAnswerKeys, wantsWideLayout } from "./renderers";
import { OpgaveExplain } from "./OpgaveExplain";
import { SpeakingConversation } from "./SpeakingConversation";
import type {
  AnswerFeedback,
  ApiError,
  ExerciseResponse,
  ExerciseResult,
  PublicExercise,
  SpeakingContent,
} from "@/types";

// Sitting one exercise.
//
// Extracted so that the two ways of reaching an exercise — "serve me the next
// one" and "open Task 14" — share every part of the experience that comes
// after: the body, the submit gate, the English feedback, the side notes and
// the result panel. They differ in exactly one thing, which is how the
// exercise arrives, so that is the prop.
//
// Before this the runner owned both, and adding numbered tasks would have
// meant a second copy of the result screen. Two result screens is how the two
// slowly stop agreeing.

export type Result = ExerciseResult & { feedback?: AnswerFeedback[] };

export const ExercisePlayer = ({
  load,
  loadingNote,
  header,
  onLoaded,
  onCompleted,
  footer,
  sideNoteSurface = "reading",
  emptyTitle,
  emptyBody,
}: {
  /** Fetches the exercise. Called on mount and whenever `retry` is pressed. */
  load: (signal: AbortSignal) => Promise<PublicExercise>;
  /** Shown while loading, when the wait is long enough to need explaining. */
  loadingNote?: { title: string; body?: string };
  /** Rendered above the exercise, once it has arrived. */
  header?: (exercise: PublicExercise) => React.ReactNode;
  onLoaded?: (exercise: PublicExercise) => void;
  /** Called once the exercise has been graded. */
  onCompleted?: (result: Result, exercise: PublicExercise) => void;
  /** Rendered inside the result panel, under the feedback. */
  footer?: (result: Result, exercise: PublicExercise) => React.ReactNode;
  sideNoteSurface?: "reading" | "writing" | "speaking" | "mock";
  emptyTitle?: string;
  emptyBody?: string;
}) => {
  const { dict } = useI18n();
  const t = dict.exercises;

  const [exercise, setExercise] = useState<PublicExercise | null>(null);
  const [response, setResponse] = useState<ExerciseResponse>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

  // Preparing an exercise can take a while, and a reply to a request the
  // learner has already moved on from must never overwrite the current one.
  const requestRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setLoading(true);
    setLoadError(null);
    setResult(null);
    setResponse({});

    try {
      const next = await load(controller.signal);
      if (controller.signal.aborted) return;
      setExercise(next);
      onLoaded?.(next);
    } catch (err) {
      if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
      setExercise(null);
      setLoadError(
        isApiError(err) ? err : { status: 0, message: "Could not load this exercise." }
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
    // `onLoaded` is a callback the caller may rebuild each render; including it
    // would restart the exercise on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  useEffect(() => {
    void start();
    return () => requestRef.current?.abort();
  }, [start]);

  const submitAnswers = useCallback(async () => {
    if (!exercise) return null;
    const data = await apiFetch<Result>(`/api/exercises/${exercise.attemptId}/submit`, {
      json: { response },
    });
    setResult(data);
    onCompleted?.(data, exercise);
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, response]);

  // The guard lives in the hook and is checked synchronously — a second click
  // in the same tick would otherwise still see `pending === false`.
  const submit = useAction(submitAnswers);

  const expected = exercise ? expectedAnswerKeys(exercise.content) : [];
  const answered = expected.filter((k) => (response[k] ?? "").trim().length > 0).length;
  const canSubmit = expected.length === 0 || answered === expected.length;
  const autoScored = result?.total != null;
  const wide = !!exercise && wantsWideLayout(exercise.content);

  return (
    <div className={wide ? "max-w-6xl" : "max-w-3xl"}>
      {loading && (
        <div className="space-y-4" role="status" aria-busy="true">
          {loadingNote && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-700">
                <span className="inline-block animate-pulse">{loadingNote.title}</span>
              </p>
              {loadingNote.body && (
                <p className="mt-1 text-xs text-slate-500">{loadingNote.body}</p>
              )}
            </div>
          )}
          <SkeletonCard lines={2} />
          <SkeletonList rows={2} lines={4} />
        </div>
      )}

      {loadError && !loading && (
        <ErrorState
          error={loadError}
          onRetry={() => void start()}
          title="This task could not be prepared"
        />
      )}

      {!loading && !loadError && !exercise && (
        <EmptyState
          title={emptyTitle ?? t.categories.READING}
          body={emptyBody ?? t.noneAvailable}
        />
      )}

      {exercise && !loading && (
        <div className="space-y-6">
          {header?.(exercise)}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <ul className="space-y-1">
              {exercise.instruction.map((line) => (
                <li key={line} className="flex gap-2 text-sm text-slate-700">
                  <span aria-hidden className="text-slate-400">
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {!result && (
            <SideNotes
              context={{ taskType: exercise.taskType, surface: sideNoteSurface }}
              title="Before you start"
            />
          )}

          <ExerciseBody
            content={exercise.content}
            response={response}
            setResponse={setResponse}
            disabled={!!result}
            dict={dict}
          />

          {!result &&
            exercise.category === "SPEAKING" &&
            (exercise.content as SpeakingContent).stages && (
              <SpeakingConversation
                attemptId={exercise.attemptId}
                stages={(exercise.content as SpeakingContent).stages!}
              />
            )}

          {!result && (
            <div className="space-y-3 border-t border-slate-200 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {expected.length > 0 && (
                  <span className="text-sm text-slate-500">
                    {t.answeredProgress(answered, expected.length)}
                  </span>
                )}
                <ActionButton
                  onClick={() => void submit.run()}
                  pending={submit.pending}
                  disabled={!canSubmit}
                  pendingLabel="Checking your answers…"
                >
                  {exercise.category === "SPEAKING" ? t.markDone : t.submit}
                </ActionButton>
              </div>
              {submit.error && (
                <ErrorState
                  error={submit.error}
                  onRetry={() => void submit.run()}
                  title="Your answers were not submitted"
                  retryLabel="Submit again"
                />
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4 rounded-xl border-2 border-slate-900 bg-white p-6">
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

                  <AnswerFeedbackList
                    attemptId={exercise.attemptId}
                    answers={result.answers}
                    initialFeedback={result.feedback ?? []}
                  />
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

              {exercise.explainable && <OpgaveExplain attemptId={exercise.attemptId} />}

              {footer?.(result, exercise)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
