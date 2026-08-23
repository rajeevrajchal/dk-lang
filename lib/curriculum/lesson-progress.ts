import { prisma } from "@/lib/db";
import type { LessonStatus, ProgressMap } from "./progress";

// Loading and recording lesson progress. One place, so the Lessons pages, the
// sidebar, the API and the Dashboard all read the same shape.

export async function loadLessonProgress(userId: string): Promise<ProgressMap> {
  const rows = await prisma.lessonProgress.findMany({ where: { userId } });
  const map: ProgressMap = {};
  for (const r of rows) {
    map[r.lessonSlug] = {
      lessonSlug: r.lessonSlug,
      score: r.score,
      total: r.total,
      completedAt: r.completedAt.toISOString(),
      status: r.status as LessonStatus,
      lastVisitedAt: r.lastVisitedAt?.toISOString() ?? null,
    };
  }
  return map;
}

/**
 * Records that the learner has this lesson open.
 *
 * Creating the row on open is what makes resuming possible — without it there
 * is no record of an unfinished lesson at all. The row starts IN_PROGRESS and
 * is promoted to COMPLETED by /api/course/progress on submission; a lesson
 * already finished only gets its lastVisitedAt bumped, never demoted.
 */
export async function recordLessonVisit(
  userId: string,
  lessonSlug: string,
  chapterId: string | null
) {
  const now = new Date();
  await prisma.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId, lessonSlug } },
    update: { lastVisitedAt: now, ...(chapterId ? { chapterId } : {}) },
    create: {
      userId,
      lessonSlug,
      chapterId,
      status: "IN_PROGRESS",
      startedAt: now,
      lastVisitedAt: now,
    },
  });
}
