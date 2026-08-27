import { READING_TASK1_VARIANTS } from "./reading-task1";
import { READING_TASK2_VARIANTS } from "./reading-task2";
import { READING_TASK3_VARIANTS } from "./reading-task3";
import { READING_TASK4_VARIANTS } from "./reading-task4";
import { WRITING_VARIANTS } from "./writing";
import { SPEAKING_VARIANTS, SPEAKING_OPGAVE_VARIANTS } from "./speaking";
import { isExplainable } from "./explainable";
import { orderedTaskTypes } from "./module-tasks";
import { TASK_NUMBER } from "./constants";
import type {
  ExerciseCategory,
  ExerciseVariant,
  HistoryEntry,
  PublicExercise,
  PublicExerciseContent,
  TaskType,
} from "@/types";

export const ALL_VARIANTS: ExerciseVariant[] = [
  ...READING_TASK1_VARIANTS,
  ...READING_TASK2_VARIANTS,
  ...READING_TASK3_VARIANTS,
  ...READING_TASK4_VARIANTS,
  ...WRITING_VARIANTS,
  ...SPEAKING_VARIANTS,
  ...SPEAKING_OPGAVE_VARIANTS,
];

export const VARIANT_BY_ID = new Map(ALL_VARIANTS.map((v) => [v.variantId, v]));

export const variantsFor = (moduleId: number, category: ExerciseCategory): ExerciseVariant[] => {
  return ALL_VARIANTS.filter((v) => v.moduleId === moduleId && v.category === category);
};

export const categoryHasContent = (moduleId: number, category: ExerciseCategory): boolean => {
  return variantsFor(moduleId, category).length > 0;
};

/**
 * Picks what to serve next.
 *
 * Two rotations, in this order:
 *  1. Task type — cycle through the category's task types so a reading session
 *     moves Opgave 1 → 2 → 3 → 4 rather than repeating one format. The type
 *     with the oldest (or no) completion wins.
 *  2. Variant — inside that type, prefer one this learner has never done. Only
 *     once every variant of the type is exhausted does the least-recently-done
 *     one come back, so content genuinely changes even when the format repeats.
 *
 * `isNew` reports whether the chosen variant has never been completed before.
 */
/**
 * The task type to serve next — the first of the two rotations, split out so
 * LLM generation can reuse it without needing an authored variant to exist.
 */
export const selectNextTaskType = (
  moduleId: number,
  category: ExerciseCategory,
  history: HistoryEntry[]
): TaskType | null => {
  // Every category is composed per module: Modul 2 reading runs Opgave 1-4,
  // Modul 2 speaking the mindmap and the information gap, Modul 3 speaking the
  // prepared topic and the picture preference. A module with no composition
  // for a category falls back to the category-wide list, which is what every
  // module did before modules were taken into account (see module-tasks.ts).
  const orderedTypes = orderedTaskTypes(moduleId, category).filter(
    (t) => t.startsWith("listening_") === false
  );
  if (orderedTypes.length === 0) return null;

  const typeLastDoneAt = new Map<string, number>();
  for (const h of history) {
    const t = h.completedAt ? h.completedAt.getTime() : 0;
    const prev = typeLastDoneAt.get(h.taskType);
    if (prev === undefined || t > prev) typeLastDoneAt.set(h.taskType, t);
  }

  return orderedTypes.reduce((best, t) => {
    const bestSeen = typeLastDoneAt.get(best) ?? -1;
    const tSeen = typeLastDoneAt.get(t) ?? -1;
    return tSeen < bestSeen ? t : best;
  }, orderedTypes[0]);
};

export const selectNextVariant = (
  moduleId: number,
  category: ExerciseCategory,
  history: HistoryEntry[]
): { variant: ExerciseVariant; isNew: boolean } | null => {
  const available = variantsFor(moduleId, category);
  if (available.length === 0) return null;

  const lastDoneAt = new Map<string, number>();
  for (const h of history) {
    const t = h.completedAt ? h.completedAt.getTime() : 0;
    const prev = lastDoneAt.get(h.variantId);
    if (prev === undefined || t > prev) lastDoneAt.set(h.variantId, t);
  }

  const typeLastDoneAt = new Map<string, number>();
  for (const h of history) {
    const t = h.completedAt ? h.completedAt.getTime() : 0;
    const prev = typeLastDoneAt.get(h.taskType);
    if (prev === undefined || t > prev) typeLastDoneAt.set(h.taskType, t);
  }

  // Task types that actually have variants authored, in test order. The
  // module's own composition comes first, so the authored fallback serves the
  // same opgaver the generator would — otherwise a learner without an API key
  // would get Modul 2's general prompts instead of its opgaver.
  const orderedTypes = orderedTaskTypes(moduleId, category).filter((t) =>
    available.some((v) => v.taskType === t)
  );
  if (orderedTypes.length === 0) return null;

  const nextType = orderedTypes.reduce((best, t) => {
    const bestSeen = typeLastDoneAt.get(best) ?? -1;
    const tSeen = typeLastDoneAt.get(t) ?? -1;
    return tSeen < bestSeen ? t : best;
  }, orderedTypes[0]);

  const ofType = available.filter((v) => v.taskType === nextType);
  const unseen = ofType.filter((v) => !lastDoneAt.has(v.variantId));

  if (unseen.length > 0) {
    return { variant: unseen[0], isNew: true };
  }

  const leastRecent = ofType.reduce((best, v) =>
    (lastDoneAt.get(v.variantId) ?? 0) < (lastDoneAt.get(best.variantId) ?? 0) ? v : best
  );
  return { variant: leastRecent, isNew: false };
};

/**
 * Strips everything the learner must not see while working: answer keys,
 * rationales and the `why` notes. Mirrors how Item.answerJson never reaches
 * the client until /api/attempts grades it.
 */
export const toPublicExercise = (
  variant: ExerciseVariant,
  attemptId: string,
  isNew: boolean
): PublicExercise => {
  const c = variant.content;
  let content: PublicExerciseContent;

  switch (c.kind) {
    case "reading_task_1_matching": {
      const { answers: _a, rationales: _r, ...rest } = c;
      void _a;
      void _r;
      content = rest;
      break;
    }
    case "reading_task_2_wrong_sentence": {
      content = {
        kind: c.kind,
        textTitle: c.textTitle,
        // The example stays solved — it is shown worked, as in the real test.
        example: c.example,
        sections: c.sections.map((s) => ({ id: s.id, sentences: s.sentences })),
      };
      break;
    }
    case "reading_task_3_missing_words": {
      const { answers: _a, rationales: _r, ...rest } = c;
      void _a;
      void _r;
      content = rest;
      break;
    }
    case "reading_task_4_people_matching": {
      content = {
        kind: c.kind,
        heading: c.heading,
        people: c.people,
        example: c.example,
        questions: c.questions.map((q) => ({ id: q.id, question: q.question })),
      };
      break;
    }
    default:
      // Writing and speaking carry no answer key.
      content = c;
  }

  return {
    attemptId,
    variantId: variant.variantId,
    category: variant.category,
    taskType: variant.taskType,
    taskNumber: TASK_NUMBER[variant.taskType],
    topic: variant.topic,
    title: variant.title,
    instruction: variant.instruction,
    difficulty: variant.difficulty,
    isNew,
    explainable: isExplainable(variant),
    content,
  };
};

/**
 * Picks one authored variant of a given task type, preferring one the learner
 * hasn't sat. Used to assemble a mock test when generation is unavailable, and
 * as the per-slot fallback when a generation fails.
 */
export const pickAuthoredVariantOfType = (
  moduleId: number,
  taskType: TaskType,
  history: HistoryEntry[]
): ExerciseVariant | null => {
  const ofType = ALL_VARIANTS.filter(
    (v) => v.moduleId === moduleId && v.taskType === taskType
  );
  if (ofType.length === 0) return null;

  const lastDoneAt = new Map<string, number>();
  for (const h of history) {
    const t = h.completedAt ? h.completedAt.getTime() : 0;
    const prev = lastDoneAt.get(h.variantId);
    if (prev === undefined || t > prev) lastDoneAt.set(h.variantId, t);
  }

  const unseen = ofType.filter((v) => !lastDoneAt.has(v.variantId));
  if (unseen.length > 0) return unseen[0];

  return ofType.reduce((best, v) =>
    (lastDoneAt.get(v.variantId) ?? 0) < (lastDoneAt.get(best.variantId) ?? 0) ? v : best
  );
};

/** How many answers an exercise expects — used for progress display. */
export const answerCount = (variant: ExerciseVariant): number => {
  const c = variant.content;
  switch (c.kind) {
    case "reading_task_1_matching":
      return c.people.length;
    case "reading_task_2_wrong_sentence":
      return c.sections.length;
    case "reading_task_3_missing_words":
      return c.answers.length;
    case "reading_task_4_people_matching":
      return c.questions.length;
    default:
      return 0;
  }
};

/**
 * The task types a learner can choose from in Class for this module and
 * category: the module's composition, minus anything with neither an authored
 * variant nor a generator prompt. Used to build the "pick a task" screen —
 * offering a task the engine cannot produce would be a dead end.
 */
export const selectableTaskTypes = (
  moduleId: number,
  category: ExerciseCategory,
  generationAvailable: boolean
): TaskType[] => {
  const authored = variantsFor(moduleId, category);
  return orderedTaskTypes(moduleId, category).filter((t) => {
    if (t.startsWith("listening_")) return false;
    if (authored.some((v) => v.taskType === t)) return true;
    return generationAvailable;
  });
};

/**
 * Whether Class can offer this module/category at all — either something is
 * authored, or the module declares a composition the generator can write for.
 */
export const moduleCategoryAvailable = (
  moduleId: number,
  category: ExerciseCategory,
  generationAvailable: boolean
): boolean => {
  return selectableTaskTypes(moduleId, category, generationAvailable).length > 0;
};

export { TASK_NUMBER };
