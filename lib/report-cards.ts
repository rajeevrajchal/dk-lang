import { prisma } from "@/lib/db";
import type { Skill } from "@/lib/constants";

const DISCIPLINE_TO_SKILL: Record<string, Skill> = {
  mundtlig: "SPEAKING",
  laesning: "READING",
  skrivning: "WRITING",
  skriftlig: "WRITING",
};

export interface ReconciliationChange {
  discipline: string;
  skill: Skill;
  officialPassed: boolean;
  previousInAppPassed: boolean | null;
  discrepancy: boolean;
}

// Reconciles a confirmed report card against the app's in-app module/skill
// state. The report card is always authoritative: this only ever sets
// officialPassed (and flags a discrepancy note when it disagrees with the
// in-app signal) — it never touches inAppPassed, which stays a record of
// what the mock exam actually showed.
export async function reconcileReportCard(
  userId: string,
  reportCardId: string
): Promise<ReconciliationChange[]> {
  const reportCard = await prisma.reportCard.findUniqueOrThrow({ where: { id: reportCardId } });
  const moduleId = reportCard.extractedModule;
  if (!moduleId) return [];

  const results: Record<string, "pass" | "fail"> = JSON.parse(
    reportCard.extractedResultsJson ?? "{}"
  );

  const changes: ReconciliationChange[] = [];

  for (const [discipline, result] of Object.entries(results)) {
    const skill = DISCIPLINE_TO_SKILL[discipline];
    if (!skill) continue;

    const officialPassed = result === "pass";
    const existing = await prisma.moduleSkillStatus.findUnique({
      where: { userId_moduleId_skill: { userId, moduleId, skill } },
    });

    const discrepancy = existing != null && existing.inAppPassed !== officialPassed;
    const discrepancyNote = discrepancy
      ? `Resultatbevis viser ${officialPassed ? "bestået" : "ikke bestået"}, men appens interne mock-status viste ${
          existing!.inAppPassed ? "bestået" : "ikke bestået"
        }. Resultatbeviset er den gældende sandhed.`
      : null;

    await prisma.moduleSkillStatus.upsert({
      where: { userId_moduleId_skill: { userId, moduleId, skill } },
      update: {
        officialPassed,
        officialSourceId: reportCard.id,
        officialSetAt: new Date(),
        discrepancy,
        discrepancyNote,
      },
      create: {
        userId,
        moduleId,
        skill,
        officialPassed,
        officialSourceId: reportCard.id,
        officialSetAt: new Date(),
        discrepancy: false,
        discrepancyNote: null,
      },
    });

    changes.push({
      discipline,
      skill,
      officialPassed,
      previousInAppPassed: existing?.inAppPassed ?? null,
      discrepancy,
    });
  }

  await prisma.reportCard.update({
    where: { id: reportCard.id },
    data: { reconciliationJson: JSON.stringify(changes) },
  });

  return changes;
}
