import "server-only";

import { tasks as tasksRepo } from "@/lib/repositories";
import {
  CATEGORIES,
  TASKS_PER_TYPE,
  categorySlug,
  practiceTypesFor,
} from "./catalogue";
import type {
  CategoryProgress,
  ExerciseCategory,
  PracticeTypeProgress,
  RecommendedTask,
} from "@/types";

// How far through the ladders this learner is.
//
// The dashboard's question — "Reading: fill in the blanks 12/50" — needs one
// number per practice type, and answering it naively would be one query per
// ladder per page load. Instead this reads the learner's own progress rows
// once and the materialised slots once per ladder, then counts in memory.
//
// Accuracy is computed from the BEST score of each completed task rather than
// the latest. A learner who has gone back and improved a task should see that
// reflected; showing the latest would let one careless re-run erase evidence
// of a skill they have.

export const practiceProgress = async (
  userId: string,
  moduleId: number
): Promise<CategoryProgress[]> => {
  const progress = await tasksRepo.allProgress(userId);
  const byTaskId = new Map(progress.map((p) => [p.taskId, p]));

  return Promise.all(
    CATEGORIES.map(async (category) => {
      const types = practiceTypesFor(moduleId, category.key as ExerciseCategory);

      const rows: PracticeTypeProgress[] = await Promise.all(
        types.map(async (type) => {
          const slots = await tasksRepo.listTasks(moduleId, category.key, type.taskType);
          const done = slots
            .map((s) => byTaskId.get(s.id))
            .filter((p) => p?.status === "COMPLETED");

          const scored = done.filter((p) => p!.bestTotal != null && p!.bestTotal > 0);
          const correct = scored.reduce((sum, p) => sum + (p!.bestScore ?? 0), 0);
          const total = scored.reduce((sum, p) => sum + (p!.bestTotal ?? 0), 0);

          return {
            category: category.key as ExerciseCategory,
            practiceType: type,
            completed: done.length,
            total: TASKS_PER_TYPE,
            accuracy: total > 0 ? correct / total : null,
          };
        })
      );

      return {
        category: category.key as ExerciseCategory,
        label: category.label,
        icon: category.icon,
        slug: category.slug,
        types: rows,
        completed: rows.reduce((sum, r) => sum + r.completed, 0),
        total: rows.length * TASKS_PER_TYPE,
      };
    })
  );
};

/**
 * What to practise next, and why.
 *
 * Weakest first: a practice type the learner is getting wrong is worth more
 * than the next unfinished task in a ladder they are already good at. Only
 * once nothing is weak does it fall back to simply continuing — and a learner
 * with no history at all gets the first task of the first ladder, which is the
 * honest answer to "where do I start".
 */
export const recommendNext = (
  categories: CategoryProgress[]
): RecommendedTask | null => {
  const all = categories.flatMap((c) => c.types);
  if (all.length === 0) return null;

  const attempted = all.filter((t) => t.accuracy !== null);
  const weakest = [...attempted].sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))[0];

  if (weakest && (weakest.accuracy ?? 1) < 0.7) {
    return {
      practiceType: weakest.practiceType,
      category: weakest.category,
      href: `/class/${categorySlug(weakest.category)}/${weakest.practiceType.slug}`,
      reason: `You are getting ${Math.round((weakest.accuracy ?? 0) * 100)}% right on ${weakest.practiceType.label.toLowerCase()}.`,
    };
  }

  // Nothing weak: carry on with whichever ladder has the most left to do, so
  // practice spreads across the categories rather than finishing one.
  const leastDone = [...all].sort((a, b) => a.completed - b.completed)[0];
  return {
    practiceType: leastDone.practiceType,
    category: leastDone.category,
    href: `/class/${categorySlug(leastDone.category)}/${leastDone.practiceType.slug}`,
    reason:
      leastDone.completed === 0
        ? "You have not tried this one yet."
        : `${leastDone.total - leastDone.completed} tasks left here.`,
  };
};

/** Practice types the learner is measurably worse at. Empty until there is evidence. */
export const weakPracticeTypes = (
  categories: CategoryProgress[],
  threshold = 0.7
): PracticeTypeProgress[] => {
  return categories
    .flatMap((c) => c.types)
    .filter((t) => t.accuracy !== null && t.accuracy < threshold && t.completed >= 2)
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1));
};
