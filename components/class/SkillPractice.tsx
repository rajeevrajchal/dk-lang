import { notFound } from "next/navigation";
import { ExerciseRunner } from "@/components/exercises/ExerciseRunner";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { moduleUsesTaskType } from "@/lib/exercises/module-tasks";
import { TASK_TYPES, type ExerciseCategory, type TaskType } from "@/lib/exercises/types";
import { getServerDictionary } from "@/lib/i18n/server";

/**
 * Runs Class practice for one module, optionally pinned to one task type.
 *
 * "any" means the engine rotates through the module's task types — the
 * behaviour /opgaver always had. A named task type is checked against the
 * module's composition here as well as in the API, so a hand-typed URL for a
 * task the module does not examine 404s rather than silently drifting.
 */
export async function SkillPractice({
  category,
  moduleId,
  task,
  skill,
}: {
  category: ExerciseCategory;
  moduleId: number;
  task: string;
  skill: string;
}) {
  const dict = await getServerDictionary();

  let taskType: TaskType | undefined;
  if (task !== "any") {
    if (!(TASK_TYPES as readonly string[]).includes(task)) notFound();
    taskType = task as TaskType;
    if (!moduleUsesTaskType(moduleId, category, taskType)) notFound();
  }

  return (
    <ExerciseRunner
      moduleId={moduleId}
      category={category}
      taskType={taskType}
      generationEnabled={llmGenerationAvailable()}
      backHref={`/class/${skill}/${moduleId}`}
      backLabel={dict.class2.backToSkill}
    />
  );
}
