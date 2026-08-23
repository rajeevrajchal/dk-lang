import "server-only";

import { prisma } from "@/lib/db";

// Users, profiles and official test results.
//
// The split between "what the learner told us" (UserProfile, OfficialTestResult)
// and "what the app measured" (ModuleSkillStatus, attempts) is deliberate and
// is enforced here: nothing in this file takes a score.

export async function findById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, authProvider: true, createdAt: true },
  });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getProfile(userId: string) {
  return prisma.userProfile.findUnique({ where: { userId } });
}

export async function upsertProfile(
  userId: string,
  data: Parameters<typeof prisma.userProfile.update>[0]["data"]
) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data } as never,
  });
}

export async function getInterestsJson(userId: string): Promise<string | null> {
  const row = await prisma.userProfile.findUnique({
    where: { userId },
    select: { interestsJson: true },
  });
  return row?.interestsJson ?? null;
}

export async function setInterestsJson(userId: string, interestsJson: string) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: { interestsJson },
    create: { userId, interestsJson },
  });
}

export async function listOfficialResults(userId: string) {
  return prisma.officialTestResult.findMany({
    where: { userId },
    orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function createOfficialResult(
  userId: string,
  data: Omit<Parameters<typeof prisma.officialTestResult.create>[0]["data"], "userId" | "user">
) {
  return prisma.officialTestResult.create({ data: { ...data, userId } as never });
}

/** Scoped by userId as well as id: an id alone would let anyone delete anyone's. */
export async function deleteOfficialResult(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.officialTestResult.deleteMany({ where: { id, userId } });
  return count > 0;
}
