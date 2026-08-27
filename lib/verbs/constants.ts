export const VERB_GROUPS = [1, 2, 3] as const;

/**
 * What a verb is about, for browsing 500 of them without scrolling.
 *
 * Kept deliberately coarse: a taxonomy fine enough to be interesting is too
 * fine to filter with, and the search box already handles "I want the verb
 * about borrowing".
 */
export const VERB_THEMES = [
  "core", // være, have, kunne — the ones everything is built from
  "everyday", // spise, sove, vaske
  "communication", // sige, spørge, forklare
  "movement", // gå, køre, rejse
  "thinking", // tro, huske, forstå
  "feeling", // elske, savne, ærgre
  "work", // arbejde, ansætte, søge
  "school", // lære, læse, øve
  "home", // bo, flytte, rydde
  "body", // sidde, løbe, trække
  "social", // møde, invitere, hjælpe
  "money", // betale, koste, spare
  "change", // blive, ændre, vokse
  "admin", // the Danish of forms, letters and appointments — the PD3 topics
  "time", // starting, lasting, arriving — the verbs a timetable is made of
] as const;

/**
 * The five ways a verb is practised.
 *
 * They are not interchangeable difficulty settings; they test different
 * things. Recognising "arbejde" means "work" is not the same as producing
 * "arbejder" in a sentence, and neither tells you whether the learner can form
 * the past tense — which is what the modultest actually asks for.
 */
export const VERB_PRACTICE_MODES = [
  "DA_EN", // Danish → English (recognition)
  "EN_DA", // English → Danish (production)
  "FILL_BLANK", // the verb, correctly inflected, into a real sentence
  "CHOOSE_VERB", // which verb fits this sentence
  "CONJUGATE", // give the past / perfect form
] as const;

/** How many questions one practice round serves. */
export const VERB_ROUND_SIZE = 10;
