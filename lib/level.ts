import { users } from "@/lib/repositories";
import type { Education, LevelSource, OfficialResultInput, UserLevel } from "@/types";

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
export const LEVEL_SOURCES = ["ONBOARDING", "OFFICIAL_RESULT"] as const;
export const TEST_TYPES = ["MODULTEST", "PD3"] as const;
export const OFFICIAL_RESULTS = ["PASSED", "NOT_PASSED"] as const;
export const getUserLevel = async (userId: string): Promise<UserLevel> => {
  const profile = await users.getProfile(userId);
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
};

/** A short label for the level, or null when it has never been set. */
export const levelLabel = (level: UserLevel): string | null => {
  if (level.unset) return null;
  const parts: string[] = [];
  if (level.education) parts.push(level.education === "DU3" ? "PD3" : level.education);
  if (level.currentModule) parts.push(`Modul ${level.currentModule}`);
  return parts.join(" · ") || null;
};

/**
 * Sets the level from what the learner said. `source` records how they told
 * us, so the UI can show "from your onboarding answers" or "from your Modul 2
 * result" rather than an unexplained number.
 */
export const setUserLevel = async (
  userId: string,
  input: { education: Education | null; currentModule: number | null },
  source: LevelSource
) => {
  const now = new Date().toISOString();
  await users.upsertProfile(userId, {
    education: input.education,
    currentModule: input.currentModule,
    levelSource: source,
    levelSetAt: now,
    ...(source === "ONBOARDING" ? { onboardedAt: now } : {}),
  });
};

export const markOnboarded = async (userId: string) => {
  await users.upsertProfile(userId, { onboardedAt: new Date().toISOString() });
};

/**
 * Records a real test the learner sat.
 *
 * A PASSED modultest is the one thing allowed to move the official level, and
 * only forwards: passing Modul 2 means the learner is now at Modul 3. It never
 * moves the level down, and no in-app score reaches this function.
 */
export const addOfficialTestResult = async (userId: string, input: OfficialResultInput) => {
  const row = await users.createOfficialResult(userId, {
    testType: input.testType,
    education: input.education ?? null,
    module: input.module ?? null,
    result: input.result ?? null,
    takenAt: input.takenAt?.toISOString() ?? null,
    note: input.note ?? null,
    source: input.source ?? "SELF_REPORTED",
    reportCardId: input.reportCardId ?? null,
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
};

export const listOfficialTestResults = async (userId: string) => {
  return users.listOfficialResults(userId);
};

export const deleteOfficialTestResult = async (userId: string, id: string) => {
  return users.deleteOfficialResult(userId, id);
};
