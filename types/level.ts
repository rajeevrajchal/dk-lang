// What level the learner is at, and how we know.

import type {
  EDUCATIONS,
  LEVEL_SOURCES,
  OFFICIAL_RESULTS,
  TEST_TYPES,
} from "@/lib/level";

export type Education = (typeof EDUCATIONS)[number];
export type LevelSource = (typeof LEVEL_SOURCES)[number];
export type OfficialTestType = (typeof TEST_TYPES)[number];
export type OfficialResultOutcome = (typeof OFFICIAL_RESULTS)[number];

export interface UserLevel {
  education: Education | null;
  currentModule: number | null;
  levelSource: LevelSource | null;
  /** ISO timestamp. PostgREST returns timestamps as strings, not Dates. */
  levelSetAt: string | null;
  onboarded: boolean;
  /** True when the learner has never told us their level. */
  unset: boolean;
}

export interface OfficialResultInput {
  testType: OfficialTestType;
  education?: Education | null;
  module?: number | null;
  result?: OfficialResultOutcome | null;
  takenAt?: Date | null;
  note?: string | null;
  source?: "SELF_REPORTED" | "REPORT_CARD";
  reportCardId?: string | null;
}

/** A stored official result, as the settings screen lists it. */
export interface OfficialResultRow {
  id: string;
  testType: string;
  education: string | null;
  module: number | null;
  result: string | null;
  takenAt: string | null;
  source: string;
  note: string | null;
}
