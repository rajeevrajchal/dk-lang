"use client";

import { useEffect, useRef, useState, use as usePromise } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface ExamItem {
  id: string;
  tierId: number;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "GAP_FILL" | "MATCHING";
  topic: string;
  passageText: string | null;
  passageId: string | null;
  promptText: string;
  optionsJson: string | null;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamReadingPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { dict } = useI18n();
  const { moduleId } = usePromise(params);
  const moduleIdNum = Number(moduleId);

  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [examSessionId, setExamSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<ExamItem[]>([]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<{ score: number; correct: number; total: number; passed: boolean } | null>(
    null
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    const res = await fetch("/api/exam/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: moduleIdNum, skill: "READING" }),
    });
    const data = await res.json();
    setExamSessionId(data.examSessionId);
    setItems(data.items);
    setSecondsLeft(data.timeLimitSeconds);
    setIndex(0);
    setResponses({});
    setPhase("running");
  }

  async function finish(sessionId: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    const res = await fetch(`/api/exam/${sessionId}/complete`, { method: "POST" });
    const data = await res.json();
    setResult(data);
    setPhase("result");
  }

  useEffect(() => {
    if (phase !== "running" || !examSessionId) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          finish(examSessionId);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, examSessionId]);

  async function submitCurrentAndAdvance() {
    if (!examSessionId) return;
    const item = items[index];
    const response = responses[item.id];
    if (response == null) return;

    await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, response, examSessionId }),
    });

    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
    } else {
      finish(examSessionId);
    }
  }

  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
          {dict.common.backToDashboard}
        </Link>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-semibold">{dict.exam.introTitle(moduleIdNum)}</h1>
          <p className="mt-3 text-sm text-slate-600">{dict.exam.introBody}</p>
          <button
            onClick={start}
            className="mt-6 rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5"
          >
            {dict.exam.startTest}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">{result.passed ? dict.exam.passedTitle : dict.exam.notPassedTitle}</h1>
          <p className="mt-2 text-slate-600">
            {dict.exam.resultLine(result.correct, result.total, Math.round(result.score * 100))}
          </p>
          {result.passed && <p className="mt-2 text-sm text-emerald-700">{dict.exam.passedNote}</p>}
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-slate-900 text-white text-sm font-medium px-5 py-2.5"
          >
            {dict.exam.backToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  const item = items[index];
  if (!item) return null;
  const options: string[] = item.optionsJson && item.type !== "MATCHING" ? JSON.parse(item.optionsJson) : [];

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-slate-500">{dict.exam.question(index + 1, items.length)}</span>
        <span className={`font-mono font-medium ${secondsLeft < 60 ? "text-red-600" : "text-slate-700"}`}>
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {/* Deliberately a plain passage: the mock modultest promises "no
            dictionary or aids", so the click-to-translate helper and the
            Explain panel are practice-mode tools only. */}
        {item.passageText && (
          <p className="mb-5 leading-relaxed text-slate-800 whitespace-pre-line">
            {item.passageText}
          </p>
        )}
        <p className="mb-4 font-medium">{item.promptText}</p>

        {(item.type === "MULTIPLE_CHOICE" || item.type === "GAP_FILL") && (
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setResponses((r) => ({ ...r, [item.id]: opt }))}
                className={`block w-full text-left rounded-md border px-4 py-2 text-sm ${
                  responses[item.id] === opt
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {item.type === "TRUE_FALSE" && (
          <div className="flex gap-3">
            {(["Sandt", "Falsk"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setResponses((r) => ({ ...r, [item.id]: opt }))}
                className={`rounded-md border px-6 py-2 text-sm ${
                  responses[item.id] === opt
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                {opt === "Sandt" ? dict.practice.trueLabel : dict.practice.falseLabel}
              </button>
            ))}
          </div>
        )}

        <button
          disabled={responses[item.id] == null}
          onClick={submitCurrentAndAdvance}
          className="mt-5 rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
        >
          {index + 1 < items.length ? dict.exam.next : dict.exam.submit}
        </button>
      </div>
    </div>
  );
}
