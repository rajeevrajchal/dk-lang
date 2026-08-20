import type { ConstructDef } from "./types";

// Global construct catalogue. Every reading item is tagged with one or more
// of these codes so the weak-area engine can report "you drop to 40% on
// 'selvom'" instead of a generic "reading is weak". Tier 4 constructs are
// reserved for Modul 4/5 (PD3) content, not yet generated for Modul 2.
export const CONSTRUCTS: ConstructDef[] = [
  {
    code: "present-tense",
    name: "Nutid (præsens)",
    description: "Simple main clauses in the present tense.",
    tier: 1,
  },
  {
    code: "coordination:og-men-eller",
    name: "Sideordning (og/men/eller)",
    description: "Joining two main clauses with og, men, or eller.",
    tier: 1,
  },
  {
    code: "past-tense",
    name: "Datid",
    description: "Simple past tense verb forms.",
    tier: 2,
  },
  {
    code: "modal-verb",
    name: "Modalverbum",
    description: "Modal verbs: kan, skal, vil, må, bør.",
    tier: 2,
  },
  {
    code: "subordinate-clause:fordi",
    name: "Ledsætning med 'fordi'",
    description: "One subordinate clause introduced by 'fordi' (because).",
    tier: 2,
  },
  {
    code: "subordinate-clause:naar",
    name: "Ledsætning med 'når'",
    description: "One subordinate clause introduced by 'når' (when/whenever).",
    tier: 2,
  },
  {
    code: "subordinate-clause:at",
    name: "Ledsætning med 'at'",
    description: "One subordinate clause introduced by 'at' (that).",
    tier: 2,
  },
  {
    code: "passive-voice",
    name: "Passiv",
    description: "Passive voice constructions (-s forms or blive + past participle).",
    tier: 3,
  },
  {
    code: "connector:selvom",
    name: "Konnektor 'selvom'",
    description: "Concessive connector 'selvom' (even though).",
    tier: 3,
  },
  {
    code: "connector:derfor",
    name: "Konnektor 'derfor'",
    description: "Result connector 'derfor' (therefore).",
    tier: 3,
  },
  {
    code: "connector:dog",
    name: "Konnektor 'dog'",
    description: "Contrastive connector 'dog' (however).",
    tier: 3,
  },
  {
    code: "multiple-subordinate-clauses",
    name: "Flere ledsætninger",
    description: "Sentences with more than one subordinate clause.",
    tier: 3,
  },
  {
    code: "abstract-argumentative",
    name: "Abstrakt/argumenterende sprog",
    description: "Opinion/argument structures, nested clauses — B2/PD3 band.",
    tier: 4,
  },
];
