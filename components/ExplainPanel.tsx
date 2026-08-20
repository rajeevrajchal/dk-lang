"use client";

import { useState } from "react";
import Link from "next/link";
import { GLOSSARY_BY_PASSAGE_ID } from "@/lib/content-gen/modul2-glossary";
import { SENTENCES_BY_PASSAGE_ID } from "@/lib/content-gen/modul2-sentences";
import { THEORY_BY_CONSTRUCT } from "@/lib/content-gen/theory";
import { CONSTRUCTS } from "@/lib/content-gen/constructs";
import { useI18n } from "@/lib/i18n/LocaleProvider";

function constructName(code: string): string {
  return CONSTRUCTS.find((c) => c.code === code)?.name ?? code;
}

export function ExplainPanel({
  passageId,
  moduleId,
}: {
  passageId: string | null;
  moduleId: number;
}) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);

  const glossary = passageId ? GLOSSARY_BY_PASSAGE_ID.get(passageId) : undefined;
  const sentences = passageId ? SENTENCES_BY_PASSAGE_ID.get(passageId) : undefined;

  // Nothing authored for this passage — don't advertise a button that opens
  // an empty panel.
  if (!glossary && !sentences) return null;

  // Every construct demonstrated anywhere in the passage, de-duplicated, in
  // first-appearance order.
  const codes = [...new Set((sentences ?? []).flatMap((s) => s.constructCodes))];

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
      >
        {open ? dict.explain.hide : dict.explain.show}
      </button>

      {open && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 space-y-6">
          <div>
            <h3 className="font-semibold">{dict.explain.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{dict.explain.intro}</p>
          </div>

          {glossary && (
            <section>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                {dict.explain.wholeText}
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">{glossary.englishSummary}</p>
            </section>
          )}

          {sentences && sentences.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {dict.explain.sentenceBreakdown}
              </h4>
              <ol className="space-y-4">
                {sentences.map((s, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">{s.danish}</p>
                    <p className="mt-1 text-sm text-slate-600">{s.english}</p>
                    <p className="mt-2 text-xs text-blue-800">
                      <span className="font-semibold">{dict.explain.structureLabel}: </span>
                      {s.structureNote}
                    </p>
                    {s.constructCodes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.constructCodes.map((code) => (
                          <span
                            key={code}
                            className="text-[11px] rounded-full border border-slate-300 bg-white px-2 py-0.5 text-slate-500"
                          >
                            {constructName(code)}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {glossary && glossary.words.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {dict.explain.wordByWord}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-medium text-slate-500 py-2 pr-4">
                        {dict.explain.colWord}
                      </th>
                      <th className="text-left font-medium text-slate-500 py-2 pr-4">
                        {dict.explain.colMeaning}
                      </th>
                      <th className="text-left font-medium text-slate-500 py-2 pr-4 whitespace-nowrap">
                        {dict.explain.colDictionary}
                      </th>
                      <th className="text-left font-medium text-slate-500 py-2">
                        {dict.explain.colHow}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {glossary.words.map((w, i) => (
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
          )}

          {codes.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {dict.explain.grammarAtPlay}
              </h4>
              <div className="space-y-2">
                {codes.map((code) => {
                  const lesson = THEORY_BY_CONSTRUCT.get(code);
                  return (
                    <div
                      key={code}
                      className="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-slate-200 px-4 py-2.5"
                    >
                      <span className="text-sm text-slate-700">{constructName(code)}</span>
                      {lesson && (
                        <Link
                          href={`/class/${moduleId}/theory/${lesson.slug}`}
                          className="text-xs font-medium text-slate-600 hover:underline whitespace-nowrap"
                        >
                          {dict.explain.openLesson}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
