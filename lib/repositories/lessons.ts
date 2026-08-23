import "server-only";

import { prisma } from "@/lib/db";
import type { LessonStatus, ProgressMap } from "@/lib/curriculum/progress";

// Progress through the grammar course.
//
// One row per learner per lesson slug, keyed by slug rather than an id so a
// lesson keeps its progress when the curriculum is reordered around it.

export async function loadProgress(userId: string): Promise<ProgressMap> {
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
 * Records that a lesson is open.
 *
 * Writing the row on open is what makes resuming possible: without it an
 * abandoned lesson leaves no trace and the app can only ever offer the next
 * unstarted one. A lesson already finished only gets its lastVisitedAt
 * bumped — never demoted back to IN_PROGRESS.
 */
export async function recordVisit(userId: string, lessonSlug: string, chapterId: string | null) {
  const now = new Date();
  return prisma.lessonProgress.upsert({
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

export async function recordCompletion(
  userId: string,
  lessonSlug: string,
  input: { chapterId: string | null; score: number | null; total: number | null; responsesJson: string }
) {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId, lessonSlug } },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
      score: input.score,
      total: input.total,
      responsesJson: input.responsesJson,
      chapterId: input.chapterId,
    },
    create: {
      userId,
      lessonSlug,
      chapterId: input.chapterId,
      status: "COMPLETED",
      score: input.score,
      total: input.total,
      responsesJson: input.responsesJson,
    },
  });
}

export async function listCompleted(userId: string, take = 12) {
  return prisma.lessonProgress.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    take,
  });
}
