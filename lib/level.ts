import { prisma } from "@/lib/db";

// The learner's LEVEL — and the wall between it and everything the app
// measures.
//
// Two facts that look similar and are not:
//
//   Official level    what a sprogcenter or SIRI decided. Set only by the
//                     learner: at onboarding, or by recording a real result.
//   Practice standing what this app has measured (ModuleSkillStatus.inApp*,
//                     ExerciseAttempt scores, ExamSession results).
//
// A learner can be studying Modul 3, scoring 80% in Modul 3 practice, and
// still officially be at Modul 2. All three are true at once, and the app must
// never quietly collapse them into one number. Every writer of the official
// fields is in this file, and none of them takes a score as an argument.

export const EDUCATIONS = ["DU2", "DU3"] as const;
export type Education = (typeof EDUCATIONS)[number];

export const LEVEL_SOURCES = ["ONBOARDING", "OFFICIAL_RESULT"] as const;
export type LevelSource = (typeof LEVEL_SOURCES)[number];

export const TEST_TYPES = ["MODULTEST", "PD3"] as const;
export type OfficialTestType = (typeof TEST_TYPES)[number];

export const OFFICIAL_RESULTS = ["PASSED", "NOT_PASSED"] as const;
export type OfficialResultOutcome = (typeof OFFICIAL_RESULTS)[number];

export interface UserLevel {
  education: Education | null;
  currentModule: number | null;
  levelSource: LevelSource | null;
  levelSetAt: Date | null;
  onboarded: boolean;
  /** True when the learner has never told us their level. */
  unset: boolean;
}

export async function getUserLevel(userId: string): Promise<UserLevel> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const education = (profile?.education as Education | null) ?? null;
  const currentModule = profile?.currentModule ?? null;

  return {
    education,
    currentModule,
    levelSource: (profile?.levelSource as LevelSource | null) ?? null,
    levelSetAt: profile?.levelSetAt ?? null,
    onboarded: !!profile?.onboardedAt,
    unset: education === null && currentModule === null,
  };
}

/** A short label for the level, or null when it has never been set. */
export function levelLabel(level: UserLevel): string | null {
  if (level.unset) return null;
  const parts: string[] = [];
  if (level.education) parts.push(level.education === "DU3" ? "PD3" : level.education);
  if (level.currentModule) parts.push(`Modul ${level.currentModule}`);
  return parts.join(" · ") || null;
}

/**
 * Sets the level from what the learner said. `source` records how they told
 * us, so the UI can show "from your onboarding answers" or "from your Modul 2
 * result" rather than an unexplained number.
 */
export async function setUserLevel(
  userId: string,
  input: { education: Education | null; currentModule: number | null },
  source: LevelSource
) {
  const now = new Date();
  await prisma.userProfile.upsert({
    where: { userId },
    update: {
      education: input.education,
      currentModule: input.currentModule,
      levelSource: source,
      levelSetAt: now,
      ...(source === "ONBOARDING" ? { onboardedAt: now } : {}),
    },
    create: {
      userId,
      education: input.education,
      currentModule: input.currentModule,
      levelSource: source,
      levelSetAt: now,
      onboardedAt: source === "ONBOARDING" ? now : null,
    },
  });
}

export async function markOnboarded(userId: string) {
  await prisma.userProfile.upsert({
    where: { userId },
    update: { onboardedAt: new Date() },
    create: { userId, onboardedAt: new Date() },
  });
}

export interface OfficialResultInput {
  testType: OfficialTestType;
  education?: Education | null;
  module?: number | null;
  result?: OfficialResultOutcome | null;
  takenAt?: Date | null;
  note?: string | null;
  source?: "SELF_REPORTED" | "REPORT_CARD";
  reportCardId?: string | null;
}

/**
 * Records a real test the learner sat.
 *
 * A PASSED modultest is the one thing allowed to move the official level, and
 * only forwards: passing Modul 2 means the learner is now at Modul 3. It never
 * moves the level down, and no in-app score reaches this function.
 */
export async function addOfficialTestResult(userId: string, input: OfficialResultInput) {
  const row = await prisma.officialTestResult.create({
    data: {
      userId,
      testType: input.testType,
      education: input.education ?? null,
      module: input.module ?? null,
      result: input.result ?? null,
      takenAt: input.takenAt ?? null,
      note: input.note ?? null,
      source: input.source ?? "SELF_REPORTED",
      reportCardId: input.reportCardId ?? null,
    },
  });

  if (input.result === "PASSED" && input.testType === "MODULTEST" && input.module) {
    const level = await getUserLevel(userId);
    const next = Math.min(input.module + 1, 5);
    if ((level.currentModule ?? 0) < next) {
      await setUserLevel(
        userId,
        { education: input.education ?? level.education, currentModule: next },
        "OFFICIAL_RESULT"
      );
    }
  }

  return row;
}

export async function listOfficialTestResults(userId: string) {
  return prisma.officialTestResult.findMany({
    where: { userId },
    orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function deleteOfficialTestResult(userId: string, id: string) {
  const row = await prisma.officialTestResult.findUnique({ where: { id } });
  if (!row || row.userId !== userId) return false;
  await prisma.officialTestResult.delete({ where: { id } });
  return true;
}
