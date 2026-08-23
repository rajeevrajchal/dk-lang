import type { TaskType } from "./types";

// Turning a finished mock test into "what went well, what needs work".
//
// Strictly a re-reading of the scoring that already happened: each opgave's
// score out of its total, grouped by task type. Nothing new is computed, no
// grade is invented, and an unscored part (writing, speaking) is left out
// rather than guessed at — the app does not certify what it did not assess.

/** Above this share correct, a task type counts as a strength. */
export const STRENGTH_THRESHOLD = 0.8;
/** At or below this, it is flagged for practice. */
export const WEAKNESS_THRESHOLD = 0.6;

export interface ScoredPart {
  taskType?: string;
  category: string;
  score: number | null;
  total: number | null;
}

export interface SummaryEntry {
  taskType: string;
  category: string;
  correct: number;
  total: number;
  ratio: number;
}

export interface MockSummary {
  strengths: SummaryEntry[];
  needsPractice: SummaryEntry[];
  /** Every scored task type, strongest first — the full picture. */
  all: SummaryEntry[];
  /** Share correct across everything that could be scored. */
  overall: number | null;
}

export function summariseMock(parts: ScoredPart[]): MockSummary {
  const byType = new Map<string, SummaryEntry>();

  for (const p of parts) {
    if (p.total == null || p.total === 0 || p.score == null) continue;
    const key = p.taskType ?? p.category;
    const entry = byType.get(key) ?? {
      taskType: key,
      category: p.category,
      correct: 0,
      total: 0,
      ratio: 0,
    };
    entry.correct += p.score;
    entry.total += p.total;
    entry.ratio = entry.correct / entry.total;
    byType.set(key, entry);
  }

  const all = [...byType.values()].sort((a, b) => b.ratio - a.ratio);
  const correct = all.reduce((sum, e) => sum + e.correct, 0);
  const total = all.reduce((sum, e) => sum + e.total, 0);

  return {
    strengths: all.filter((e) => e.ratio >= STRENGTH_THRESHOLD),
    needsPractice: all.filter((e) => e.ratio <= WEAKNESS_THRESHOLD),
    all,
    overall: total > 0 ? correct / total : null,
  };
}

/** Where in Class to go and work on a weak task type. */
export function practiceHrefFor(entry: SummaryEntry, moduleId: number): string {
  const skill = entry.category.toLowerCase();
  const isTaskType = entry.taskType !== entry.category;
  return isTaskType
    ? `/class/${skill}/${moduleId}/${entry.taskType as TaskType}`
    : `/class/${skill}/${moduleId}`;
}
