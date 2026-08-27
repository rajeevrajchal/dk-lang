import { z } from "zod";
import { generateStructured } from "@/lib/ai/generate";
import { aiAvailable } from "@/lib/ai/registry";
import { translation as translationRepo } from "@/lib/repositories";
import { lookupAuthored } from "./lexicon";
import { MAX_TRANSLATION_CHARS } from "./constants";
import type {
  Translation,
  TranslationKey,
  TranslationKind,
  TranslationRequestItem,
} from "@/types";

// Translating Danish, in three tiers — cheapest first.
//
//   1. the app's own content        instant, free, offline (lib/translation/lexicon)
//   2. the shared cache             one indexed read
//   3. the model                    only when 1 and 2 both miss
//
// This is the same shape as lib/reading/explain.ts and for the same reason: a
// learner reads by clicking a lot of words, and a design that billed a model
// call for each one would be slow to use and expensive to run. What is
// different here is the SCOPE — reading explanations are tied to a library
// text and its authored data, and this works on any Danish string in the app,
// which is what makes translation available on an opgave, a verb example or a
// generated passage rather than only inside the reading library.

export const translationAvailable = (): boolean => aiAvailable();

const WordSchema = z.object({
  english: z.string(),
  baseForm: z.string().optional(),
  partOfSpeech: z.string().optional(),
  note: z.string().optional(),
});

const SentenceSchema = z.object({
  english: z.string(),
  literal: z.string().optional(),
  note: z.string().optional(),
  words: z.array(z.object({ danish: z.string(), english: z.string() })).max(40).optional(),
});

const SYSTEM = `You translate Danish for an adult learner preparing for the Danish modultest. You answer in ENGLISH; the Danish stays Danish, because the Danish is what is being learned.

Translate the sense USED HERE. Not every meaning the word can have — the one that applies in this sentence.

The English must be natural English. "Jeg står op klokken syv" is "I get up at seven", never "I stand up clock seven". When the word-for-word version shows something about how Danish is built, it goes in 'literal' beside the natural one; otherwise leave 'literal' out.

'note' is the part that teaches. One line: the form this word is in, the fixed expression it belongs to, or the preposition it takes. Leave it out rather than padding it — a note that says nothing is worse than no note.`;

const wordPrompt = (danish: string, context?: string): string => {
  return [
    `DANISH WORD: ${danish}`,
    context ? `IN THIS SENTENCE: ${context}` : null,
    "",
    "Give the English meaning of the word as it is used here, its dictionary form, its part of speech, and one line on the form it is in (tense, definite/plural, or the expression it belongs to).",
  ]
    .filter(Boolean)
    .join("\n");
};

const sentencePrompt = (danish: string): string => {
  return [
    `DANISH SENTENCE: ${danish}`,
    "",
    "Give the natural English meaning. Add 'literal' only if the word-for-word version teaches something about Danish word order or a fixed expression. Add 'words' with each Danish word and what it means here, so the learner can line the two up. Add 'note' only if one line of grammar genuinely helps.",
  ].join("\n");
};

const generate = async (
  item: TranslationRequestItem,
  level: number
): Promise<Translation | null> => {
  if (item.kind === "WORD") {
    const { object, reason } = await generateStructured({
      // The same task config the reading gloss uses: low effort, hard token
      // cap. A request that cannot run long cannot lecture.
      task: "reading-explanation",
      schema: WordSchema,
      system: SYSTEM,
      prompt: wordPrompt(item.danish, item.context),
    });
    if (!object) {
      console.warn(`[translation] word failed: ${reason}`);
      return null;
    }
    return { kind: "WORD", danish: item.danish, ...object, source: "generated" };
  }

  const { object, reason } = await generateStructured({
    task: "reading-explanation-deep",
    schema: SentenceSchema,
    system: SYSTEM,
    prompt: sentencePrompt(item.danish),
  });
  if (!object) {
    console.warn(`[translation] sentence failed: ${reason}`);
    return null;
  }
  void level;
  return { kind: "SENTENCE", danish: item.danish, ...object, source: "generated" };
};

const key = (item: TranslationRequestItem, level: number): TranslationKey => ({
  kind: item.kind as TranslationKind,
  level,
  danish: item.danish,
});

/**
 * Translate a batch.
 *
 * A batch rather than one call per piece because the caller's real unit is
 * "this opgave" or "this paragraph": translating twelve sentences one request
 * at a time is twelve round trips and twelve chances to half-fail. Items that
 * cannot be translated come back as null in place rather than failing the
 * batch — a missing sentence should not take the other eleven with it.
 */
export const translateMany = async (
  items: TranslationRequestItem[],
  level: number
): Promise<(Translation | null)[]> => {
  const results: (Translation | null)[] = new Array(items.length).fill(null);

  // Tier 1 — the app already knows.
  const unresolved: number[] = [];
  items.forEach((item, i) => {
    if (item.danish.trim().length === 0 || item.danish.length > MAX_TRANSLATION_CHARS) return;
    const authored = lookupAuthored(item.danish, item.kind);
    if (authored) results[i] = authored;
    else unresolved.push(i);
  });
  if (unresolved.length === 0) return results;

  // Tier 2 — somebody has asked this before.
  const cached = await translationRepo.findCachedMany(
    unresolved.map((i) => key(items[i], level))
  );
  const stillMissing: number[] = [];
  for (const i of unresolved) {
    const hit = cached.get(translationRepo.translationHash(key(items[i], level)));
    if (hit) results[i] = hit;
    else stillMissing.push(i);
  }
  if (stillMissing.length === 0 || !translationAvailable()) return results;

  // Tier 3 — generate. Run together: these are independent, and a paragraph of
  // sentences translated in series would take as long as the sum of its parts.
  const generated = await Promise.all(
    stillMissing.map((i) => generate(items[i], level).catch(() => null))
  );
  await Promise.all(
    generated.map(async (t, n) => {
      const i = stillMissing[n];
      if (!t) return;
      results[i] = t;
      await translationRepo.cache(key(items[i], level), t);
    })
  );

  return results;
};

export const translate = async (
  item: TranslationRequestItem,
  level: number
): Promise<Translation | null> => {
  const [result] = await translateMany([item], level);
  return result;
};
