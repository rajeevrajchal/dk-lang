import { VERBS } from "./data";
import { VERB_THEMES } from "./constants";
import type { DanishVerb, VerbFilter, VerbTheme, VerbWithProgress } from "@/types";

export { VERBS } from "./data";
export * from "./constants";

// Reading the verb collection.
//
// Pure functions over the data, with no database and no React in sight, so the
// same code answers a server component rendering the browse page, an API route
// building a practice round, and a test.

export const VERB_BY_ID = new Map(VERBS.map((v) => [v.infinitive, v]));

export const verb = (id: string): DanishVerb | undefined => VERB_BY_ID.get(id);

/** All forms of a verb, for display and for the "which form is this?" lookup. */
export const verbForms = (v: DanishVerb): string[] => {
  return [v.infinitive, v.present, v.past, v.perfect];
};

/** How the verb is written out in a table: at arbejde — arbejder — arbejdede — har arbejdet. */
export const conjugationLine = (v: DanishVerb): string => {
  return `at ${v.infinitive} · ${v.present} · ${v.past} · ${v.auxiliary} ${v.perfect}`;
};

/**
 * The one-line rule behind this verb's forms.
 *
 * Written from the group rather than stored per verb: the whole point of the
 * group is that it generalises, and a learner who reads "this is a -te verb
 * like købe" has learned something that transfers to the next one.
 */
export const groupExplanation = (v: DanishVerb): string => {
  switch (v.group) {
    case 1:
      return `Group 1 (-ede / -et): the big regular class. Present ${v.present}, past ${v.past}, perfect ${v.auxiliary} ${v.perfect}. Any new verb Danish borrows joins this class.`;
    case 2:
      return `Group 2 (-te / -t): the other regular class. Present ${v.present}, past ${v.past}, perfect ${v.auxiliary} ${v.perfect}. Endings are shorter than group 1's, and there is no way to tell the two apart from the infinitive — it has to be learned with the verb.`;
    default:
      return `Irregular: the vowel changes rather than an ending being added. ${v.present} → ${v.past} → ${v.auxiliary} ${v.perfect}. There is no rule; these are learned one at a time, which is why they are the most common verbs in the language.`;
  }
};

/** Why this verb takes "er" rather than "har" in the perfect, when it does. */
export const auxiliaryNote = (v: DanishVerb): string | null => {
  if (v.auxiliary === "har") return null;
  return `Takes "er" in the perfect, not "har": jeg er ${v.perfect}. Danish uses "er" for verbs of motion and change of state — where the sentence is about arriving somewhere or becoming something rather than about doing something.`;
};

const matchesSearch = (v: DanishVerb, needle: string): boolean => {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return (
    v.infinitive.includes(q) ||
    v.english.toLowerCase().includes(q) ||
    v.present.includes(q) ||
    v.past.includes(q) ||
    v.perfect.includes(q) ||
    v.example.toLowerCase().includes(q) ||
    v.exampleEnglish.toLowerCase().includes(q)
  );
};

/**
 * Filter and search, over verbs already joined to this learner's progress.
 *
 * Takes the joined shape rather than raw verbs because "the ones I struggle
 * with" is a filter like any other, and splitting it out would mean two
 * filtering paths that drift.
 */
export const filterVerbs = (
  rows: VerbWithProgress[],
  filter: VerbFilter
): VerbWithProgress[] => {
  return rows.filter((row) => {
    if (filter.search && !matchesSearch(row.verb, filter.search)) return false;
    if (filter.theme && !row.verb.themes.includes(filter.theme)) return false;
    if (filter.group && row.verb.group !== filter.group) return false;
    switch (filter.status) {
      case "learned":
        return row.learned;
      case "unlearned":
        return !row.learned;
      case "struggling":
        return row.struggling;
      default:
        return true;
    }
  });
};

/** Practised at least twice and wrong more often than right. */
export const isStruggling = (correct: number, wrong: number): boolean => {
  return correct + wrong >= 2 && wrong > correct;
};

export const themeLabel = (theme: VerbTheme): string => {
  const labels: Record<VerbTheme, string> = {
    core: "Core verbs",
    everyday: "Everyday life",
    communication: "Talking & writing",
    movement: "Getting about",
    thinking: "Thinking & knowing",
    feeling: "Feelings",
    work: "Work",
    school: "School & learning",
    home: "Home",
    body: "Body & movement",
    social: "People",
    money: "Money & shopping",
    change: "Change & becoming",
    admin: "Forms & authorities",
    time: "Time & timetables",
  };
  return labels[theme];
};

export const ALL_THEMES = VERB_THEMES;
