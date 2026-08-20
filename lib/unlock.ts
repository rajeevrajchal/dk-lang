import { prisma } from "@/lib/db";
import { MODULES } from "@/lib/curriculum/modules";
import type { Skill } from "@/lib/constants";

// ----------------------------------------------------------------------------
// Module/level unlock state machine.
//
// Two signals are tracked per (module, skill) and NEVER merged into one:
//  - inAppPassed: the learner cleared this app's own timed mock modultest for
//    that discipline. This is a readiness signal, not a certification — it's
//    sufficient on its own to unlock the next module's practice content.
//  - officialPassed: what an uploaded, confirmed report card says. This is
//    the ground-truth record of what SIRI/the sprogcenter actually decided.
//    If it ever conflicts with the in-app record, the report card wins and
//    the discrepancy is surfaced (see lib/report-cards.ts), never silently
//    overwritten.
// ----------------------------------------------------------------------------

// The three disciplines a Modul 2-4 modultest is graded on. Listening is
// assessed as part of the oral component in the real exam, not scored
// separately — it doesn't gate unlock on its own.
export const MODULTEST_SKILLS: Skill[] = ["READING", "WRITING", "SPEAKING"];
// PD3 (Modul 5) is skriftlig + mundtlig.
export const PD3_SKILLS: Skill[] = ["WRITING", "SPEAKING"];

export const EXAM_PASS_THRESHOLD = 0.7;

export interface DisciplineStatus {
  skill: Skill;
  inAppPassed: boolean;
  inAppScore: number | null;
  officialPassed: boolean | null; // null = no verified record
  discrepancy: boolean;
  discrepancyNote: string | null;
}

export interface ModuleDashboardState {
  moduleId: number;
  name: string;
  isFinalExam: boolean;
  isOralOnly: boolean;
  practiceUnlocked: boolean;
  disciplines: DisciplineStatus[];
  inAppFullyPassed: boolean; // all required disciplines passed in-app
  officiallyFullyPassed: boolean | null; // null if not fully verified yet
}

function requiredSkillsFor(moduleId: number): Skill[] {
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) return [];
  if (mod.isOralOnly) return [];
  return mod.isFinalExam ? PD3_SKILLS : MODULTEST_SKILLS;
}

export async function getModuleDashboardState(userId: string): Promise<ModuleDashboardState[]> {
  const allStatus = await prisma.moduleSkillStatus.findMany({ where: { userId } });

  const byModule = new Map<number, typeof allStatus>();
  for (const s of allStatus) {
    if (!byModule.has(s.moduleId)) byModule.set(s.moduleId, []);
    byModule.get(s.moduleId)!.push(s);
  }

  const results: ModuleDashboardState[] = [];
  let previousModulePassed = true; // Modul 1 is oral-only, so Modul 2 always starts unlocked.

  for (const mod of MODULES.sort((a, b) => a.order - b.order)) {
    const required = requiredSkillsFor(mod.id);
    const statusRows = byModule.get(mod.id) ?? [];

    const disciplines: DisciplineStatus[] = required.map((skill) => {
      const row = statusRows.find((s) => s.skill === skill);
      return {
        skill,
        inAppPassed: row?.inAppPassed ?? false,
        inAppScore: row?.inAppScore ?? null,
        officialPassed: row?.officialPassed ?? null,
        discrepancy: row?.discrepancy ?? false,
        discrepancyNote: row?.discrepancyNote ?? null,
      };
    });

    const inAppFullyPassed = required.length > 0 && disciplines.every((d) => d.inAppPassed);
    const officiallyFullyPassed =
      required.length === 0
        ? null
        : disciplines.some((d) => d.officialPassed === null)
          ? null
          : disciplines.every((d) => d.officialPassed === true);

    results.push({
      moduleId: mod.id,
      name: mod.name,
      isFinalExam: mod.isFinalExam,
      isOralOnly: mod.isOralOnly,
      practiceUnlocked: previousModulePassed,
      disciplines,
      inAppFullyPassed,
      officiallyFullyPassed,
    });

    previousModulePassed = mod.isOralOnly || inAppFullyPassed;
  }

  return results;
}

// Called when a mock modultest/PD3 ExamSession is completed. Sets the
// in-app signal only — never touches officialPassed.
export async function applyInAppExamResult(
  userId: string,
  moduleId: number,
  skill: Skill,
  score: number,
  passed: boolean
) {
  await prisma.moduleSkillStatus.upsert({
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
