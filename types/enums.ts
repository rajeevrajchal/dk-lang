// App-layer enums.
//
// These would be native enums on Postgres but are plain Strings on SQLite
// (see prisma/schema.prisma header comment), so the allowed values live in
// `as const` arrays in lib/constants.ts and the unions are derived from them
// here. The array stays next to the runtime validation that uses it; the type
// lives here with the rest of the shared types.
//
// Display labels for these enums are locale-aware — see
// lib/i18n/dictionaries/*.ts's `enums.skills` / `enums.topics`.

import type {
  EXAM_STATUSES,
  EXAM_TYPES,
  ITEM_TYPES,
  REPORT_CARD_STATUSES,
  SKILLS,
  TOPICS,
} from "@/lib/constants";

export type Skill = (typeof SKILLS)[number];
export type Topic = (typeof TOPICS)[number];
export type ItemTypeCode = (typeof ITEM_TYPES)[number];
export type ExamTypeCode = (typeof EXAM_TYPES)[number];
export type ExamStatusCode = (typeof EXAM_STATUSES)[number];
export type ReportCardStatusCode = (typeof REPORT_CARD_STATUSES)[number];
