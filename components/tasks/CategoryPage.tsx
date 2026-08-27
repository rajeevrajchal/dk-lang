import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserLevel } from "@/lib/level";
import { tasks as tasksRepo } from "@/lib/repositories";
import { moduleFor } from "@/lib/tasks/module";
import {
  CATEGORY_BY_KEY,
  TASKS_PER_TYPE,
  practiceTypesFor,
} from "@/lib/tasks/catalogue";
import { EmptyState } from "@/components/ui/states";
import { LevelNote } from "./LevelNote";
import type { ExerciseCategory } from "@/types";

// One category's practice types — "what kind of Reading?".
//
// One component for all four categories. Reading, Writing, Speaking and
// Listening differ in which practice types they offer and in nothing else, and
// that difference is data (lib/tasks/catalogue.ts), so four copies of this
// page would be four places to fix the same bug.
//
// There is no module step. Which practice types appear still depends on the
// learner's module — Modul 2 speaking is not Modul 3 speaking — but the module
// is read from their profile, shown as a note, and never asked for.

export const CategoryPage = async ({
  category,
  children,
}: {
  category: ExerciseCategory;
  /** Rendered above the practice types — the reading library card lives here. */
  children?: React.ReactNode;
}) => {
  const session = await auth();
  const definition = CATEGORY_BY_KEY.get(category)!;
  const level = await getUserLevel(session!.user.id);
  const moduleId = moduleFor(level.currentModule);

  const types = practiceTypesFor(moduleId, category);

  // How far through each ladder this learner is. One query for every practice
  // type in the category rather than one per type: the counts come from the
  // learner's own progress rows, which are few.
  const progress = await tasksRepo.allProgress(session!.user.id);
  const materialised = await Promise.all(
    types.map((t) => tasksRepo.listTasks(moduleId, category, t.taskType))
  );
  const completedByType = new Map<string, number>();
  types.forEach((type, i) => {
    const ids = new Set(materialised[i].map((t) => t.id));
    completedByType.set(
      type.taskType,
      progress.filter((p) => ids.has(p.taskId) && p.status === "COMPLETED").length
    );
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
      <Link href="/class" className="text-sm text-slate-500 hover:underline">
        ← Class
      </Link>

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          <span aria-hidden className="mr-2">
            {definition.icon}
          </span>
          {definition.label}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{definition.description}</p>
      </header>

      {children}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Choose a practice type
        </h2>

        {types.length === 0 ? (
          <EmptyState
            title={`No ${definition.label.toLowerCase()} practice yet`}
            body={
              category === "LISTENING"
                ? "Listening needs recorded audio, which does not exist yet. Text pretending to be audio would not rehearse listening, so none is offered."
                : "There is no practice of this kind at your current level."
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {types.map((type) => {
              const done = completedByType.get(type.taskType) ?? 0;
              const pct = Math.round((done / TASKS_PER_TYPE) * 100);
              return (
                <Link
                  key={type.taskType}
                  href={`/class/${definition.slug}/${type.slug}`}
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

      <LevelNote level={level} />
    </div>
  );
};
