import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { THEORY_BY_SLUG } from "@/lib/content-gen/theory";
import { CONSTRUCTS } from "@/lib/content-gen/constructs";
import { hasContent } from "@/lib/dashboard";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function TheoryLessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; slug: string }>;
}) {
  const { moduleId, slug } = await params;
  const moduleIdNum = Number(moduleId);

  const mod = MODULE_BY_ID.get(moduleIdNum);
  const lesson = THEORY_BY_SLUG.get(slug);
  const dict = await getServerDictionary();
  if (!mod || !lesson) notFound();

  const taught = lesson.constructCodes
    .map((code) => CONSTRUCTS.find((c) => c.code === code))
    .filter((c): c is (typeof CONSTRUCTS)[number] => !!c);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
      <Link
        href={`/class/${moduleIdNum}/theory`}
        className="text-sm text-slate-500 hover:underline"
      >
        {dict.theory.backToTheory}
      </Link>

      <header>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium rounded-full bg-slate-900 text-white px-2.5 py-1">
            {dict.theory.tierLabel(lesson.tier)}
          </span>
          <span className="text-xs text-slate-400">{lesson.danishName}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{lesson.title}</h1>
        <p className="mt-2 text-slate-600">{lesson.summary}</p>
      </header>

      {lesson.sections.map((section, i) => (
        <section key={i} className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">{section.heading}</h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{section.body}</p>

          {section.table && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    {section.table.headers.map((h) => (
                      <th
                        key={h}
                        className="text-left font-medium text-slate-500 py-2 pr-4 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-100 last:border-0">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`py-2 pr-4 align-top ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.examples && section.examples.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {dict.theory.examples}
              </p>
              {section.examples.map((ex, ei) => (
                <div key={ei} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{ex.danish}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{ex.english}</p>
                  {ex.note && <p className="mt-1 text-xs text-blue-700">{ex.note}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {lesson.pitfalls.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">{dict.theory.watchOut}</h2>
          <ul className="mt-3 space-y-2">
            {lesson.pitfalls.map((p, i) => (
              <li key={i} className="text-sm text-amber-900 flex gap-2">
                <span aria-hidden>·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex items-center justify-between flex-wrap gap-3 border-t border-slate-200 pt-6">
        <div className="text-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {dict.theory.teaches}
          </p>
          {taught.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {taught.map((c) => (
                <span
                  key={c.code}
                  className="text-xs rounded-full border border-slate-200 px-2.5 py-1 text-slate-600"
                >
                  {c.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">{dict.theory.notTestedYet}</p>
          )}
        </div>

        {hasContent(moduleIdNum, "READING") && (
          <Link
            href={`/practice/reading/${moduleIdNum}`}
            className="text-sm font-medium rounded-md bg-slate-900 text-white px-4 py-2"
          >
            {dict.theory.relatedPractice}
          </Link>
        )}
      </section>
    </div>
  );
}
