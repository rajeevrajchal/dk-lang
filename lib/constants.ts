// App-layer validation for fields that would be native enums on Postgres but
// are plain Strings on SQLite (see prisma/schema.prisma header comment).

export const SKILLS = ["READING", "LISTENING", "WRITING", "SPEAKING"] as const;
export type Skill = (typeof SKILLS)[number];

export const TOPICS = ["ARBEJDE", "UDDANNELSE", "HVERDAGSLIV", "MEDBORGERSKAB"] as const;
export type Topic = (typeof TOPICS)[number];

export const ITEM_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "GAP_FILL", "MATCHING"] as const;
export type ItemTypeCode = (typeof ITEM_TYPES)[number];

export const EXAM_TYPES = ["MODULTEST", "PD3"] as const;
export type ExamTypeCode = (typeof EXAM_TYPES)[number];

export const EXAM_STATUSES = ["IN_PROGRESS", "COMPLETED", "ABANDONED"] as const;
export type ExamStatusCode = (typeof EXAM_STATUSES)[number];

export const REPORT_CARD_STATUSES = [
  "PENDING_EXTRACTION",
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "REJECTED",
] as const;
export type ReportCardStatusCode = (typeof REPORT_CARD_STATUSES)[number];

export const MODULTEST_DISCIPLINES = ["mundtlig", "laesning", "skrivning"] as const;
export const PD3_DISCIPLINES = ["skriftlig", "mundtlig"] as const;

// Display labels for these enums are locale-aware — see
// lib/i18n/dictionaries/*.ts's `enums.skills` / `enums.topics`.
