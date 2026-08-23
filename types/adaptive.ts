// The adaptive/construct engine: what the learner has shown they can do, and
// which Items to put in front of them next.

import type { ItemTypeCode } from "./enums";

export interface ConstructStat {
  constructId: string;
  code: string;
  name: string;
  tierId: number;
  correctCount: number;
  totalCount: number;
  accuracy: number | null; // null = no attempts yet
}

export type TierReason =
  | { key: "noAttemptsStartTier2" }
  | { key: "heldAtTier"; tier: number; construct: string; pct: number }
  | { key: "establishingData"; tier: number }
  | { key: "tierNotSolid"; tier: number; threshold: number }
  | { key: "allTiersSolid" };

/** One Item, as the practice runner receives it over the API. */
export interface PracticeItem {
  id: string;
  tierId: number;
  type: ItemTypeCode;
  topic: string;
  passageText: string | null;
  passageId: string | null;
  promptText: string;
  optionsJson: string | null;
  constructs: { id: string; code: string; name: string }[];
}

/**
 * The same Item as the selection engine assembles it, where `type` is still
 * the raw database column rather than a validated code.
 */
export type PracticeItemRow = Omit<PracticeItem, "type"> & { type: string };

/** An exam item: a practice item without the construct labels the runner hides. */
export type ExamItem = Omit<PracticeItem, "constructs">;

/** MATCHING items carry their two columns here rather than a flat option list. */
export interface MatchingOptions {
  left: string[];
  right: string[];
}
