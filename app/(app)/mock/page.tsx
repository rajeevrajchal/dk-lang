import Link from "next/link";
import { auth } from "@/lib/auth";
import { MODULES } from "@/lib/curriculum/modules";
import { getMockHistory } from "@/lib/activity";
import { categoryHasContent } from "@/lib/exercises/registry";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { getServerDictionary } from "@/lib/i18n/server";

// Mock — the closest simulation of the real modultest the app can offer.
//
// Deliberately austere next to Class: pick a test, sit it, get a result. The
// teaching happens in Lessons and the coaching in Class; this area's job is to
// behave like the exam.

function fmtDate(d: Date | null) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
}

export default async function MockPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.mock;
  const history = await getMockHistory(session!.user.id);
  const generation = llmGenerationAvailable();

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.chooseTest}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {MODULES.filter((m) => !m.isOralOnly).map((mod) => {
            // A full mock needs the four reading opgaver plus a writing task —
            // either authored, or generatable for a module with a declared
            // composition.
            const available =
              generation ||
              (categoryHasContent(mod.id, "READING") && categoryHasContent(mod.id, "WRITING"));

            const body = (
              <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium">{t.moduleLabel(mod.id)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {available ? mod.cefrGoal : t.unavailable}
                  </p>
                </div>
                {available && (
                  <span className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5">
                    {dict.mockTest.start}
                  </span>
                )}
              </div>
            );

            return available ? (
              <Link key={mod.id} href={`/mock/${mod.id}`} className="block hover:bg-slate-50">
                {body}
              </Link>
            ) : (
              <div key={mod.id} className="opacity-50">
                {body}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.history}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          {history.recent.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">{t.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.recent.map((s) => (
                <li key={s.id} className="p-4 px-5 flex items-center justify-between text-sm gap-3">
                  <span>
                    {t.historyRow(s.moduleId)}
                    <span className="ml-2 text-xs text-slate-400">{fmtDate(s.completedAt)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">
                      {s.readingScore == null ? "—" : `${Math.round(s.readingScore * 100)}%`}
                    </span>
                    {s.passed != null && (
                      <span
                        className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                          s.passed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.passed ? dict.mockTest.passed : dict.mockTest.notPassed}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Not a hint about the current test — a statement about what this area
          is, so nobody comes here expecting practice. */}
      <p className="text-xs text-slate-500">{t.notPractice}</p>
    </div>
  );
}
