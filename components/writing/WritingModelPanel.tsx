"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { WritingModel } from "@/lib/curriculum/course-types";

// A writing lesson, taught rather than set.
//
// The order matters and is the whole point: the learner sees a finished text
// first, so they know what they are aiming at; then the same text taken apart
// with each move labelled; then a skeleton with the moves named and empty.
// "Write an email to your teacher" with none of that is a test, not a lesson —
// that belongs in Class practice and Mock, not here.

export function WritingModelPanel({ model }: { model: WritingModel }) {
  const { dict } = useI18n();
  const t = dict.writing;
  const [openPart, setOpenPart] = useState<number | null>(0);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {t.situation}
        </h3>
        <p className="mt-2 text-sm text-slate-700">{model.situation}</p>
      </section>

      {/* The whole thing first. You cannot analyse a shape you have not seen. */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          {t.workedExample}
        </h3>
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
          {model.example}
        </pre>
      </section>

      {/* Then the same text, labelled. Each part opens on its own so the
          learner reads one move at a time. */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          {t.howItIsBuilt}
        </h3>
        <ol className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {model.parts.map((part, i) => {
            const open = openPart === i;
            return (
              <li key={part.label}>
                <button
                  type="button"
                  onClick={() => setOpenPart(open ? null : i)}
                  className="w-full text-left p-4 hover:bg-slate-50"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400">{part.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{part.danish}</p>
                    </div>
                    <span aria-hidden className="text-slate-300 text-xs">
                      {open ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-2">
                    <p className="text-sm text-slate-600">{part.english}</p>
                    {part.note && <p className="text-sm text-blue-800">{part.note}</p>}
                    {part.alternatives && part.alternatives.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          {t.alternatives}
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {part.alternatives.map((alt) => (
                            <li key={alt} className="text-sm text-slate-700">
                              {alt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {model.template && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {t.template}
          </h3>
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-500 leading-relaxed">
            {model.template}
          </pre>
        </section>
      )}

      <section className="rounded-xl border-2 border-slate-900 bg-white p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          {t.checklist}
        </h3>
        <ul className="space-y-1">
          {model.checklist.map((item) => (
            <li key={item} className="text-sm text-slate-700 flex gap-2">
              <span aria-hidden className="text-slate-400">
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
