// Shared types for the offline/batch content generator. Nothing in this
// directory runs at request time — items are generated ahead of time (by
// hand today, optionally LLM-assisted later, see docs/content-validation.md)
// and loaded into the DB by prisma/seed.ts. A practice request never
// triggers a live generation call.

export type TierNumber = 1 | 2 | 3 | 4;

export type TopicCode =
  | "ARBEJDE"
  | "UDDANNELSE"
  | "HVERDAGSLIV"
  | "MEDBORGERSKAB";

export type ItemTypeCode =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "GAP_FILL"
  | "MATCHING";

export interface ConstructDef {
  code: string; // e.g. "subordinate-clause:fordi"
  name: string;
  description: string;
  tier: TierNumber;
}

export interface GeneratedReadingItem {
  tier: TierNumber;
  topic: TopicCode;
  constructs: string[]; // construct codes, must exist in constructs.ts
  type: ItemTypeCode;
  // Stable key shared by every item built on the same passage — survives
  // reseeds, unlike the DB row's generated id. Used to look up the
  // word/paragraph translation glossary (see modul2-glossary.ts).
  passageId?: string;
  passageText: string;
  promptText: string;
  // MULTIPLE_CHOICE: full option list, answer = exact matching string.
  // TRUE_FALSE: options = ["Sandt", "Falsk"], answer = one of them.
  // GAP_FILL: options = optional word bank, answer = accepted word(s).
  // MATCHING: options = { left: string[]; right: string[] }, answer =
  //   array of "leftIndex:rightIndex" pairs.
  options?: string[] | { left: string[]; right: string[] };
  answer: string[];
  explanation: string;
}
