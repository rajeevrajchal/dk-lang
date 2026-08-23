import "server-only";

import { prisma } from "@/lib/db";

// Modultest exercises ("opgaver") and the mock-test sessions they belong to.
//
// An ExerciseAttempt with an examSessionId is part of a timed mock test; one
// without is Class practice. That single field is what distinguishes the two
// modes throughout the app — see lib/exercises/mode.ts — so it is never
// derived twice.

export interface HistoryFilter {
  moduleId?: number;
  category?: string;
}

/** Completed attempts, for the selector's "don't repeat this" rotation. */
export async function completedHistory(userId: string, filter: HistoryFilter = {}) {
  return prisma.exerciseAttempt.findMany({
    where: {
      userId,
      status: "COMPLETED",
      ...(filter.moduleId ? { moduleId: filter.moduleId } : {}),
      ...(filter.category ? { category: filter.category } : {}),
    },
    select: { variantId: true, taskType: true, topic: true, completedAt: true },
    orderBy: { completedAt: "asc" },
  });
}

export async function recentCompleted(userId: string, filter: HistoryFilter = {}, take = 30) {
  return prisma.exerciseAttempt.findMany({
    where: {
      userId,
      status: "COMPLETED",
      ...(filter.moduleId ? { moduleId: filter.moduleId } : {}),
      ...(filter.category ? { category: filter.category } : {}),
    },
    orderBy: { completedAt: "desc" },
    take,
  });
}

export async function findAttempt(userId: string, attemptId: string) {
  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id: attemptId } });
  // Checked here rather than in each route: an attempt id alone must not be
  // enough to read somebody else's answers.
  if (!attempt || attempt.userId !== userId) return null;
  return attempt;
}

export async function createAttempt(
  data: Parameters<typeof prisma.exerciseAttempt.create>[0]["data"]
) {
  return prisma.exerciseAttempt.create({ data });
}

export async function updateAttempt(
  attemptId: string,
  data: Parameters<typeof prisma.exerciseAttempt.update>[0]["data"]
) {
  return prisma.exerciseAttempt.update({ where: { id: attemptId }, data });
}

/** Class practice only — a mock attempt is a test, not practice. */
export async function practiceActivity(userId: string) {
  return prisma.exerciseAttempt.findMany({
    where: { userId, status: "COMPLETED", examSessionId: null },
    select: { category: true, completedAt: true },
  });
}

// ---------------------------------------------------------------------------
// Mock test sessions
// ---------------------------------------------------------------------------

export async function findExamSession(userId: string, sessionId: string) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exerciseAttempts: { orderBy: { orderIndex: "asc" } } },
  });
  if (!session || session.userId !== userId) return null;
  return session;
}

export async function createExamSession(
  data: Parameters<typeof prisma.examSession.create>[0]["data"]
) {
  return prisma.examSession.create({ data });
}

export async function completeExamSession(
  sessionId: string,
  data: { scoresJson: string; passedJson: string }
) {
  return prisma.examSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date(), ...data },
  });
}

export async function completedExamSessions(userId: string) {
  return prisma.examSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
  });
}
