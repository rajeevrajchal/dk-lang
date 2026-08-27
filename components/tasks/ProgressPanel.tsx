import Link from "next/link";
import { history } from "@/lib/repositories";
import { practiceProgress, recommendNext, weakPracticeTypes } from "@/lib/tasks/progress";
import { EmptyState } from "@/components/ui/states";
import { TOPIC_LABELS } from "@/lib/learning/topics";
import type { GrammarTopic } from "@/types";

// "Your progress" — the Dashboard's answer to what the learner has actually
// done, replacing the module grid that used to be here.
//
// The old dashboard showed Modul 1–5 with a status each, which told a learner
// where they were in an administrative ladder they did not choose. This shows
// where they are in the work: which ladders they have climbed, what they keep
// getting wrong, and what to open next — all of it derived from their own
// scores, none of it asserted.

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;

export const ProgressPanel = async ({
  userId,
  moduleId,
}: {
  userId: string;
  moduleId: number;
}) => {
  const categories = await practiceProgress(userId, moduleId);
  const next = recommendNext(categories);
  const weak = weakPracticeTypes(categories);
  const recentMistakes = await history.listMistakes(userId, { status: "open", limit: 4 });

  const withContent = categories.filter((c) => c.types.length > 0);
  const anythingDone = withContent.some((c) => c.completed > 0);

  return (
    <div className="space-y-6">
      {next && (
        <section className="rounded-xl border-2 border-slate-900 bg-slate-900 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Practise next
          </p>
          <p className="mt-1.5 text-lg font-semibold">{next.practiceType.label}</p>
          <p className="mt-1 text-sm text-slate-300">{next.reason}</p>
          <Link
            href={next.href}
            className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Open the task list
          </Link>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your progress
          </h2>
          <Link href="/class" className="text-xs text-slate-500 hover:underline">
            Class →
          </Link>
        </div>

        {!anythingDone ? (
          <EmptyState
            title="Nothing practised yet"
            body="Every practice type has fifty tasks. Finish one and it will show up here with your score."
            action={
              <Link
                href="/class"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Choose something to practise
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {withContent.map((category) => (
              <div key={category.category} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium text-slate-900">
                    <span aria-hidden className="mr-2">
                      {category.icon}
                    </span>
                    {category.label}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {category.completed} / {category.total}
                  </span>
                </div>

                <ul className="mt-3 space-y-2.5">
                  {category.types.map((type) => {
                    const pct = Math.round((type.completed / type.total) * 100);
                    return (
                      <li key={type.practiceType.taskType}>
                        <Link
                          href={`/class/${category.slug}/${type.practiceType.slug}`}
                          className="group flex items-baseline justify-between gap-3"
                        >
                          <span className="text-sm text-slate-700 group-hover:underline">
                            {type.practiceType.label}
                          </span>
                          <span className="whitespace-nowrap text-sm text-slate-500">
                            {type.completed} / {type.total}
                            {type.accuracy !== null && (
                              <span
                                className={`ml-2 text-xs font-medium ${
                                  type.accuracy >= 0.8
                                    ? "text-emerald-700"
                                    : type.accuracy >= 0.6
                                      ? "text-slate-500"
                                      : "text-amber-700"
                                }`}
                              >
                                {Math.round(type.accuracy * 100)}%
                              </span>
                            )}
                          </span>
                        </Link>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Weakest practice types
          </h2>
          {weak.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              Nothing stands out yet — finish a few more tasks and this will fill in.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weak.slice(0, 4).map((t) => (
                <li key={t.practiceType.taskType} className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/class/${t.category.toLowerCase()}/${t.practiceType.slug}`}
                    className="text-sm text-slate-700 hover:underline"
                  >
                    {t.practiceType.label}
                  </Link>
                  <span className="text-sm font-medium text-amber-700">
                    {Math.round((t.accuracy ?? 0) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent mistakes
            </h2>
            <Link href="/mistakes" className="text-xs text-slate-500 hover:underline">
              All →
            </Link>
          </div>
          {recentMistakes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nothing outstanding.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentMistakes.map((m) => (
                <li key={m.id} className="text-sm">
                  <p className="line-clamp-1 text-slate-700">{m.questionText}</p>
                  <p className="text-[11px] text-slate-400">
                    {m.grammarTopic
                      ? m.source === "VERB"
                        ? `at ${m.grammarTopic}`
                        : (TOPIC_LABELS[m.grammarTopic as GrammarTopic] ?? m.grammarTopic)
                      : ""}
                    {fmtDate(m.lastWrongAt) ? ` · ${fmtDate(m.lastWrongAt)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
