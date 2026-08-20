export interface TierDef {
  id: number;
  name: string;
  description: string;
}

export const TIERS: TierDef[] = [
  {
    id: 1,
    name: "Tier 1",
    description: "Simple main clauses, present tense, high-frequency vocabulary.",
  },
  {
    id: 2,
    name: "Tier 2",
    description: "Past tense, modal verbs, one subordinate clause (fordi/når/at).",
  },
  {
    id: 3,
    name: "Tier 3",
    description: "Multiple subordinate clauses, passive voice, wider connectors (selvom, derfor, dog).",
  },
  {
    id: 4,
    name: "Tier 4",
    description: "Abstract/argumentative language, nested clauses, opinion structures — B2/PD3 band.",
  },
];
