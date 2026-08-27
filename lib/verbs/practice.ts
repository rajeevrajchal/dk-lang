import { VERB_BY_ID, VERBS, auxiliaryNote, groupExplanation } from "./index";
import { VERB_PRACTICE_MODES, VERB_ROUND_SIZE } from "./constants";
import type {
  DanishVerb,
  VerbPracticeMode,
  VerbQuestion,
  VerbWithProgress,
} from "@/types";

// Building a round of verb practice.
//
// Deterministic and offline: every question here is derived from data the app
// already ships, so a round costs no API call, cannot fail halfway through, and
// works with no keys configured. That is not a saving so much as a product
// decision — verb drill is the thing a learner does for five minutes on a bus,
// and it has to start instantly.
//
// WHICH VERBS COME BACK is the part that does the teaching. The selection is
// weighted, not random:
//
//   1. verbs this learner has got wrong more often than right       (repair)
//   2. verbs due for review, oldest first                           (retention)
//   3. verbs never practised, most common first                     (coverage)
//
// A round is mostly (1) and (2) when there is anything there, because a
// learner who keeps meeting "at vælge" until it sticks learns more than one
// who meets five hundred verbs once each.

/** Deterministic PRNG, so a seed reproduces a round exactly (and tests can). */
const rng = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
};

const shuffle = <T>(items: T[], next: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// ---------------------------------------------------------------------------
// Choosing what to practise
// ---------------------------------------------------------------------------

export const selectVerbsForRound = (
  progress: VerbWithProgress[],
  count = VERB_ROUND_SIZE,
  now: Date = new Date(),
  seed = Date.now()
): DanishVerb[] => {
  const next = rng(seed);
  const byId = new Map(progress.map((p) => [p.verb.infinitive, p]));

  const struggling = progress.filter((p) => p.struggling);
  const due = progress.filter(
    (p) =>
      !p.struggling &&
      p.lastPracticedAt !== null &&
      // Anything practised more than a day ago is fair game for review; the
      // per-verb SRS interval is applied by the repository when it marks a
      // verb due, so this is the coarse fallback for verbs with no interval.
      new Date(p.lastPracticedAt).getTime() < now.getTime() - 24 * 60 * 60 * 1000
  );
  // Never practised, and not marked learned by the learner: introduce the most
  // common first, because frequency is what makes a verb worth knowing.
  const fresh = VERBS.filter((v) => {
    const p = byId.get(v.infinitive);
    return !p || (p.lastPracticedAt === null && !p.learned);
  }).sort((a, b) => a.rank - b.rank);

  const picked: DanishVerb[] = [];
  const take = (vs: DanishVerb[], n: number) => {
    for (const v of vs) {
      if (picked.length >= count) return;
      if (n-- <= 0) return;
      if (!picked.some((p) => p.infinitive === v.infinitive)) picked.push(v);
    }
  };

  // Half the round on repair, a quarter on review, the rest new — and every
  // share falls through to the next when it is empty, so a first-ever round is
  // simply ten new verbs.
  take(shuffle(struggling.map((p) => p.verb), next), Math.ceil(count / 2));
  take(shuffle(due.map((p) => p.verb), next), Math.ceil(count / 4));
  take(fresh, count);
  // Still short (a learner who has met everything): fill from the least
  // recently practised.
  if (picked.length < count) {
    const rest = [...progress]
      .sort(
        (a, b) =>
          new Date(a.lastPracticedAt ?? 0).getTime() -
          new Date(b.lastPracticedAt ?? 0).getTime()
      )
      .map((p) => p.verb);
    take(rest, count);
  }

  return picked.slice(0, count);
};

// ---------------------------------------------------------------------------
// Turning a verb into a question
// ---------------------------------------------------------------------------

/** Distractors that are plausible: same group and theme where possible. */
const distractors = (
  target: DanishVerb,
  pick: (v: DanishVerb) => string,
  next: () => number,
  n = 3
): string[] => {
  const answer = pick(target);
  const sameTheme = VERBS.filter(
    (v) => v.infinitive !== target.infinitive && v.themes.some((t) => target.themes.includes(t))
  );
  const pool = shuffle(sameTheme.length >= n * 3 ? sameTheme : VERBS, next);
  const out: string[] = [];
  for (const v of pool) {
    if (out.length >= n) break;
    const candidate = pick(v);
    if (candidate !== answer && !out.includes(candidate)) out.push(candidate);
  }
  return out;
};

/** Wrong conjugations, built from the other classes' rules — the real mistakes. */
const conjugationDistractors = (v: DanishVerb, correct: string): string[] => {
  const base = v.infinitive.endsWith("e") ? v.infinitive.slice(0, -1) : v.infinitive;
  const candidates = [
    `${base}ede`,
    `${base}te`,
    `${base}et`,
    `${base}t`,
    v.present,
    v.infinitive,
  ];
  return [...new Set(candidates)].filter((c) => c !== correct).slice(0, 3);
};

const blankOut = (sentence: string, form: string): string | null => {
  // Word-boundary match so "gik" does not blank the "gik" inside another word.
  const pattern = new RegExp(`(^|[^\\p{L}])(${form})(?=[^\\p{L}]|$)`, "iu");
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, (_m, before) => `${before}______`);
};

const formsOf = (v: DanishVerb): { form: string; label: string }[] => [
  { form: v.present, label: "present" },
  { form: v.past, label: "past" },
  { form: v.perfect, label: "perfect" },
  { form: v.infinitive, label: "infinitive" },
];

/** Which form of the verb the example sentence actually uses, if any. */
const formUsedInExample = (v: DanishVerb): { form: string; label: string } | null => {
  return formsOf(v).find((f) => blankOut(v.example, f.form) !== null) ?? null;
};

export const buildQuestion = (
  v: DanishVerb,
  mode: VerbPracticeMode,
  next: () => number,
  /**
   * Pins the sub-variant of a mode that has one — which tense CONJUGATE asks
   * for, which form FILL_BLANK removes. Supplied when rebuilding a question
   * from its key so that marking an answer server-side reconstructs exactly
   * the question the learner saw, rather than a fresh roll of the dice.
   */
  variant?: string
): VerbQuestion => {
  const key = (m: VerbPracticeMode) => `verb:${v.infinitive}:${m}`;

  switch (mode) {
    case "DA_EN":
      return {
        questionKey: key(mode),
        verbId: v.infinitive,
        mode,
        prompt: `What does “at ${v.infinitive}” mean?`,
        danish: `at ${v.infinitive}`,
        options: shuffle([v.english, ...distractors(v, (x) => x.english, next)], next),
        answer: v.english,
        explanation: `“at ${v.infinitive}” means “to ${v.english}”. ${v.example} — ${v.exampleEnglish}${v.usage ? ` ${v.usage}` : ""}`,
      };

    case "EN_DA":
      return {
        questionKey: key(mode),
        verbId: v.infinitive,
        mode,
        prompt: `How do you say “to ${v.english}” in Danish?`,
        answer: v.infinitive,
        // The learner has almost certainly typed the "at". Accepting it is not
        // leniency: "at arbejde" is the correct citation form.
        alsoAccept: [`at ${v.infinitive}`],
        explanation: `“to ${v.english}” is “at ${v.infinitive}”. ${v.example} — ${v.exampleEnglish}`,
      };

    case "FILL_BLANK": {
      const used = variant
        ? (formsOf(v).find((f) => f.label === variant) ?? null)
        : formUsedInExample(v);
      // A pinned variant that no longer appears in the sentence would produce
      // a gap that cannot be filled, so it falls through like any other miss.
      if (used && blankOut(v.example, used.form) === null) return buildQuestion(v, "EN_DA", next);
      // No form of the verb appears in its own example (a fixed expression, or
      // an irregular the sentence uses differently) — fall back to the mode
      // that always works rather than serving a broken gap.
      if (!used) return buildQuestion(v, "EN_DA", next);
      const gapped = blankOut(v.example, used.form)!;
      return {
        questionKey: `${key(mode)}:${used.label}`,
        verbId: v.infinitive,
        mode,
        prompt: `Put “at ${v.infinitive}” into the gap, in the right form.`,
        danish: gapped,
        answer: used.form,
        explanation: `${v.example} — ${v.exampleEnglish} The sentence needs the ${used.label} form, ${used.form}. ${groupExplanation(v)}`,
      };
    }

    case "CHOOSE_VERB": {
      const used = formUsedInExample(v);
      if (!used) return buildQuestion(v, "DA_EN", next);
      const gapped = blankOut(v.example, used.form)!;
      return {
        questionKey: `${key(mode)}`,
        verbId: v.infinitive,
        mode,
        prompt: "Which verb fits the sentence?",
        danish: gapped,
        options: shuffle(
          [used.form, ...distractors(v, (x) => (used.label === "past" ? x.past : x.present), next)],
          next
        ),
        answer: used.form,
        explanation: `${v.example} — ${v.exampleEnglish}${v.usage ? ` ${v.usage}` : ""}`,
      };
    }

    case "CONJUGATE": {
      // The past is the form Danish learners get wrong, so it is asked for
      // twice as often as the perfect.
      const askPast = variant ? variant === "past" : next() < 0.66;
      const answer = askPast ? v.past : v.perfect;
      const label = askPast ? "past tense (datid)" : "perfect (førnutid, after har/er)";
      const aux = auxiliaryNote(v);
      return {
        questionKey: `${key(mode)}:${askPast ? "past" : "perfect"}`,
        verbId: v.infinitive,
        mode,
        prompt: `Give the ${label} of “at ${v.infinitive}”.`,
        danish: `at ${v.infinitive} → ${v.present} → ______`,
        options: shuffle([answer, ...conjugationDistractors(v, answer)], next),
        answer,
        alsoAccept: askPast ? [] : [`${v.auxiliary} ${v.perfect}`],
        explanation: `at ${v.infinitive} · ${v.present} · ${v.past} · ${v.auxiliary} ${v.perfect}. ${groupExplanation(v)}${aux ? ` ${aux}` : ""}`,
      };
    }
  }
};

/**
 * A whole round.
 *
 * Modes are spread across the round rather than chosen per question at random,
 * so a learner always meets a mix: recognising a verb and producing one are
 * different skills and a round of ten that happened to be all recognition
 * would measure only half of what it looks like it measures.
 */
export const buildRound = (
  verbs: DanishVerb[],
  modes: readonly VerbPracticeMode[] = VERB_PRACTICE_MODES,
  seed = Date.now()
): VerbQuestion[] => {
  const next = rng(seed);
  const usable = modes.length > 0 ? modes : VERB_PRACTICE_MODES;
  return verbs.map((v, i) => buildQuestion(v, usable[i % usable.length], next));
};

// ---------------------------------------------------------------------------
// Marking
// ---------------------------------------------------------------------------

const normalise = (s: string): string => {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"']/gu, "")
    .replace(/\s+/g, " ");
};

/** Marking is lenient about punctuation and case, and strict about spelling. */
export const isAnswerCorrect = (question: VerbQuestion, given: string): boolean => {
  const g = normalise(given);
  if (!g) return false;
  return [question.answer, ...(question.alsoAccept ?? [])].some((a) => normalise(a) === g);
};

/**
 * Rebuild a question from its key, so an answer can be marked server-side.
 *
 * The key carries everything the question depends on — the verb, the mode and
 * the sub-variant — which is why marking never has to trust an answer sent up
 * from the browser. The only thing not reproduced is the ORDER of the
 * multiple-choice options, and that does not affect what is correct.
 */
export const questionFromKey = (questionKey: string, seed = 1): VerbQuestion | null => {
  const [prefix, verbId, mode, variant] = questionKey.split(":");
  if (prefix !== "verb" || !verbId || !mode) return null;
  const v = VERB_BY_ID.get(verbId);
  if (!v) return null;
  if (!(VERB_PRACTICE_MODES as readonly string[]).includes(mode)) return null;
  return buildQuestion(v, mode as VerbPracticeMode, rng(seed), variant);
};
