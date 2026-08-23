import Link from "next/link";
import { MODULES } from "@/lib/curriculum/modules";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import {
  categoryHasContent,
  moduleCategoryAvailable,
  selectableTaskTypes,
} from "@/lib/exercises/registry";
import { getServerDictionary } from "@/lib/i18n/server";
import type { ExerciseCategory } from "@/types";

// "Which module do you want to practise?" — one component, three skills.
//
// A module is offered when the engine can actually produce work for it: an
// authored variant exists, or the module declares a task composition the
// generator can write for. Offering a module with neither would be a dead end.

export const SkillModules = async ({
  category,
  skill,
  embedded = false,
}: {
  category: ExerciseCategory;
  /** URL segment: "reading" | "speaking" | "writing". */
  skill: string;
  /**
   * Rendered inside another page that has already said what this is. Drops
   * the back link, the heading and the page padding, keeping only the list.
   */
  embedded?: boolean;
}) => {
  const dict = await getServerDictionary();
  const t = dict.class2;
  const generation = llmGenerationAvailable();

  return (
    <div className={embedded ? "" : "max-w-3xl mx-auto p-6 sm:p-8 space-y-6"}>
      {!embedded && (
        <>
          <Link href="/class" className="text-sm text-slate-500 hover:underline">
            {t.backToClass}
          </Link>

          <div>
            <h1 className="text-xl font-semibold">{t.skills[category]}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.skillDescriptions[category]}</p>
          </div>
        </>
      )}

      <section>
        {!embedded && (
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t.chooseModule}
          </h2>
        )}
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {MODULES.filter((m) => !m.isOralOnly || category === "SPEAKING").map((mod) => {
            const available = moduleCategoryAvailable(mod.id, category, generation);
            const taskCount = selectableTaskTypes(mod.id, category, generation).length;
            const authored = categoryHasContent(mod.id, category);

            const body = (
              <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium">{t.moduleLabel(mod.id)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {available
                      ? `${taskCount} ${dict.class2.chooseTask.toLowerCase()}`
                      : t.unavailable}
                  </p>
                  {available && !authored && (
                    <p className="mt-1 text-xs text-slate-400">{t.generatedNote}</p>
                  )}
                </div>
                {available && (
                  <span className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5">
                    {dict.exercises.open}
                  </span>
                )}
              </div>
            );

            return available ? (
              <Link
                key={mod.id}
                href={`/class/${skill}/${mod.id}`}
                className="block hover:bg-slate-50"
              >
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
    </div>
  );
};
