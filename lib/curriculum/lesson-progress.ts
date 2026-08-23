import { lessons } from "@/lib/repositories";
import type { ProgressMap } from "./progress";

// Lesson progress, re-exported from the repository layer.
//
// This module predates lib/repositories and is imported from several places.
// Rather than update every caller, it now forwards — one implementation of the
// "record a visit without demoting a finished lesson" rule, in the place the
// rest of the data access lives.

export async function loadLessonProgress(userId: string): Promise<ProgressMap> {
  return lessons.loadProgress(userId);
}

export async function recordLessonVisit(
  userId: string,
  lessonSlug: string,
  chapterId: string | null
) {
  return lessons.recordVisit(userId, lessonSlug, chapterId);
}
