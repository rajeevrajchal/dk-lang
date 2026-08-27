"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { ConversationTurn, SpeakingStage } from "@/types";

// The turn-by-turn half of a speaking opgave.
//
// The learner says their answer aloud and then types it, which is what lets
// the examiner react to it. Without audio input that is the honest version of
// this — the app is rehearsing the shape of the conversation, not assessing
// pronunciation, and the copy says so.
//
// All progression lives on the server (see /api/exercises/[id]/speaking-turn);
// this component only renders turns and posts what was said.

export const SpeakingConversation = ({
  attemptId,
  stages,
}: {
  attemptId: string;
  stages: SpeakingStage[];
}) => {
  const { dict } = useI18n();
  const t = dict.exercises;

  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [covered, setCovered] = useState<string[]>([]);
  const [uncovered, setUncovered] = useState<string[]>([]);
  const [adaptive, setAdaptive] = useState(true);

  const turn = async (said?: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/exercises/${attemptId}/speaking-turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(said ? { answer: said } : {}),
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.done) {
        setDone(true);
        return;
      }
      setTurns((prev) => [
        ...prev,
        ...(said ? ([{ speaker: "candidate", text: said }] as ConversationTurn[]) : []),
        { speaker: "examiner", text: data.question } as ConversationTurn,
      ]);
      setStageIndex(data.stageIndex ?? 0);
      setCovered(data.covered ?? []);
      setUncovered(data.uncovered ?? []);
      setAdaptive(data.adaptive !== false);
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    const said = answer.trim();
    if (!said) return;
    setAnswer("");
    await turn(said);
  };

  const stage = stages[stageIndex];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="font-semibold">{t.conversation}</h3>
        <p className="mt-1 text-xs text-slate-500">{t.conversationIntro}</p>
      </div>

      {stage && (
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.stageLabel(stageIndex + 1)} ·{" "}
            {stage.role === "examiner"
              ? t.roleExaminer
              : stage.role === "partner"
                ? t.rolePartner
                : t.roleSolo}
          </p>
          <p className="mt-1 text-sm text-slate-700">{stage.instruction}</p>
        </div>
      )}

      {!adaptive && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          {t.scriptedNotice}
        </p>
      )}

      {turns.length > 0 && (
        <ol className="space-y-3">
          {turns.map((turnItem, i) => (
            <li
              key={i}
              className={
                turnItem.speaker === "examiner"
                  ? "rounded-lg bg-slate-100 p-3"
                  : "rounded-lg bg-blue-50 p-3 ml-6"
              }
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {turnItem.speaker === "examiner"
                  ? stage?.role === "partner"
                    ? t.rolePartner
                    : t.roleExaminer
                  : t.yourAnswerLabel}
              </p>
              <p className="mt-0.5 text-sm text-slate-800">{turnItem.text}</p>
            </li>
          ))}
        </ol>
      )}

      {/* Coverage is what stops the examiner drifting; showing it makes the
          behaviour legible rather than mysterious. */}
      {(covered.length > 0 || uncovered.length > 0) && !done && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {covered.map((c) => (
            <span key={c} className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
              ✓ {c}
            </span>
          ))}
          {uncovered.map((c) => (
            <span key={c} className="rounded-full bg-slate-100 text-slate-500 px-2 py-0.5">
              {c}
            </span>
          ))}
        </div>
      )}

      {done ? (
        <p className="text-sm text-emerald-700">{t.conversationDone}</p>
      ) : !started ? (
        <button
          onClick={() => {
            setStarted(true);
            turn();
          }}
          disabled={busy}
          className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
        >
          {busy ? t.thinking : t.startConversation}
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t.answerPlaceholder}
            rows={3}
            disabled={busy}
            className="w-full rounded-md border border-slate-300 p-3 text-sm disabled:opacity-60"
          />
          <button
            onClick={send}
            disabled={busy || !answer.trim()}
            className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
          >
            {busy ? t.thinking : t.send}
          </button>
        </div>
      )}
    </div>
  );
};
