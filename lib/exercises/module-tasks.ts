import { speakingTasksForModule } from "./speaking-patterns";
import { TASK_TYPES_BY_CATEGORY } from "./constants";
import type { ExerciseCategory, TaskType } from "@/types";

// Which task types each module is examined with, per category.
//
// This generalises what speaking-patterns.ts already did for Tale: a module is
// COMPOSED FROM task types rather than being one. Reading and writing now go
// through the same mechanism, which is what stops Class reading practice
// degenerating into a generic "read this paragraph and answer a question" —
// Modul 2 reading rehearses Opgave 1–4 of the real modultest because that is
// what Modul 2 reading IS.
//
// A module with no entry for a category falls back to the category-wide list
// in constants.ts, which is exactly what every module did before this file
// existed. Nothing regresses; modules whose real structure we have not
// verified simply keep the old behaviour rather than getting an invented one.

/**
 * Reading composition. Modul 2 and Modul 3 both run the four Læsning opgaver
 * in test order. They are listed separately rather than shared so a later
 * correction to one module cannot silently change the other.
 */
const READING_TASKS_BY_MODULE: Record<number, TaskType[]> = {
  2: [
    "reading_task_1_matching",
    "reading_task_2_wrong_sentence",
    "reading_task_3_missing_words",
    "reading_task_4_people_matching",
  ],
  3: [
    "reading_task_1_matching",
    "reading_task_2_wrong_sentence",
    "reading_task_3_missing_words",
    "reading_task_4_people_matching",
  ],
};

/**
 * Writing composition. Modul 2's Skrivning is an email reply plus shorter
 * written messages; Modul 3 asks for a longer connected text alongside the
 * email.
 */
const WRITING_TASKS_BY_MODULE: Record<number, TaskType[]> = {
  2: ["writing_email", "writing_message"],
  3: ["writing_email", "writing_short_text"],
};

/**
 * The task types module `moduleId` uses for `category`, or null when the
 * module has no declared composition and the category-wide list applies.
 *
 * Speaking delegates to speaking-patterns.ts so there is one definition of the
 * speaking composition, not two.
 */
export const tasksForModule = (
  moduleId: number,
  category: ExerciseCategory
): TaskType[] | null => {
  switch (category) {
    case "SPEAKING":
      return speakingTasksForModule(moduleId);
    case "READING":
      return READING_TASKS_BY_MODULE[moduleId] ?? null;
    case "WRITING":
      return WRITING_TASKS_BY_MODULE[moduleId] ?? null;
    default:
      // Listening has no module compositions because it has no content — see
      // the note in constants.ts.
      return null;
  }
};

/**
 * The ordered task types to serve for a module/category: the module's own
 * composition where one exists, otherwise the category-wide list.
 */
export const orderedTaskTypes = (
  moduleId: number,
  category: ExerciseCategory
): TaskType[] => {
  return tasksForModule(moduleId, category) ?? TASK_TYPES_BY_CATEGORY[category];
};

/** Whether a task type is one this module actually examines. */
export const moduleUsesTaskType = (
  moduleId: number,
  category: ExerciseCategory,
  taskType: TaskType
): boolean => {
  return orderedTaskTypes(moduleId, category).includes(taskType);
};
