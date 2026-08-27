"use client";

import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/http/client";
import { useAction } from "@/lib/hooks/useAction";
import { ActionButton, ErrorState } from "@/components/ui/states";
import { DanishText } from "@/components/translation/DanishText";
import { TOPIC_LABELS } from "@/lib/learning/topics";
import type { AnswerFeedback, GradedAnswer } from "@/types";

// The results list, in English.
//
// What changed here and why: the old version showed the Danish rationale the
// variant happened to carry, which meant a learner who could not read Danish —
// the entire audience — could not read the explanation of the Danish they had
// just got wrong. Now every answer shows three things in English:
//
//   · why the answer you gave does not work
//   · why the correct one is correct
//   · the rule behind it, stated so it transfers
//
// The Danish question and the Danish answer stay in Danish and stay visible,
// and both are click-to-translate — the learner is meant to keep reading them.

const Row = ({
  answer,
  feedback,
}: {
  answer: GradedAnswer;
  feedback?: AnswerFeedback;
}) => {
  return (
    <li
      className={`rounded-lg border p-3.5 ${
        answer.isCorrect
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-red-200 bg-red-50/60"
      }`}
    >
      <div className="flex items-start gap-2">
        <span aria-hidden className="text-sm">
          {answer.isCorrect ? "✓" : "✗"}
        </span>
        <div className="min-w-0 flex-1">
          <DanishText
            as="div"
            text={answer.label}
            className="text-sm font-medium text-slate-900"
            showSentenceButton={answer.label.split(" ").length > 3}
          />

          {!answer.isCorrect && (
            <p className="mt-1.5 text-xs text-slate-600">
              You answered{" "}
              <span className="font-medium text-red-700">
                {answer.given ?? "nothing"}
              </span>{" "}
              · correct answer{" "}
              <span className="font-medium text-emerald-800">{answer.expected}</span>
            </p>
          )}

          {feedback && !answer.isCorrect && (
            <div className="mt-2 space-y-1.5 border-l-2 border-slate-300 pl-3">
              {feedback.whyYoursWrong && (
                <p className="text-xs text-slate-700">
                  <span className="font-semibold">Why yours doesn&apos;t work: </span>
                  {feedback.whyYoursWrong}
                </p>
              )}
              <p className="text-xs text-slate-700">
                <span className="font-semibold">Why the answer is right: </span>
                {feedback.whyCorrect}
              </p>
              {feedback.rule && (
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">The rule: </span>
                  {feedback.rule}
                </p>
              )}
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                {TOPIC_LABELS[feedback.grammarTopic] ?? feedback.grammarTopic}
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export const AnswerFeedbackList = ({
  attemptId,
  answers,
  initialFeedback,
}: {
  attemptId: string;
  answers: GradedAnswer[];
  initialFeedback: AnswerFeedback[];
}) => {
  const [feedback, setFeedback] = useState(initialFeedback);
  const byKey = new Map(feedback.map((f) => [f.key, f]));
  const wrongCount = answers.filter((a) => !a.isCorrect).length;
  // Only the offline baseline so far, and there are mistakes worth explaining
  // properly.
  const canDeepen =
    wrongCount > 0 && feedback.every((f) => f.source !== "generated");

  const fetchDeeper = useCallback(async () => {
    const data = await apiFetch<{ feedback: AnswerFeedback[]; generated: boolean }>(
      `/api/exercises/${attemptId}/feedback`,
      { method: "POST" }
    );
    setFeedback(data.feedback);
    return data;
  }, [attemptId]);

  const { run, pending, error } = useAction(fetchDeeper);

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {answers.map((a) => (
          <Row key={a.key} answer={a} feedback={byKey.get(a.key)} />
        ))}
      </ul>

      {canDeepen && (
        <div>
          <ActionButton
            variant="secondary"
            onClick={() => void run()}
            pending={pending}
            pendingLabel="Working out what went wrong…"
          >
            Explain my mistakes in detail
          </ActionButton>
          {error && (
            <div className="mt-2">
              <ErrorState
                error={error}
                onRetry={() => void run()}
                title="Could not get the detailed explanation"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
