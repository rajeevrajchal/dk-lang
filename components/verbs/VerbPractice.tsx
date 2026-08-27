"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/http/client";
import { useAction } from "@/lib/hooks/useAction";
import { ActionButton, EmptyState, ErrorState, SkeletonList } from "@/components/ui/states";
import { SideNotes } from "@/components/ui/SideNotes";
import { DanishText } from "@/components/translation/DanishText";
import { isAnswerCorrect } from "@/lib/verbs/practice";
import { VERB_PRACTICE_MODES } from "@/lib/verbs/constants";
import type { VerbAnswerResult, VerbPracticeMode, VerbQuestion } from "@/types";

// Practising verbs.
//
// Marking happens locally so the learner gets an answer the instant they press
// a key, and every answer is ALSO sent to the server, which re-derives what was
// correct from the question key rather than trusting the browser. So the fast
// feedback and the recorded result are independent, and a lost connection
// costs the record but not the round.
//
// The round is answered one question at a time and recorded one question at a
// time, deliberately: a batch sent at the end would lose everything if the
// learner closed the tab on question nine.

const MODE_LABEL: Record<VerbPracticeMode, string> = {
  DA_EN: "Danish → English",
  EN_DA: "English → Danish",
  FILL_BLANK: "Fill in the blank",
  CHOOSE_VERB: "Choose the verb",
  CONJUGATE: "Conjugation",
};

interface Answered {
  given: string;
  isCorrect: boolean;
}

const QuestionCard = ({
  question,
  answered,
  onAnswer,
  pending,
}: {
  question: VerbQuestion;
  answered: Answered | null;
  onAnswer: (given: string) => void;
  pending: boolean;
}) => {
  const [typed, setTyped] = useState("");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {MODE_LABEL[question.mode]}
        </span>
        <p className="mt-1 text-base font-medium text-slate-900">{question.prompt}</p>
      </div>

      {question.danish && (
        <DanishText
          text={question.danish}
          className="rounded-lg bg-slate-50 px-4 py-3 text-lg text-slate-900"
          as="div"
          showSentenceButton={question.danish.split(" ").length > 2}
        />
      )}

      {question.options ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const chosen = answered?.given === option;
            const isTheAnswer = answered && option === question.answer;
            return (
              <button
                key={option}
                type="button"
                disabled={!!answered || pending}
                onClick={() => onAnswer(option)}
                className={`rounded-lg border px-4 py-2.5 text-left text-sm transition disabled:cursor-default ${
                  isTheAnswer
                    ? "border-emerald-400 bg-emerald-50 font-medium text-emerald-900"
                    : chosen
                      ? "border-red-400 bg-red-50 text-red-900"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (answered || !typed.trim()) return;
            onAnswer(typed);
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            value={answered ? answered.given : typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={!!answered || pending}
            placeholder="Type your answer in Danish"
            aria-label="Your answer"
            autoComplete="off"
            className={`min-w-[12rem] flex-1 rounded-md border px-3 py-2 text-sm ${
              answered
                ? answered.isCorrect
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-red-400 bg-red-50"
                : "border-slate-300"
            }`}
          />
          <ActionButton type="submit" disabled={!!answered || !typed.trim()} pending={pending}>
            Check
          </ActionButton>
        </form>
      )}

      {answered && (
        <div
          className={`rounded-lg p-3.5 text-sm ${
            answered.isCorrect
              ? "bg-emerald-50 text-emerald-900"
              : "bg-red-50 text-red-900"
          }`}
        >
          <p className="font-medium">
            {answered.isCorrect ? "Correct." : `Not quite — the answer is “${question.answer}”.`}
          </p>
          <p className="mt-1 text-slate-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export const VerbPractice = ({ verbIds }: { verbIds?: string[] }) => {
  const [questions, setQuestions] = useState<VerbQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answered>>({});
  const [modes, setModes] = useState<VerbPracticeMode[]>([]);

  const startRound = useCallback(async () => {
    const data = await apiFetch<{ questions: VerbQuestion[] }>("/api/verbs/practice", {
      json: { modes: modes.length > 0 ? modes : undefined, verbIds },
    });
    setQuestions(data.questions);
    setIndex(0);
    setAnswers({});
    return data;
  }, [modes, verbIds]);

  const start = useAction(startRound);

  const send = useCallback(async (questionKey: string, given: string) => {
    return apiFetch<{ results: VerbAnswerResult[] }>("/api/verbs/answer", {
      json: { answers: [{ questionKey, given }] },
    });
  }, []);
  const record = useAction(send);

  const question = questions?.[index] ?? null;
  const answered = question ? (answers[question.questionKey] ?? null) : null;
  const done = questions !== null && index >= questions.length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;

  const answer = (given: string) => {
    if (!question || answers[question.questionKey]) return;
    // Marked here so the learner sees the result immediately; the server marks
    // it again from the question key, which is what actually gets recorded.
    const isCorrect = isAnswerCorrect(question, given);
    setAnswers((prev) => ({ ...prev, [question.questionKey]: { given, isCorrect } }));
    void record.run(question.questionKey, given);
  };

  if (!questions) {
    return (
      <div className="space-y-5">
        <SideNotes context={{ surface: "verbs" }} title="Before you start" />

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            {verbIds?.length
              ? `Practise ${verbIds.length} verb${verbIds.length === 1 ? "" : "s"} you have got wrong`
              : "Ten verbs, mixed"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {verbIds?.length
              ? "These are the verbs from your review list."
              : "The round is weighted towards verbs you have got wrong and verbs due for review. Everything else is filled with the most common verbs you have not met yet."}
          </p>

          <fieldset className="mt-4">
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Question types (all of them by default)
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {VERB_PRACTICE_MODES.map((m) => {
                const on = modes.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setModes((prev) => (on ? prev.filter((x) => x !== m) : [...prev, m]))
                    }
                    aria-pressed={on}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      on
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {MODE_LABEL[m]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5">
            <ActionButton
              onClick={() => void start.run()}
              pending={start.pending}
              pendingLabel="Building your round…"
            >
              Start practising
            </ActionButton>
          </div>

          {start.error && (
            <div className="mt-3">
              <ErrorState
                error={start.error}
                onRetry={() => void start.run()}
                title="Could not start a round"
              />
            </div>
          )}
        </div>

        {start.pending && <SkeletonList rows={2} lines={3} />}
      </div>
    );
  }

  if (done) {
    const wrong = questions.filter((q) => answers[q.questionKey]?.isCorrect === false);
    return (
      <div className="space-y-5">
        <div className="rounded-xl border-2 border-slate-900 bg-white p-6">
          <h2 className="text-lg font-semibold">
            {correctCount} out of {questions.length} correct
          </h2>
          {wrong.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-slate-600">
                These went into your review list, so they will come back.
              </p>
              <ul className="mt-4 space-y-2">
                {wrong.map((q) => (
                  <li key={q.questionKey} className="rounded-lg bg-red-50 p-3 text-sm">
                    <p className="font-medium text-slate-900">at {q.verbId}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{q.explanation}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-sm text-emerald-700">
              Every one right. The next round will move on to new verbs.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton onClick={() => void start.run()} pending={start.pending}>
              Another round
            </ActionButton>
            <Link
              href="/verbs"
              className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Back to the verb list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return <EmptyState title="Nothing to practise" body="Try again in a moment." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">
          Question {index + 1} of {questions.length}
        </span>
        <span className="text-sm text-slate-500">{correctCount} correct so far</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-slate-900 transition-all"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <QuestionCard
        question={question}
        answered={answered}
        onAnswer={answer}
        pending={false}
      />

      {record.error && (
        <ErrorState
          error={record.error}
          title="Your answer was not saved"
          onRetry={() =>
            answered ? void record.run(question.questionKey, answered.given) : undefined
          }
        />
      )}

      {answered && (
        <ActionButton onClick={() => setIndex((i) => i + 1)}>
          {index + 1 === questions.length ? "See your results" : "Next question"}
        </ActionButton>
      )}
    </div>
  );
};
