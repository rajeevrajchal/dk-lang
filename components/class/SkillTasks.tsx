import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { selectableTaskTypes } from "@/lib/exercises/registry";
import { TASK_NUMBER } from "@/lib/exercises/constants";
import { getServerDictionary } from "@/lib/i18n/server";
import type { ExerciseCategory } from "@/types";

// "Which task?" — the last step before practice.
//
// The task list comes from the module's own composition (module-tasks.ts), so
// Modul 2 speaking offers the mindmap and the information gap while Modul 3
// offers the prepared topic and the preference discussion. This is the screen
// that makes Class module-shaped rather than a generic drill.

export const SkillTasks = async ({
  category,
  skill,
  moduleId,
}: {
  category: ExerciseCategory;
  skill: string;
  moduleId: number;
}) => {
  const mod = MODULE_BY_ID.get(moduleId);
  if (!mod) notFound();

  const dict = await getServerDictionary();
  const t = dict.class2;
  const tasks = selectableTaskTypes(moduleId, category, llmGenerationAvailable());

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href={`/class/${skill}`} className="text-sm text-slate-500 hover:underline">
        {t.backToSkill}
      </Link>

      <div>
        <h1 className="text-xl font-semibold">
          {t.skills[category]} · {t.moduleLabel(moduleId)}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.skillDescriptions[category]}</p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">{t.unavailable}</p>
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {t.chooseTask}
          </h2>

          {/* The default: let the engine rotate, which is what practice did
              before task selection existed. */}
          <Link
            href={`/class/${skill}/${moduleId}/any`}
            className="block rounded-xl border-2 border-slate-900 bg-white p-5 hover:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="font-medium">{t.anyTask}</p>
              <span className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5">
                {dict.exercises.open}
              </span>
            </div>
          </Link>

          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {tasks.map((taskType) => {
              const number = TASK_NUMBER[taskType];
              return (
                <Link
                  key={taskType}
                  href={`/class/${skill}/${moduleId}/${taskType}`}
                  className="block p-5 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      {number != null && (
                        <p className="text-xs font-semibold text-slate-400">
                          {dict.exercises.opgaveLabel(number)}
                        </p>
                      )}
                      <p className="text-sm font-medium">
                        {dict.exercises.taskTypeNames[taskType] ?? taskType}
                      </p>
                    </div>
                    <span className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5">
                      {dict.exercises.open}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Reading also has the item-based adaptive drill, which is a different
          kind of practice: single questions that follow weak constructs rather
          than whole opgaver. Both are reading practice, so both live here. */}
      {category === "READING" && (
        <Link
          href={`/practice/reading/${moduleId}`}
          className="block rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
        >
          <p className="text-sm font-medium">{t.adaptiveDrill}</p>
          <p className="mt-1 text-xs text-slate-500">{t.adaptiveDrillDesc}</p>
        </Link>
      )}
    </div>
  );
};
