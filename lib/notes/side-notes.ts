import type { SideNote, SideNoteContext } from "@/types";

// Quick side notes — the short thing worth knowing at the moment it is
// relevant.
//
// The constraint that shapes this file is "they should not overwhelm the main
// content". So: a note is one sentence plus at most one example, notes are
// matched to a CONTEXT rather than shown everywhere, and no surface shows more
// than two at a time. A panel of eight tips beside an exercise is wallpaper.
//
// Authored rather than generated, for the same reason the curriculum is: these
// are the things a Danish teacher says twice a week, they do not change, and a
// model asked to produce them on demand would produce a different one each
// time — which is precisely what stops a tip from sticking.

export const SIDE_NOTE_KINDS = [
  "grammar",
  "expression",
  "vocabulary",
  "mistake",
  "confusable",
  "exam",
] as const;

const note = (
  id: string,
  kind: (typeof SIDE_NOTE_KINDS)[number],
  title: string,
  body: string,
  match: SideNote["match"],
  example?: { danish: string; english: string }
): SideNote => ({ id, kind, title, body, match, example });

export const SIDE_NOTES: SideNote[] = [
  // --- word order: the thing that separates a Danish learner from a fluent
  // one, and the thing the modultest tests hardest ---------------------------
  note(
    "v2",
    "grammar",
    "The verb comes second",
    "In a Danish main clause the verb is the second element — not the second word, the second building block. Start the sentence with anything other than the subject and the subject moves behind the verb.",
    { topics: ["word-order"], taskTypes: ["reading_task_2_wrong_sentence", "reading_task_3_missing_words"] },
    { danish: "I morgen tager jeg bussen.", english: "Tomorrow I take the bus. (not “I morgen jeg tager…”)" }
  ),
  note(
    "ikke-position",
    "grammar",
    "Where “ikke” goes",
    "In a main clause “ikke” comes after the verb; in a subordinate clause (after at, fordi, hvis, når) it comes before it. This swap is the most common word-order mistake at Modul 2–3.",
    { topics: ["negation", "word-order", "subordinate-clause"] },
    { danish: "Jeg kommer ikke. · … fordi jeg ikke kommer.", english: "I'm not coming. · … because I'm not coming." }
  ),
  note(
    "subordinate-order",
    "grammar",
    "Subordinate clauses keep the subject first",
    "After at, fordi, hvis, når, som and da, the subject stays in front of the verb even if the clause starts the sentence.",
    { topics: ["subordinate-clause"] },
    { danish: "Hvis det regner, bliver vi hjemme.", english: "If it rains, we'll stay at home." }
  ),

  // --- verbs ---------------------------------------------------------------
  note(
    "present-one-form",
    "grammar",
    "One present tense for everybody",
    "Danish verbs do not change for person. jeg arbejder, du arbejder, han arbejder, vi arbejder — one form, always ending in -r.",
    { topics: ["verb-tense"] }
  ),
  note(
    "past-two-classes",
    "grammar",
    "Two regular past tenses",
    "Regular Danish verbs take either -ede (arbejdede) or -te (købte). Nothing in the infinitive tells you which, so the class is learned with the verb — that is why the verb list shows it.",
    { topics: ["verb-tense"], surfaces: ["verbs"] }
  ),
  note(
    "er-perfect",
    "grammar",
    "“er” or “har” in the perfect",
    "Verbs of motion and change of state take er, not har: jeg er gået, hun er kommet, det er sket. Everything else takes har.",
    { topics: ["verb-tense"], surfaces: ["verbs"] },
    { danish: "Jeg er gået hjem. · Jeg har spist.", english: "I have gone home. · I have eaten." }
  ),
  note(
    "modal-no-at",
    "grammar",
    "No “at” after a modal",
    "kan, skal, vil, må and bør are followed by the bare infinitive. “Jeg kan tale dansk”, never “Jeg kan at tale dansk”.",
    { topics: ["modal-verbs"] }
  ),

  // --- nouns ---------------------------------------------------------------
  note(
    "en-et",
    "grammar",
    "en-words and et-words",
    "Every Danish noun is either an en-word or an et-word, and the gender decides the article, the definite ending and the adjective ending. Learn the gender with the word, not afterwards.",
    { topics: ["noun-gender", "definite-form"] },
    { danish: "en bil → bilen · et hus → huset", english: "a car → the car · a house → the house" }
  ),
  note(
    "definite-suffix",
    "grammar",
    "“The” is an ending, not a word",
    "Danish puts the definite article on the end of the noun: huset, bilen, børnene. A separate “den/det” appears only when there is an adjective: det store hus.",
    { topics: ["definite-form"] }
  ),

  // --- confusables ---------------------------------------------------------
  note(
    "vide-kende",
    "confusable",
    "vide vs. kende",
    "“vide” is knowing a fact; “kende” is knowing a person or a place. English uses “know” for both, which is why this one keeps going wrong.",
    { topics: ["vocabulary"], surfaces: ["verbs"] },
    { danish: "Jeg ved, hvor hun bor. · Jeg kender hende.", english: "I know where she lives. · I know her." }
  ),
  note(
    "bo-leve",
    "confusable",
    "bo vs. leve",
    "“bo” is where you live; “leve” is being alive or how you live.",
    { topics: ["vocabulary"], surfaces: ["verbs"] },
    { danish: "Jeg bor i Odense. · Han levede i 90 år.", english: "I live in Odense. · He lived for 90 years." }
  ),
  note(
    "synes-tro-mene",
    "confusable",
    "synes, tro and mene",
    "“synes” is your impression of something you have experienced, “tro” is a guess you are not sure about, “mene” is a considered opinion.",
    { topics: ["vocabulary"] },
    { danish: "Jeg synes, filmen var god. · Jeg tror, det regner. · Jeg mener, prisen er for høj.", english: "I thought the film was good. · I think it's raining. · I think the price is too high." }
  ),
  note(
    "laere-both-ways",
    "confusable",
    "“lære” goes both ways",
    "“at lære” is both to learn and to teach. Which one it is comes from the sentence: lære dansk (learn), lære nogen at svømme (teach).",
    { topics: ["vocabulary"], surfaces: ["verbs"] }
  ),

  // --- expressions ---------------------------------------------------------
  note(
    "glaede-sig-til",
    "expression",
    "How to say “look forward to”",
    "Danish uses a reflexive: glæde SIG TIL. Both parts are required, and “til” is what makes it about the future.",
    { topics: ["fixed-expression"] },
    { danish: "Jeg glæder mig til ferien.", english: "I'm looking forward to the holiday." }
  ),
  note(
    "hvordan-gaar-det",
    "expression",
    "Asking how someone is",
    "“Hvordan går det?” or “Hvordan har du det?”. The answer is “Det går godt” or “Jeg har det godt” — not “Jeg er god”, which means you are a good person.",
    { topics: ["fixed-expression"] }
  ),
  note(
    "jeg-fryser",
    "expression",
    "Being cold and being hot",
    "“Jeg fryser” = I'm cold. “Jeg er kold” means you are a cold person. Same trap with “Jeg har det varmt”.",
    { topics: ["fixed-expression"] }
  ),
  note(
    "bede-om",
    "expression",
    "Asking for things politely",
    "“Må jeg bede om …” is the standard polite request in a shop or a café. “Jeg vil have” is a demand and sounds rude.",
    { topics: ["fixed-expression"], surfaces: ["speaking"] }
  ),

  // --- exam strategy -------------------------------------------------------
  note(
    "opgave1-all-conditions",
    "exam",
    "Opgave 1: check every condition",
    "Each person states two or three conditions. The distractor satisfies most of them; the answer satisfies all. When two adverts look possible, find the condition that separates them.",
    { taskTypes: ["reading_task_1_matching"] }
  ),
  note(
    "opgave2-contradiction",
    "exam",
    "Opgave 2: look for the contradiction",
    "The odd sentence is not the strangest one — it is the one that says the opposite of something else in the paragraph. Find the sentence it clashes with, not the sentence that sounds unusual.",
    { taskTypes: ["reading_task_2_wrong_sentence"] }
  ),
  note(
    "opgave3-grammar-first",
    "exam",
    "Opgave 3: let grammar narrow it down",
    "Before thinking about meaning, ask what KIND of word the gap needs — noun, verb, adjective — and whether the article or preposition before it rules options out. That usually leaves two.",
    { taskTypes: ["reading_task_3_missing_words"] }
  ),
  note(
    "opgave4-one-detail",
    "exam",
    "Opgave 4: one detail decides it",
    "Two of the three people usually mention the topic. Only one of them says the specific thing the question asks about — underline that detail rather than choosing on general impression.",
    { taskTypes: ["reading_task_4_people_matching"] }
  ),
  note(
    "read-questions-first",
    "exam",
    "Read the questions before the text",
    "In the reading test you are looking for specific information, not reading for pleasure. Knowing what you are looking for before you start saves more time than reading fast does.",
    { surfaces: ["reading"] }
  ),
  note(
    "never-leave-blank",
    "exam",
    "Never leave an answer blank",
    "Nothing is deducted for a wrong answer in the modultest. An unanswered question is a guaranteed zero; a guess between two options is not.",
    { surfaces: ["reading", "mock"] }
  ),
  note(
    "verb-forms-in-writing",
    "mistake",
    "Check your verb endings before you hand in",
    "The most common written mistakes at Modul 2–3 are a missing -r in the present tense and a past tense borrowed from the wrong class. Read your answer once looking only at the verbs.",
    { surfaces: ["writing"] }
  ),
];

const matches = (n: SideNote, ctx: SideNoteContext): boolean => {
  const { match } = n;
  if (match.taskTypes && ctx.taskType && match.taskTypes.includes(ctx.taskType)) return true;
  if (match.topics && ctx.topics?.some((t) => match.topics!.includes(t))) return true;
  if (match.surfaces && ctx.surface && match.surfaces.includes(ctx.surface)) return true;
  return false;
};

/**
 * The notes worth showing here.
 *
 * Capped, and the cap is the feature: two notes get read, eight get scrolled
 * past. Ordering puts an exam-strategy note first when the learner is in an
 * exercise, because that is the one that changes what they do next.
 */
export const notesFor = (ctx: SideNoteContext, limit = 2): SideNote[] => {
  const found = SIDE_NOTES.filter((n) => matches(n, ctx));
  const rank = (n: SideNote) => (n.kind === "exam" ? 0 : n.kind === "mistake" ? 1 : 2);
  return found.sort((a, b) => rank(a) - rank(b)).slice(0, limit);
};

export const noteById = (id: string): SideNote | undefined => {
  return SIDE_NOTES.find((n) => n.id === id);
};
