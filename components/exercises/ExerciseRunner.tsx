"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { apiFetch, isApiError } from "@/lib/http/client";
import { useAction } from "@/lib/hooks/useAction";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { ActionButton, EmptyState, ErrorState, SkeletonCard, SkeletonList } from "@/components/ui/states";
import { SideNotes } from "@/components/ui/SideNotes";
import { AnswerFeedbackList } from "./AnswerFeedbackList";
import { ExerciseBody, expectedAnswerKeys, wantsWideLayout } from "./renderers";
import { OpgaveExplain } from "./OpgaveExplain";
import { SpeakingConversation } from "./SpeakingConversation";
import type {
  AnswerFeedback,
  ApiError,
  ExerciseCategory,
  ExerciseResponse,
  ExerciseResult,
  HistoryRow,
  PublicExercise,
  SpeakingContent,
} from "@/types";

type Result = ExerciseResult & { feedback?: AnswerFeedback[] };

export const ExerciseRunner = ({
  moduleId,
  category,
  generationEnabled = false,
  taskType,
  backHref,
  backLabel,
}: {
  moduleId: number;
  category: ExerciseCategory;
  generationEnabled?: boolean;
  /** Pin practice to one task type. Omitted, the engine rotates through them. */
  taskType?: string;
  /** Where "back" goes. Defaults to the module hub, as it always did. */
  backHref?: string;
  backLabel?: string;
}) => {
  const { dict } = useI18n();
  const t = dict.exercises;

  const [exercise, setExercise] = useState<PublicExercise | null>(null);
  const [response, setResponse] = useState<ExerciseResponse>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

  // Generating an opgave takes a while, and a reply to a request the learner
  // has already moved on from must never overwrite the current exercise.
  const requestRef = useRef<AbortController | null>(null);

  const history = useAsyncData<HistoryRow[]>(
    `/api/exercises/history?moduleId=${moduleId}&category=${category}`,
    { keepPreviousData: true }
  );

  const loadNext = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setLoading(true);
    setLoadError(null);
    setResult(null);
    setResponse({});

    try {
      const next = await apiFetch<PublicExercise>("/api/exercises/next", {
        signal: controller.signal,
        // mode "class" is the default on the server too; sending it explicitly
        // keeps the request readable next to the mock test's own start call.
        json: { moduleId, category, taskType, mode: "class" },
      });
      if (controller.signal.aborted) return;
      setExercise(next);
    } catch (err) {
      if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
      setExercise(null);
      setLoadError(
        isApiError(err) ? err : { status: 0, message: "Could not load an exercise." }
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [moduleId, category, taskType]);

  useEffect(() => {
    void loadNext();
    return () => requestRef.current?.abort();
  }, [loadNext]);

  const submitAnswers = useCallback(async () => {
    if (!exercise) return null;
    const data = await apiFetch<Result>(`/api/exercises/${exercise.attemptId}/submit`, {
      json: { response },
    });
    setResult(data);
    // The history list is now out of date; reloading it is not what the
    // learner is waiting for, so it is not awaited.
    history.reload();
    return data;
  }, [exercise, response, history]);

  // The guard lives in the hook, checked synchronously — a second click in the
  // same tick would otherwise still see `submitting === false` and get through.
  const submit = useAction(submitAnswers);

  const expected = exercise ? expectedAnswerKeys(exercise.content) : [];
  const answered = expected.filter((k) => (response[k] ?? "").trim().length > 0).length;
  const canSubmit = expected.length === 0 || answered === expected.length;
  const autoScored = result?.total != null;
  // The side-by-side opgaver need the room; everything else keeps the narrower
  // measure, which is easier to read.
  const wide = !!exercise && wantsWideLayout(exercise.content);

  return (
    <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto p-6 sm:p-8 space-y-6`}>
      <Link
        href={backHref ?? `/class/${moduleId}`}
        className="text-sm text-slate-500 hover:underline"
      >
        {backLabel ?? t.backToModule}
      </Link>

      {loading && (
        <div className="space-y-4" role="status" aria-busy="true">
          {generationEnabled && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-700">
                <span className="inline-block animate-pulse">{t.generating}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{t.generatingNote}</p>
            </div>
          )}
          {/* A skeleton shaped like the opgave that is coming, so the page does
              not jump when it arrives. */}
          <SkeletonCard lines={2} />
          <SkeletonList rows={2} lines={4} />
        </div>
      )}

      {loadError && !loading && (
        <ErrorState
          error={loadError}
          onRetry={() => void loadNext()}
          title={
            loadError.status === 404
              ? t.categories[category]
              : "Could not load an exercise"
          }
        />
      )}

      {!loading && !loadError && !exercise && (
        <EmptyState
          title={t.categories[category]}
          body={category === "LISTENING" ? t.listeningUnavailable : t.noneAvailable}
        />
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
              {exercise.generated && (
                <span className="text-xs font-medium rounded-full border border-slate-300 text-slate-500 px-2.5 py-1">
                  {t.generatedBadge}
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

          {/* Two tips at most, matched to this opgave. Before the exercise
              rather than after it: an exam tip read afterwards is a post-mortem. */}
          <SideNotes
            context={{ taskType: exercise.taskType, surface: "reading" }}
            title="Before you start"
          />

          <ExerciseBody
            content={exercise.content}
            response={response}
            setResponse={setResponse}
            disabled={!!result}
            dict={dict}
          />

          {/* A speaking opgave with stages gets the turn-by-turn conversation.
              The original free-form prompts have no stages and keep the plain
              "Jeg er færdig" flow they always had. */}
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
              <div className="flex items-center justify-between gap-3 flex-wrap">
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

                  <AnswerFeedbackList
                    attemptId={exercise.attemptId}
                    answers={result.answers}
                    initialFeedback={result.feedback ?? []}
                  />

                  {(result.mistakes ?? 0) > 0 && (
                    <p className="text-xs text-slate-500">
                      These mistakes are saved to your{" "}
                      <Link href="/mistakes" className="font-medium underline">
                        review list
                      </Link>{" "}
                      so you can come back to them.
                    </p>
                  )}
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

              <ActionButton onClick={() => void loadNext()}>{t.nextExercise}</ActionButton>
            </div>
          )}
        </>
      )}

      <section className="border-t border-slate-200 pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {t.history}
          </h2>
          <Link href="/history" className="text-xs text-slate-500 hover:underline">
            Full history →
          </Link>
        </div>

        {history.status === "loading" && !history.data && <SkeletonList rows={2} lines={1} />}

        {history.status === "error" && (
          <ErrorState
            error={history.error}
            onRetry={history.reload}
            title="Could not load your history"
          />
        )}

        {history.data && history.data.length === 0 && (
          <p className="text-sm text-slate-400">{t.historyEmpty}</p>
        )}

        {history.data && history.data.length > 0 && (
          <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {history.data.map((h) => (
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
};
