/**
 * The order rows must be inserted in, so a foreign key is never violated:
 * parents before children, all the way down.
 *
 * Its own module on purpose. It used to live in export.ts, and import.ts
 * imported it from there — which also executed export.ts's top-level `main()`,
 * silently re-exporting from the TARGET database and overwriting the snapshot
 * before importing it. Against an empty database that would have destroyed the
 * data being migrated.
 */
export const TABLE_ORDER = [
  // Content, seeded and independent of any learner.
  "tier",
  "module",
  "construct",
  "item",
  "itemConstruct",
  "vocabItem",
  // Identity.
  "user",
  "account",
  "session",
  "verificationToken",
  "userProfile",
  // Learner records, in dependency order.
  "reportCard",
  "officialTestResult",
  "examSession",
  "attempt",
  "constructAccuracy",
  "srsState",
  "vocabSrsState",
  "moduleSkillStatus",
  "exerciseAttempt",
  "lessonProgress",
  "readingProgress",
  "savedWord",
  "readingNote",
  "readingHighlight",
  "readingExplanation",
] as const;

export const SNAPSHOT_PATH = "prisma/data-migration/snapshot.json";
