"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Explanation, OpgaveExplainState } from "@/types";

// The "why?" button on a finished opgave. Sits under the per-answer
// rationales in the results and, when opened, explains the Danish text
// itself — what it says, how each sentence is built, and what every word is
// doing. Generated on demand and cached server-side, so opening it a second
// time is instant.

export const OpgaveExplain = ({ attemptId }: { attemptId: string }) => {
  const { dict } = useI18n();
  const t = dict.explain;
  const [state, setState] = useState<OpgaveExplainState>({ kind: "idle" });
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (state.kind === "ready") {
      setOpen((o) => !o);
      return;
    }
    setOpen(true);
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/exercises/${attemptId}/explain`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", noKey: data.reason?.includes("ANTHROPIC_API_KEY") ?? false });
        return;
      }
      setState({ kind: "ready", explanation: data as Explanation });
    } catch {
      setState({ kind: "error", noKey: false });
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={load}
        disabled={state.kind === "loading"}
        className="text-sm font-medium rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
      >
        {open && state.kind === "ready" ? t.hideOpgave : t.explainOpgave}
      </button>

      {open && state.kind === "loading" && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">
            <span className="inline-block animate-pulse">{t.working}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{t.workingNote}</p>
        </div>
      )}

      {open && state.kind === "error" && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">{t.unavailableTitle}</p>
          <p className="mt-1 text-xs text-amber-800">
            {state.noKey ? t.unavailableNoKey : t.unavailableGeneric}
          </p>
        </div>
      )}

      {open && state.kind === "ready" && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5 space-y-6">
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              {t.wholeText}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {state.explanation.summary}
            </p>
          </section>

          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {t.sentenceBreakdown}
            </h4>
            <ol className="space-y-3">
              {state.explanation.sentences.map((s, i) => (
                <li key={i} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{s.danish}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.english}</p>
                  <p className="mt-1.5 text-xs text-blue-800">
                    <span className="font-semibold">{t.structureLabel}: </span>
                    {s.structureNote}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {t.wordByWord}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-medium text-slate-500 py-2 pr-4">{t.colWord}</th>
                    <th className="text-left font-medium text-slate-500 py-2 pr-4">
                      {t.colMeaning}
                    </th>
                    <th className="text-left font-medium text-slate-500 py-2 pr-4 whitespace-nowrap">
                      {t.colDictionary}
                    </th>
                    <th className="text-left font-medium text-slate-500 py-2">{t.colHow}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.explanation.words.map((w, i) => (
                    <tr key={`${w.surface}-${i}`} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 font-medium text-slate-900 align-top whitespace-nowrap">
                        {w.surface}
                      </td>
                      <td className="py-2 pr-4 text-slate-700 align-top">{w.englishGloss}</td>
                      <td className="py-2 pr-4 text-slate-500 align-top whitespace-nowrap">
                        {w.lemma}
                        <span className="block text-xs text-slate-400">{w.partOfSpeech}</span>
                      </td>
                      <td className="py-2 text-xs text-slate-600 align-top">{w.inflectionNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
