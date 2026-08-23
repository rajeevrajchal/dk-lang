import "server-only";

import { prisma } from "@/lib/db";
import type { Skill } from "@/lib/constants";

// Skill progress and module readiness — the item-level drill, and the
// in-app/official split that the whole unlock model rests on.

// ---------------------------------------------------------------------------
// Item attempts (the adaptive reading drill)
// ---------------------------------------------------------------------------

export async function recentAttempts(userId: string, take = 10) {
  return prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: { item: true },
  });
}

export async function readingAttemptsSince(userId: string, since: Date) {
  return prisma.attempt.findMany({
    where: { userId, createdAt: { gte: since }, item: { skill: "READING" } },
    select: { createdAt: true },
  });
}

export async function completedReadingExercisesSince(userId: string, since: Date) {
  return prisma.exerciseAttempt.findMany({
    where: { userId, category: "READING", status: "COMPLETED", completedAt: { gte: since } },
    select: { completedAt: true },
  });
}

// ---------------------------------------------------------------------------
// Module / skill status
//
// Two signals per (module, skill) that are never merged: what this app
// measured, and what a real examiner decided. See docs/unlock-logic.md.
// ---------------------------------------------------------------------------

export async function moduleSkillStatuses(userId: string) {
  return prisma.moduleSkillStatus.findMany({ where: { userId } });
}

export async function findModuleSkillStatus(userId: string, moduleId: number, skill: Skill) {
  return prisma.moduleSkillStatus.findUnique({
    where: { userId_moduleId_skill: { userId, moduleId, skill } },
  });
}

/**
 * Records what the app's own mock test showed.
 *
 * Writes `inApp*` and nothing else — never `officialPassed`. That separation
 * is the point of the model, so it is enforced by this function's shape rather
 * than by remembering.
 */
export async function applyInAppResult(
  userId: string,
  moduleId: number,
  skill: Skill,
  score: number,
  passed: boolean
) {
  return prisma.moduleSkillStatus.upsert({
    where: { userId_moduleId_skill: { userId, moduleId, skill } },
    update: passed
      ? { inAppPassed: true, inAppScore: score, inAppPassedAt: new Date() }
      : { inAppScore: score },
    create: {
      userId,
      moduleId,
      skill,
      inAppPassed: passed,
      inAppScore: score,
      inAppPassedAt: passed ? new Date() : null,
    },
  });
}

/** Records what a confirmed report card said. Never touches `inApp*`. */
export async function applyOfficialResult(
  userId: string,
  moduleId: number,
  skill: Skill,
  data: {
    officialPassed: boolean;
    officialSourceId: string;
    discrepancy: boolean;
    discrepancyNote: string | null;
  }
) {
  return prisma.moduleSkillStatus.upsert({
    where: { userId_moduleId_skill: { userId, moduleId, skill } },
    update: { ...data, officialSetAt: new Date() },
    create: {
      userId,
      moduleId,
      skill,
      officialPassed: data.officialPassed,
      officialSourceId: data.officialSourceId,
      officialSetAt: new Date(),
      discrepancy: false,
      discrepancyNote: null,
    },
  });
}

// ---------------------------------------------------------------------------
// Report cards
// ---------------------------------------------------------------------------

export async function listReportCards(userId: string, status?: string) {
  return prisma.reportCard.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function findReportCard(userId: string, id: string) {
  const card = await prisma.reportCard.findUnique({ where: { id } });
  if (!card || card.userId !== userId) return null;
  return card;
}
