import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserLevel } from "@/lib/level";
import { tasks as tasksRepo } from "@/lib/repositories";
import { moduleFor } from "@/lib/tasks/module";
import {
  CATEGORIES,
  TASKS_PER_TYPE,
  practiceTypesFor,
} from "@/lib/tasks/catalogue";
import { LevelNote } from "@/components/tasks/LevelNote";
import { getServerDictionary } from "@/lib/i18n/server";

// Class — what would you like to practise?
//
// Category first, and the practice types are on this page rather than behind
// it: the learner's real question is "fill in the blanks or odd one out?", and
// making them click into Reading to find that out adds a step that answers
// nothing.
//
// What is NOT here is the module. It used to be the first question — choose a
// skill, then choose Modul 1–5, then choose a task — and a learner who has
// already told the app their level at onboarding was being asked a third time
// to reach an exercise. The module now comes from the profile and appears once,
// as a footnote, with a link to change it.

const ClassPage = async () => {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.class2;

  const level = await getUserLevel(session!.user.id);
  const moduleId = moduleFor(level.currentModule);

  // Progress for every ladder the learner has, in two queries rather than one
  // per practice type: their own progress rows, and the slots that have been
  // materialised so far.
  const progress = await tasksRepo.allProgress(session!.user.id);
  const completedTaskIds = new Set(
    progress.filter((p) => p.status === "COMPLETED").map((p) => p.taskId)
  );

  const sections = await Promise.all(
    CATEGORIES.map(async (category) => {
      const types = practiceTypesFor(moduleId, category.key);
      const counts = await Promise.all(
        types.map(async (type) => {
          const slots = await tasksRepo.listTasks(moduleId, category.key, type.taskType);
          return slots.filter((s) => completedTaskIds.has(s.id)).length;
        })
      );
      return { category, types, counts };
    })
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 sm:p-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose what you want to practise, then pick a task. Everything is set for your level
          already.
        </p>
      </header>

      {sections.map(({ category, types, counts }) => (
        <section key={category.key}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              <span aria-hidden className="mr-2">
                {category.icon}
              </span>
              {category.label}
            </h2>
            {types.length > 0 && (
              <Link
                href={`/class/${category.slug}`}
                className="text-xs font-medium text-slate-500 hover:underline"
              >
                Open {category.label.toLowerCase()} →
              </Link>
            )}
          </div>

          {types.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
              <p className="text-sm text-slate-500">
                {category.key === "LISTENING"
                  ? "Listening needs recorded audio, which does not exist yet."
                  : "Nothing of this kind at your current level."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {types.map((type, i) => {
                const done = counts[i];
                const pct = Math.round((done / TASKS_PER_TYPE) * 100);
                return (
                  <Link
                    key={type.taskType}
                    href={`/class/${category.slug}/${type.slug}`}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">{type.label}</p>
                      {type.opgaveNumber != null && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Opgave {type.opgaveNumber}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{type.description}</p>
                    <div className="mt-auto pt-4">
                      <p className="text-xs font-medium text-slate-700">
                        {done} / {TASKS_PER_TYPE} tasks
                      </p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-600">{t.vsLessons}</p>
        <Link
          href="/lessons"
          className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
        >
          {dict.nav.lessons} →
        </Link>
      </div>

      <LevelNote level={level} />
    </div>
  );
};

export default ClassPage;
