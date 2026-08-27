import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserLevel } from "@/lib/level";
import { moduleFor } from "@/lib/tasks/module";
import { CATEGORY_BY_KEY, practiceTypeBySlug } from "@/lib/tasks/catalogue";
import { taskList } from "@/lib/tasks/service";
import { TaskGrid } from "./TaskGrid";
import { LevelNote } from "./LevelNote";
import { SideNotes } from "@/components/ui/SideNotes";
import type { ExerciseCategory } from "@/types";

// The fifty tasks of one practice type.
//
// One component for every category and every practice type. The only thing
// that varies is which ladder is being shown, and that is two arguments.

export const TaskListPage = async ({
  category,
  practiceTypeSlug,
}: {
  category: ExerciseCategory;
  practiceTypeSlug: string;
}) => {
  const session = await auth();
  const definition = CATEGORY_BY_KEY.get(category)!;
  const type = practiceTypeBySlug(category, practiceTypeSlug);
  if (!type) notFound();

  const level = await getUserLevel(session!.user.id);
  const moduleId = moduleFor(level.currentModule);

  const summary = await taskList(session!.user.id, moduleId, category, type.taskType);
  if (!summary) notFound();

  const basePath = `/class/${definition.slug}/${type.slug}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
      <Link
        href={`/class/${definition.slug}`}
        className="text-sm text-slate-500 hover:underline"
      >
        ← {definition.label}
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {definition.label}
          </span>
          {type.opgaveNumber != null && (
            <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-500">
              Opgave {type.opgaveNumber} in the real test
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">{type.label}</h1>
        <p className="mt-1 text-sm text-slate-600">{type.description}</p>
      </header>

      <SideNotes context={{ taskType: type.taskType }} title="How this task works" />

      <TaskGrid summary={summary} basePath={basePath} />

      <LevelNote level={level} />
    </div>
  );
};
