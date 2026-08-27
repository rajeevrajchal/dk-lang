import Link from "next/link";
import { auth } from "@/lib/auth";
import { getMockHistory } from "@/lib/activity";
import { getUserLevel } from "@/lib/level";
import { moduleFor } from "@/lib/tasks/module";
import { tasks as tasksRepo } from "@/lib/repositories";
import { CATEGORIES, practiceTypesFor } from "@/lib/tasks/catalogue";
import { LevelNote } from "@/components/tasks/LevelNote";
import { getServerDictionary } from "@/lib/i18n/server";
import type { ExerciseCategory } from "@/types";

// Mock — the closest simulation of the real modultest the app can offer.
//
// Numbered tests per section, and no module step. A mock test simulates the
// test the learner is actually preparing for, and which one that is was
// answered at onboarding; being asked again on the way to a simulation was the
// same redundant question Class used to ask.
//
// The numbering matters more here than in Class: Test 7 is the SAME test every
// time, so sitting it twice is a measurement rather than two unrelated papers.
// The unnumbered full test is kept for "am I ready?", which is a different
// question from "have I improved?".

// How many numbered tests to offer per section. The same fifty as the task
// ladders, because a section test IS task N of each of that section's ladders.
const TESTS_SHOWN = 12;

const fmtDate = (d: Date | null) => {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
};

const MockPage = async () => {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.mock;

  const [level, history, progress] = await Promise.all([
    getUserLevel(session!.user.id),
    getMockHistory(session!.user.id),
    tasksRepo.allProgress(session!.user.id),
  ]);
  const moduleId = moduleFor(level.currentModule);
  const completedTaskIds = new Set(
    progress.filter((p) => p.status === "COMPLETED").map((p) => p.taskId)
  );

  // A section can be simulated when it has practice types at this level. Which
  // tasks the learner has already met is shown on the card, because sitting a
  // test made of tasks you have already practised is a different exercise from
  // sitting a fresh one, and the learner should be able to tell.
  const sections = await Promise.all(
    CATEGORIES.map(async (category) => {
      const types = practiceTypesFor(moduleId, category.key as ExerciseCategory);
      if (types.length === 0) return { category, types, practisedByNumber: new Set<number>() };

      const slots = await Promise.all(
        types.map((type) => tasksRepo.listTasks(moduleId, category.key, type.taskType))
      );
      // A test number counts as practised when every part of it has been done.
      const practisedByNumber = new Set<number>();
      for (let n = 1; n <= TESTS_SHOWN; n++) {
        const parts = slots.map((s) => s.find((task) => task.taskNumber === n));
        if (parts.every((p) => p && completedTaskIds.has(p.id))) practisedByNumber.add(n);
      }
      return { category, types, practisedByNumber };
    })
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 sm:p-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
      </header>

      <Link
        href="/mock/full"
        className="block rounded-xl border-2 border-slate-900 bg-white p-6 hover:bg-slate-50"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{t.fullTest}</p>
            <p className="mt-1 text-sm text-slate-600">{t.fullTestDesc}</p>
            <p className="mt-2 text-xs text-slate-400">
              Assembled fresh each time — for &ldquo;am I ready?&rdquo; rather than &ldquo;have I
              improved?&rdquo;
            </p>
          </div>
          <span className="whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
            {dict.mockTest.start}
          </span>
        </div>
      </Link>

      {sections.map(({ category, types, practisedByNumber }) => (
        <section key={category.key}>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              <span aria-hidden className="mr-2">
                {category.icon}
              </span>
              {category.label}
            </h2>
            {types.length > 0 && (
              <p className="text-xs text-slate-400">
                {types.length} part{types.length === 1 ? "" : "s"} per test
              </p>
            )}
          </div>

          {types.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
              <p className="text-sm text-slate-500">
                {category.key === "LISTENING"
                  ? "Listening needs recorded audio, which does not exist yet."
                  : "No test of this kind at your current level."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Array.from({ length: TESTS_SHOWN }, (_, i) => i + 1).map((n) => {
                const practised = practisedByNumber.has(n);
                return (
                  <Link
                    key={n}
                    href={`/mock/${category.slug}/${n}`}
                    className={`rounded-lg border p-3 text-center transition ${
                      practised
                        ? "border-slate-300 bg-slate-50 hover:bg-slate-100"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-medium text-slate-900">Test {n}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-slate-400">
                      {practised ? "Practised" : "Unseen"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ))}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.history}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          {history.recent.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">{t.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 p-4 px-5 text-sm">
                  <span>
                    Mock test
                    <span className="ml-2 text-xs text-slate-400">{fmtDate(s.completedAt)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">
                      {s.readingScore == null ? "—" : `${Math.round(s.readingScore * 100)}%`}
                    </span>
                    {s.passed != null && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
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

      <LevelNote level={level} />
    </div>
  );
};

export default MockPage;
