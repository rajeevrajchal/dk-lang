import { prisma } from "@/lib/db";
import { getConstructStats, getWeakestConstruct, determineCurrentTier } from "@/lib/adaptive/engine";
import { getModuleDashboardState, pickCurrentModuleId, type ModuleDashboardState } from "@/lib/unlock";
import { SKILLS, type Skill } from "@/lib/constants";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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

export function hasContent(moduleId: number, skill: Skill) {
  return CONTENT_READY.some((c) => c.moduleId === moduleId && c.skill === skill);
}

async function getVerifiedReportCards(userId: string) {
  return prisma.reportCard.findMany({
    where: { userId, status: "CONFIRMED" },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getSkillStatusesForModule(
  userId: string,
  moduleId: number,
  dict: Dictionary
): Promise<SkillStatus[]> {
  return Promise.all(
    SKILLS.map(async (skill): Promise<SkillStatus> => {
      const ready = hasContent(moduleId, skill);
      if (!ready) {
        return {
          skill,
          label: dict.enums.skills[skill],
          hasContent: false,
          accuracy: null,
          attemptCount: 0,
          currentTier: null,
          weakestConstruct: null,
        };
      }

      const stats = await getConstructStats(userId, skill, moduleId);
      const attempted = stats.filter((s) => s.totalCount > 0);
      const totalCorrect = attempted.reduce((sum, s) => sum + s.correctCount, 0);
      const totalCount = attempted.reduce((sum, s) => sum + s.totalCount, 0);

      const weakest = await getWeakestConstruct(userId, skill, moduleId);
      const { tier } = await determineCurrentTier(userId, moduleId, skill);

      return {
        skill,
        label: dict.enums.skills[skill],
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
}

export async function getDashboardData(userId: string, dict: Dictionary): Promise<DashboardData> {
  const moduleStates = await getModuleDashboardState(userId);
  const currentModuleId = pickCurrentModuleId(moduleStates);

  const skillStatuses = await getSkillStatusesForModule(userId, currentModuleId, dict);

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
        label: dict.dashboard.nextAction.focusOn(
          readingStatus.weakestConstruct.name,
          Math.round(readingStatus.weakestConstruct.accuracy * 100)
        ),
        href: `/practice/reading/${currentModuleId}`,
      };
    } else if (readingStatus.attemptCount < 8) {
      nextAction = {
        label: dict.dashboard.nextAction.establishBaseline,
        href: `/practice/reading/${currentModuleId}`,
      };
    } else if ((readingStatus.currentTier ?? 1) >= 3 && (readingStatus.accuracy ?? 0) >= 0.75) {
      nextAction = {
        label: dict.dashboard.nextAction.readyForMockTest(currentModuleId),
        href: `/exam/reading/${currentModuleId}`,
      };
    } else {
      nextAction = {
        label: dict.dashboard.nextAction.continueTier(readingStatus.currentTier ?? 1),
        href: `/practice/reading/${currentModuleId}`,
      };
    }
  } else {
    nextAction = {
      label: dict.dashboard.nextAction.continueModul2,
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
