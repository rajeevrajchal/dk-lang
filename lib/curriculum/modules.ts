export interface ModuleDef {
  id: number;
  slug: string;
  name: string;
  cefrGoal: string;
  description: string;
  isFinalExam: boolean;
  isOralOnly: boolean;
  order: number;
  topics: ("ARBEJDE" | "UDDANNELSE" | "HVERDAGSLIV" | "MEDBORGERSKAB")[];
  tiersSpanned: number[];
}

// The five-module map required by the structural spec. Modul 1 is oral-only
// (no reading/writing modultest). Modul 2-4 each end in a three-discipline
// modultest (mundtlig/læsning/skrivning). Modul 5 is not a routine
// modultest — it's Prøve i Dansk 3 (PD3), the final skriftlig+mundtlig exam
// at B2, modeled as its own higher-stakes simulation (isFinalExam: true).
//
// `description` is learner-facing (shown on the dashboard), so it's Danish
// like the rest of the app UI.
export const MODULES: ModuleDef[] = [
  {
    id: 1,
    slug: "modul-1",
    name: "Modul 1",
    cefrGoal: "A1 -> A2 (mundtligt grundlag)",
    description:
      "Kun mundtligt modul: grundlæggende præsentationer og hverdagsudtryk. Der findes ingen læse-/skriveprøve på dette niveau — uden for scope for den læsningsfokuserede byggerækkefølge, kun med her for moduloversigtens skyld.",
    isFinalExam: false,
    isOralOnly: true,
    order: 1,
    topics: ["HVERDAGSLIV"],
    tiersSpanned: [1],
  },
  {
    id: 2,
    slug: "modul-2",
    name: "Modul 2",
    cefrGoal: "A2 (tidligt)",
    description:
      "Første modul med en fuld tre-disciplin modultest: mundtlig kommunikation, læsning, skrivning. Læsning bevæger sig fra simple hovedsætninger i nutid (Tier 1) til datid, modalverber og én ledsætning (Tier 2), med mulighed for at strække sig til flere konnektorer og passiv (Tier 3) for elever, der rykker sig hurtigere.",
    isFinalExam: false,
    isOralOnly: false,
    order: 2,
    topics: ["ARBEJDE", "UDDANNELSE", "HVERDAGSLIV", "MEDBORGERSKAB"],
    tiersSpanned: [1, 2, 3],
  },
  {
    id: 3,
    slug: "modul-3",
    name: "Modul 3",
    cefrGoal: "A2 -> B1",
    description:
      "Modultest med de samme tre discipliner. Læsning centrerer sig om Tier 2-3: sikker datid, flere konnektorer, passiv og mere komplekse hverdags-/arbejdsemner.",
    isFinalExam: false,
    isOralOnly: false,
    order: 3,
    topics: ["ARBEJDE", "UDDANNELSE", "HVERDAGSLIV", "MEDBORGERSKAB"],
    tiersSpanned: [2, 3],
  },
  {
    id: 4,
    slug: "modul-4",
    name: "Modul 4",
    cefrGoal: "B1",
    description:
      "Modultest med de samme tre discipliner. Læsning bevæger sig ind i Tier 3-4: flere ledsætninger, passiv og et første strejf af abstrakt/argumenterende sprog forud for PD3.",
    isFinalExam: false,
    isOralOnly: false,
    order: 4,
    topics: ["ARBEJDE", "UDDANNELSE", "MEDBORGERSKAB"],
    tiersSpanned: [3, 4],
  },
  {
    id: 5,
    slug: "modul-5",
    name: "Modul 5 (PD3)",
    cefrGoal: "B2",
    description:
      "Prøve i Dansk 3 — den afsluttende eksamen, ikke en almindelig modultest. To dele: skriftlig og mundtlig, på B2-niveau. Læse-/skriveindhold er Tier 4: abstrakt/argumenterende sprog, indlejrede ledsætninger, holdningsstrukturer. Bygget som sin egen eksamens-simulering med højere indsats, adskilt fra Modul 2-4's mock modultest-flow.",
    isFinalExam: true,
    isOralOnly: false,
    order: 5,
    topics: ["ARBEJDE", "UDDANNELSE", "MEDBORGERSKAB"],
    tiersSpanned: [4],
  },
];

export const MODULE_BY_ID = new Map(MODULES.map((m) => [m.id, m]));
