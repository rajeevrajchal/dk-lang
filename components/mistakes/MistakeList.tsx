"use client";

import { useState } from "react";
import Link from "next/link";
import { DanishText } from "@/components/translation/DanishText";
import { EmptyState } from "@/components/ui/states";
import { TOPIC_LABELS } from "@/lib/learning/topics";
import type { GrammarTopic, MistakeRow } from "@/types";

// The review list: what you got wrong, what you answered, and whether you have
// got it right since.
//
// A mistake is never deleted when it is answered correctly — it is marked
// resolved and kept. That is what lets the page say "you have since answered
// this correctly", which is the only encouraging thing a mistakes screen can
// truthfully say.

const topicLabel = (topic: string | null): string | null => {
  if (!topic) return null;
  return TOPIC_LABELS[topic as GrammarTopic] ?? topic;
};

const Mistake = ({ m }: { m: MistakeRow }) => {
  const [showPassage, setShowPassage] = useState(false);
  const resolved = m.resolvedAt !== null;

  return (
    <li
      className={`rounded-xl border bg-white ${
        resolved ? "border-emerald-200" : "border-slate-200"
      }`}
    >
      <div className="space-y-2.5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{m.questionText}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              resolved
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {resolved ? "Right since" : `Wrong ${m.timesWrong}×`}
          </span>
        </div>

        {m.danishText && (
          <DanishText
            as="div"
            text={m.danishText}
            className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-800"
          />
        )}

        <p className="text-xs text-slate-600">
          You answered{" "}
          <span className="font-medium text-red-700">{m.lastWrongAnswer ?? "nothing"}</span>{" "}
          · correct answer{" "}
          <span className="font-medium text-emerald-800">{m.correctAnswer}</span>
        </p>

        {m.explanation && (
          <p className="border-l-2 border-slate-300 pl-3 text-xs text-slate-600">
            {m.explanation}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {topicLabel(m.grammarTopic) && (
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
              {m.source === "VERB" ? `at ${m.grammarTopic}` : topicLabel(m.grammarTopic)}
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            Last wrong{" "}
            {new Date(m.lastWrongAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
            {m.timesRight > 0 && ` · right ${m.timesRight}× since`}
          </span>

          {m.passageText && (
            <button
              type="button"
              onClick={() => setShowPassage((v) => !v)}
              aria-expanded={showPassage}
              className="ml-auto rounded border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              {showPassage ? "Hide the text" : "See the text again"}
            </button>
          )}
        </div>

        {showPassage && m.passageText && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            {m.passageLabel && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {m.passageLabel}
              </p>
            )}
            {m.passageText.split("\n").map((line, i) => (
              <DanishText
                key={i}
                as="div"
                text={line}
                className="mb-1 text-sm text-slate-800 last:mb-0"
              />
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

export const MistakeList = ({ mistakes }: { mistakes: MistakeRow[] }) => {
  if (mistakes.length === 0) {
    return (
      <EmptyState
        title="Nothing to review"
        body="Mistakes are saved here as you make them, with the question, the paragraph and an explanation in English."
        action={
          <Link
            href="/class"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go and practise
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {mistakes.map((m) => (
        <Mistake key={m.id} m={m} />
      ))}
    </ul>
  );
};
