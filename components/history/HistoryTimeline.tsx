"use client";

import { useState } from "react";
import Link from "next/link";
import { DanishText } from "@/components/translation/DanishText";
import { EmptyState } from "@/components/ui/states";
import type { HistoryPassage, HistoryQuestion, HistorySession } from "@/types";

// The learner's own history, as Test → Paragraph → Question.
//
// The nesting is the requirement, not decoration. A reading question without
// the paragraph it was about is unreviewable — the learner cannot see what
// they misread — so the paragraph is stored with the answer and shown again
// here, on demand rather than by default, because eight paragraphs open at
// once is not a history, it is the test again.

const QuestionRow = ({ q }: { q: HistoryQuestion }) => {
  return (
    <li
      className={`rounded-lg border p-3 ${
        q.isCorrect ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/40"
      }`}
    >
      <div className="flex items-start gap-2">
        <span aria-hidden className="text-sm">
          {q.isCorrect ? "✓" : "✗"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{q.questionText}</p>

          {q.danishText && (
            <DanishText
              as="div"
              text={q.danishText}
              className="mt-1 text-sm text-slate-700"
            />
          )}

          <p className="mt-1.5 text-xs text-slate-600">
            You answered{" "}
            <span className={q.isCorrect ? "text-emerald-800" : "text-red-700"}>
              {q.userAnswer ?? "nothing"}
            </span>
            {!q.isCorrect && (
              <>
                {" · correct answer "}
                <span className="font-medium text-emerald-800">{q.correctAnswer}</span>
              </>
            )}
            {q.attemptNumber > 1 && (
              <span className="text-slate-400"> · attempt {q.attemptNumber}</span>
            )}
          </p>

          {q.explanation && (
            <p className="mt-1.5 border-l-2 border-slate-300 pl-2.5 text-xs text-slate-600">
              {q.explanation}
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

const Passage = ({ passage }: { passage: HistoryPassage }) => {
  const [showText, setShowText] = useState(false);
  const wrong = passage.questions.filter((q) => !q.isCorrect).length;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {passage.label ?? "Questions"}
          <span className="ml-2 font-normal normal-case text-slate-400">
            {passage.questions.length - wrong}/{passage.questions.length} correct
          </span>
        </p>
        {passage.text && (
          <button
            type="button"
            onClick={() => setShowText((v) => !v)}
            aria-expanded={showText}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
          >
            {showText ? "Hide the text" : "Show the text again"}
          </button>
        )}
      </div>

      {showText && passage.text && (
        <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
          {passage.text.split("\n").map((line, i) => (
            <DanishText
              key={i}
              as="div"
              text={line}
              className="mb-1 text-sm text-slate-800 last:mb-0"
            />
          ))}
        </div>
      )}

      <ul className="mt-2 space-y-2">
        {passage.questions.map((q) => (
          <QuestionRow key={q.id} q={q} />
        ))}
      </ul>
    </div>
  );
};

const Session = ({ session }: { session: HistorySession }) => {
  // Sessions with a mistake open by default: those are the ones a learner came
  // here to look at.
  const [open, setOpen] = useState(session.correct < session.total);

  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{session.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {new Date(session.at).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {session.moduleId != null && ` · Modul ${session.moduleId}`}
            {session.category && ` · ${session.category.toLowerCase()}`}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            session.correct === session.total
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {session.correct}/{session.total}
        </span>
        <span aria-hidden className="text-xs text-slate-400">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 p-4">
          {session.passages.map((p, i) => (
            <Passage key={i} passage={p} />
          ))}
        </div>
      )}
    </li>
  );
};

export const HistoryTimeline = ({ sessions }: { sessions: HistorySession[] }) => {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        body="Every question you answer is recorded here, with the text it was about, so you can come back and see what happened."
        action={
          <Link
            href="/class"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Start practising
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((s, i) => (
        <Session key={s.attemptId ?? `${s.source}-${i}`} session={s} />
      ))}
    </ul>
  );
};
