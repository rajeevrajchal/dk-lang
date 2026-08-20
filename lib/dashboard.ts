import { prisma } from "@/lib/db";
import { getConstructStats, getWeakestConstruct, determineCurrentTier } from "@/lib/adaptive/engine";
import { getModuleDashboardState, type ModuleDashboardState } from "@/lib/unlock";
import { SKILLS, SKILL_LABELS_DA, type Skill } from "@/lib/constants";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";

export interface SkillStatus {
  skill: Skill;
  label: string;
  hasContent: boolean;
  accuracy: number | null;
  attemptCount: number;
  currentTier: number | null;
  weakestConstruct: { name: string; accuracy: number } | null;
}

export interface RecentActivityRow {
  id: string;
  createdAt: Date;
  isCorrect: boolean;
  skill: string;
  moduleId: number;
  tierId: number;
  examSessionId: string | null;
}

export interface DashboardData {
  currentModuleId: number;
  moduleStates: ModuleDashboardState[];
  skillStatuses: SkillStatus[];
  recentActivity: RecentActivityRow[];
  nextAction: { label: string; href: string };
  verifiedReportCards: Awaited<ReturnType<typeof getVerifiedReportCards>>;
}

// Only Modul 2 reading has a generated item bank today; every other
// skill/module combination is schema-ready but content is future work (see
// docs/module-map.md).
const CONTENT_READY: { moduleId: number; skill: Skill }[] = [{ moduleId: 2, skill: "READING" }];

function hasContent(moduleId: number, skill: Skill) {
  return CONTENT_READY.some((c) => c.moduleId === moduleId && c.skill === skill);
}

async function getVerifiedReportCards(userId: string) {
  return prisma.reportCard.findMany({
    where: { userId, status: "CONFIRMED" },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const moduleStates = await getModuleDashboardState(userId);

  // "Current module": the lowest-numbered non-oral module that's unlocked
  // for practice but not yet fully passed in-app. Falls back to the last
  // module if everything is passed.
  const currentModuleState =
    moduleStates.find((m) => !m.isOralOnly && m.practiceUnlocked && !m.inAppFullyPassed) ??
    moduleStates[moduleStates.length - 1];
  const currentModuleId = currentModuleState.moduleId;

  const skillStatuses: SkillStatus[] = await Promise.all(
    SKILLS.map(async (skill): Promise<SkillStatus> => {
      const ready = hasContent(currentModuleId, skill);
      if (!ready) {
        return {
          skill,
          label: SKILL_LABELS_DA[skill],
          hasContent: false,
          accuracy: null,
          attemptCount: 0,
          currentTier: null,
          weakestConstruct: null,
        };
      }

      const stats = await getConstructStats(userId, skill, currentModuleId);
      const attempted = stats.filter((s) => s.totalCount > 0);
      const totalCorrect = attempted.reduce((sum, s) => sum + s.correctCount, 0);
      const totalCount = attempted.reduce((sum, s) => sum + s.totalCount, 0);

      const weakest = await getWeakestConstruct(userId, skill, currentModuleId);
      const { tier } = await determineCurrentTier(userId, currentModuleId, skill);

      return {
        skill,
        label: SKILL_LABELS_DA[skill],
        hasContent: true,
        accuracy: totalCount > 0 ? totalCorrect / totalCount : null,
        attemptCount: totalCount,
        currentTier: tier,
        weakestConstruct: weakest
          ? { name: weakest.name, accuracy: weakest.accuracy ?? 0 }
          : null,
      };
    })
  );

  const recentAttempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { item: true },
  });

  const readingStatus = skillStatuses.find((s) => s.skill === "READING");
  let nextAction: DashboardData["nextAction"];
  if (readingStatus?.hasContent) {
    if (readingStatus.weakestConstruct && readingStatus.weakestConstruct.accuracy < 0.6) {
      nextAction = {
        label: `Øv læsning: fokuser på '${readingStatus.weakestConstruct.name}' (${Math.round(
          readingStatus.weakestConstruct.accuracy * 100
        )}% korrekt)`,
        href: `/practice/reading/${currentModuleId}`,
      };
    } else if (readingStatus.attemptCount < 8) {
      nextAction = {
        label: "10 læseøvelser for at etablere dit udgangspunkt",
        href: `/practice/reading/${currentModuleId}`,
      };
    } else if ((readingStatus.currentTier ?? 1) >= 3 && (readingStatus.accuracy ?? 0) >= 0.75) {
      nextAction = {
        label: `Du er klar til en mock modultest i læsning for Modul ${currentModuleId}`,
        href: `/exam/reading/${currentModuleId}`,
      };
    } else {
      nextAction = {
        label: `Fortsæt læsning på Tier ${readingStatus.currentTier}`,
        href: `/practice/reading/${currentModuleId}`,
      };
    }
  } else {
    nextAction = {
      label: `Fortsæt læsning i Modul 2 (andre discipliner kommer snart)`,
      href: `/practice/reading/2`,
    };
  }

  return {
    currentModuleId,
    moduleStates,
    skillStatuses,
    recentActivity: recentAttempts.map((a) => ({
      id: a.id,
      createdAt: a.createdAt,
      isCorrect: a.isCorrect,
      skill: a.item.skill,
      moduleId: a.item.moduleId,
      tierId: a.item.tierId,
      examSessionId: a.examSessionId,
    })),
    nextAction,
    verifiedReportCards: await getVerifiedReportCards(userId),
  };
}

export { MODULE_BY_ID };
