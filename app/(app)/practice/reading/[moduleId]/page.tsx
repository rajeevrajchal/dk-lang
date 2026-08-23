"use client";

import { useEffect, useState, useCallback, use as usePromise } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { TranslatablePassage } from "@/components/TranslatablePassage";
import { ExplainPanel } from "@/components/ExplainPanel";
import type { MatchingOptions, PracticeItem } from "@/types";

const AnswerInput = ({
  item,
  onSubmit,
  disabled,
}: {
  item: PracticeItem;
  onSubmit: (response: string | string[]) => void;
  disabled: boolean;
}) => {
  const { dict } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<number, number | null>>({});

  useEffect(() => {
    setSelected(null);
    setMatches({});
  }, [item.id]);

  if (item.type === "MULTIPLE_CHOICE" || item.type === "GAP_FILL") {
    const options: string[] = item.optionsJson ? JSON.parse(item.optionsJson) : [];
    return (
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={disabled}
            onClick={() => setSelected(opt)}
            className={`block w-full text-left rounded-md border px-4 py-2 text-sm transition ${
              selected === opt
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 hover:border-slate-400"
            } disabled:opacity-60`}
          >
            {opt}
          </button>
        ))}
        <button
          disabled={disabled || !selected}
          onClick={() => selected && onSubmit(selected)}
          className="mt-3 rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
        >
          {dict.practice.answerButton}
        </button>
      </div>
    );
  }

  if (item.type === "TRUE_FALSE") {
    return (
      <div className="flex gap-3">
        {["Sandt", "Falsk"].map((opt) => (
          <button
            key={opt}
            disabled={disabled}
            onClick={() => onSubmit(opt)}
            className="rounded-md border border-slate-200 px-6 py-2 text-sm hover:border-slate-400 disabled:opacity-60"
          >
            {opt === "Sandt" ? dict.practice.trueLabel : dict.practice.falseLabel}
          </button>
        ))}
      </div>
    );
  }

  if (item.type === "MATCHING") {
    const options: MatchingOptions = item.optionsJson
      ? JSON.parse(item.optionsJson)
      : { left: [], right: [] };

    const allMatched = options.left.every((_, i) => matches[i] != null);

    return (
      <div className="space-y-3">
        {options.left.map((leftLabel, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-56 text-sm font-medium">{leftLabel}</span>
            <select
              disabled={disabled}
              value={matches[i] ?? ""}
              onChange={(e) =>
                setMatches((m) => ({ ...m, [i]: e.target.value === "" ? null : Number(e.target.value) }))
              }
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">{dict.practice.chooseEllipsis}</option>
              {options.right.map((rightLabel, j) => (
                <option key={j} value={j}>
                  {rightLabel}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          disabled={disabled || !allMatched}
          onClick={() =>
            onSubmit(options.left.map((_, i) => `${i}:${matches[i]}`))
          }
          className="mt-2 rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
        >
          {dict.practice.answerButton}
        </button>
      </div>
    );
  }

  return null;
};

const ReadingPracticePage = ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { dict, translateHelperDefault } = useI18n();
  const { moduleId } = usePromise(params);
  const moduleIdNum = Number(moduleId);

  const [items, setItems] = useState<PracticeItem[] | null>(null);
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; tierReason: string } | null>(null);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string | null } | null>(
    null
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startedAt, setStartedAt] = useState<number>(Date.now());

  const loadSet = useCallback(async () => {
    const res = await fetch(`/api/practice?moduleId=${moduleIdNum}&skill=READING&count=8`);
    const data = await res.json();
    setItems(data.items);
    setTierInfo({ currentTier: data.currentTier, tierReason: data.tierReason });
    setIndex(0);
    setFeedback(null);
    setScore({ correct: 0, total: 0 });
    setStartedAt(Date.now());
  }, [moduleIdNum]);

  useEffect(() => {
    loadSet();
  }, [loadSet]);

  const handleSubmit = async (response: string | string[]) => {
    if (!items) return;
    const item = items[index];
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, response, timeMs: Date.now() - startedAt }),
    });
    const data = await res.json();
    setFeedback({ isCorrect: data.isCorrect, explanation: data.explanation });
    setScore((s) => ({ correct: s.correct + (data.isCorrect ? 1 : 0), total: s.total + 1 }));
  };

  const handleNext = () => {
    setFeedback(null);
    setStartedAt(Date.now());
    setIndex((i) => i + 1);
  };

  if (!items || !tierInfo) {
    return <div className="p-8 text-sm text-slate-500">{dict.practice.loadingExercises}</div>;
  }

  if (index >= items.length) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">{dict.practice.exerciseComplete}</h1>
          <p className="mt-2 text-slate-600">{dict.practice.scoreLine(score.correct, score.total)}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={loadSet}
              className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2"
            >
              {dict.practice.newRound}
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 text-sm font-medium px-4 py-2"
            >
              {dict.practice.backToDashboard}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const item = items[index];

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
        <Link href="/dashboard" className="hover:underline">
          {dict.common.backToDashboard}
        </Link>
        <span>
          {dict.practice.question(index + 1, items.length)} · {dict.practice.points(score.correct, score.total)}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-900 text-white px-2.5 py-1">Tier {item.tierId}</span>
        <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1">
          {dict.enums.topics[item.topic] ?? item.topic}
        </span>
        {item.constructs.map((c) => (
          <span key={c.id} className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-500">
            {c.name}
          </span>
        ))}
      </div>

      <p className="mb-4 text-xs text-slate-400">{tierInfo.tierReason}</p>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {item.passageText && (
          <TranslatablePassage
            passageText={item.passageText}
            passageId={item.passageId}
            defaultOn={translateHelperDefault}
          />
        )}
        <p className="mb-4 font-medium">{item.promptText}</p>

        <AnswerInput item={item} onSubmit={handleSubmit} disabled={!!feedback} />

        {feedback && (
          <div
            className={`mt-5 rounded-md p-4 text-sm ${
              feedback.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">{feedback.isCorrect ? dict.practice.correctFeedback : dict.practice.incorrectFeedback}</p>
            {feedback.explanation && <p className="mt-1">{feedback.explanation}</p>}
            <button
              onClick={handleNext}
              className="mt-3 rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2"
            >
              {index + 1 < items.length ? dict.practice.next : dict.practice.seeResult}
            </button>
          </div>
        )}

        {item.passageText && (
          <ExplainPanel passageId={item.passageId} moduleId={moduleIdNum} />
        )}
      </div>
    </div>
  );
};

export default ReadingPracticePage;
