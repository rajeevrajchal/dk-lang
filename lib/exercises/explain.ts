import { generateStructured } from "@/lib/ai/generate";
import { aiAvailable } from "@/lib/ai/registry";
import { z } from "zod";
import { extractExplainableText } from "./explainable";
import type { ExerciseVariant, ExplanationOutcome } from "@/types";

export { extractExplainableText };

// Post-test explanation of an opgave's Danish text.
//
// The variants already carry WHY each answer is right (the rationales and
// `why` fields shown in the results). What they don't carry is an explanation
// of the Danish itself — what each sentence means, how it is built, and what
// every word is doing. That is what this generates.
//
// It is generated rather than authored because the texts it has to explain are
// themselves generated, so there is nothing to write a glossary against ahead
// of time. Results are cached on the attempt: the same text never costs a
// second call.

export const ExplanationSchema = z.object({
  /** Plain-English summary of the whole text. */
  summary: z.string(),
  sentences: z
    .array(
      z.object({
        danish: z.string(),
        english: z.string(),
        /** How the sentence is built and why it is built that way. */
        structureNote: z.string(),
      })
    )
    .min(3)
    .max(40),
  words: z
    .array(
      z.object({
        surface: z.string(),
        lemma: z.string(),
        englishGloss: z.string(),
        partOfSpeech: z.string(),
        /** How this form arises and what it does with the words around it. */
        inflectionNote: z.string(),
      })
    )
    .min(10)
    .max(90),
});

const SYSTEM = `Du forklarer dansk for en voksen kursist på Danskuddannelse 3, Modul 2 (niveau A2), som læser engelsk flydende.

Forklaringerne skrives på ENGELSK, fordi kursisten skal kunne forstå dem uden besvær. De danske eksempler og citater bliver stående på dansk — det er dem, der skal læres.

Du forklarer, hvordan sproget faktisk fungerer: hvorfor verbet står, hvor det står, hvorfor et adjektiv har -t eller -e, hvad en endelse betyder, hvordan et ord skifter form sammen med andre ord. Aldrig blot en oversættelse.`;

const buildPrompt = (blocks: { label: string; danish: string }[], taskLabel: string): string => {
  const text = blocks.map((b) => `[${b.label}]\n${b.danish}`).join("\n\n");

  return `Here is the Danish text from ${taskLabel}. Explain it completely for the learner.

--- TEXT ---
${text}
--- END TEXT ---

Produce three things:

1. summary — what the text as a whole says, in plain English. A short paragraph.

2. sentences — go through the text sentence by sentence, in the order it appears. For each one give:
   - danish: the sentence exactly as it appears in the text
   - english: what it means
   - structureNote: how the sentence is built and why. Name the actual grammar at work — for example: the verb is second so the subject moved behind it; 'fordi' opens a subordinate clause, which is why 'ikke' sits in front of the verb; this is a 'bliver' + past participle passive, and 'af' marks who does it; '-t' on the adjective agrees with a neuter noun; this is the definite form, so the article is attached to the end of the noun.
   Cover every sentence in the text. If the text is long, still cover them all — do not summarise or skip.

3. words — the words worth explaining, in the order they first appear. For each:
   - surface: the exact form as it appears in the text
   - lemma: the dictionary form
   - englishGloss: what it means here
   - partOfSpeech: noun, verb, adjective, adverb, pronoun, conjunction, preposition, numeral
   - inflectionNote: how this form arises and what it does with the words around it. For example: present tense of 'at arbejde', formed by adding -er, and the same for every person; definite plural — patient → patienter → patienterne; past tense of the irregular 'at få'; neuter form of 'stor' (+t) agreeing with 'et bord'; reflexive possessive referring back to the subject.

   Include every word that carries meaning or shows an inflection worth noticing — nouns, verbs, adjectives, adverbs, pronouns, conjunctions. You may skip a word the second time it appears in exactly the same form. Do not skip a word just because it is common: 'er', 'har', 'og', 'men', 'når' all matter at this level.

Write every explanation in English. Keep the danish, surface and lemma fields in Danish.`;
};

export const explanationAvailable = (): boolean => {
  return aiAvailable();
};

/**
 * Generates the breakdown for one exercise's text.
 *
 * Streams, because a full sentence-and-word pass over a long opgave is a lot
 * of output and a non-streaming request would risk the HTTP timeout before the
 * first byte arrives. The awaited result is the same either way — this is
 * about the connection staying alive, not about rendering partial output.
 */
export const generateExplanation = async (
  variant: ExerciseVariant
): Promise<ExplanationOutcome> => {
  const blocks = extractExplainableText(variant);
  if (!blocks || blocks.length === 0) {
    return { explanation: null, reason: "this exercise has no continuous text to explain" };
  }

  const taskLabel = `${variant.title} (${variant.taskType})`;

  const { object, reason } = await generateStructured({
    task: "exercise-explanation",
    schema: ExplanationSchema,
    system: SYSTEM,
    prompt: buildPrompt(blocks, taskLabel),
    stream: true,
  });

  if (!object) {
    console.warn(`[explain] failed for ${variant.variantId}: ${reason}`);
    return { explanation: null, reason };
  }
  return { explanation: object };
};
