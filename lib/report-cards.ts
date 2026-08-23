import { progress } from "@/lib/repositories";
import { adminDb, unwrap } from "@/lib/supabase/db";
import type { ReconciliationChange, Skill } from "@/types";

const DISCIPLINE_TO_SKILL: Record<string, Skill> = {
  mundtlig: "SPEAKING",
  laesning: "READING",
  skrivning: "WRITING",
  skriftlig: "WRITING",
};

// Reconciles a confirmed report card against the app's in-app module/skill
// state. The report card is always authoritative: this only ever sets
// officialPassed (and flags a discrepancy note when it disagrees with the
// in-app signal) — it never touches inAppPassed, which stays a record of
// what the mock exam actually showed.
export const reconcileReportCard = async (
  userId: string,
  reportCardId: string
): Promise<ReconciliationChange[]> => {
  // Admin client: reconciliation runs on the learner's behalf but reads a row
  // by id, and this must not silently return nothing if a policy changes.
  const cards = unwrap(
    await adminDb().from("ReportCard").select("*").eq("id", reportCardId),
    "reconcileReportCard"
  );
  const reportCard = cards[0];
  if (!reportCard) throw new Error(`report card ${reportCardId} not found`);
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
    const statuses = await progress.moduleSkillStatuses(userId);
    const existing =
      statuses.find((s) => s.moduleId === moduleId && s.skill === skill) ?? null;

    const discrepancy = existing != null && existing.inAppPassed !== officialPassed;
    const discrepancyNote = discrepancy
      ? `Resultatbevis viser ${officialPassed ? "bestået" : "ikke bestået"}, men appens interne mock-status viste ${
          existing!.inAppPassed ? "bestået" : "ikke bestået"
        }. Resultatbeviset er den gældende sandhed.`
      : null;

    await progress.applyOfficialResult(userId, moduleId, skill, {
      officialPassed,
      officialSourceId: reportCard.id,
      discrepancy,
      discrepancyNote,
    });

    changes.push({
      discipline,
      skill,
      officialPassed,
      previousInAppPassed: existing?.inAppPassed ?? null,
      discrepancy,
    });
  }

  unwrap(
    await adminDb()
      .from("ReportCard")
      .update({ reconciliationJson: JSON.stringify(changes) })
      .eq("id", reportCard.id)
      .select("id"),
    "reconcileReportCard(update)"
  );

  return changes;
};
