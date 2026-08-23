import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Gloss, LearningText } from "@/lib/learning/text";
import { glossaryIndex, lookupKey } from "@/lib/learning/text";

// Explaining a piece of a text on demand.
//
// The rule this file exists to enforce: DO NOT CALL THE MODEL WHEN THE TEXT
// ALREADY ANSWERS THE QUESTION. Every library text ships with a glossary, a
// translation for every sentence and a translation for every paragraph. A
// learner clicking a glossed word must get an instant, free, offline answer —
// `answerFromText` below returns it, and the route only reaches for the API
// when that returns null.
//
// What genuinely needs generating is the long tail: a word nobody wrote a
// gloss for, a phrase the learner selected themselves, "why is it written like
// this?", and the deeper follow-up when the short answer was not enough.

export const EXPLANATION_SCOPES = ["WORD", "PHRASE", "SENTENCE", "PARAGRAPH", "TEXT"] as const;
export type ExplanationScope = (typeof EXPLANATION_SCOPES)[number];

export const EXPLANATION_DEPTHS = ["DEFAULT", "DEEP"] as const;
export type ExplanationDepth = (typeof EXPLANATION_DEPTHS)[number];

// ---------------------------------------------------------------------------
// What an explanation looks like
//
// Short by default. A learner who clicked one word wants a line, not a
// lecture — so `summary` is the answer and everything else is optional detail
// the UI keeps folded until they ask.
// ---------------------------------------------------------------------------

export const ExplanationSchema = z.object({
  /** The answer, in one or two sentences. This is what gets shown first. */
  summary: z.string(),
  /** Natural English meaning of the selection. */
  meaning: z.string().optional(),
  /**
   * Word-for-word rendering, only when it differs from the natural meaning and
   * seeing the difference teaches something — "I stand up clock seven" next to
   * "I get up at seven" shows how the Danish is put together.
   */
  literal: z.string().optional(),
  /** Dictionary form, for a word or a phrase. */
  baseForm: z.string().optional(),
  partOfSpeech: z.string().optional(),
  /** How this form arises. One or two sentences, not a paradigm. */
  grammar: z.string().optional(),
  /** How the sentence is put together, part by part. */
  structure: z
    .array(z.object({ part: z.string(), role: z.string() }))
    .max(8)
    .optional(),
  /** Other Danish sentences using the same thing. */
  examples: z.array(z.string()).max(3).optional(),
  /** Grammar worth reviewing, as construct codes the app already knows. */
  relatedConstructs: z.array(z.string()).max(3).optional(),
});

export type ReadingExplanation = z.infer<typeof ExplanationSchema>;

// ---------------------------------------------------------------------------
// The free path: answer from what the text already carries
// ---------------------------------------------------------------------------

export interface TextScope {
  kind: ExplanationScope;
  /** Sentence index, paragraph index, or the selected string. */
  id: string;
  /** The Danish that was selected. */
  selection: string;
}

/**
 * Answers from the text's own authored data, or returns null when it cannot.
 *
 * A glossed word, a sentence with a translation, a paragraph with a
 * translation — all of these are already written down. Sending them to a
 * model would be slower, cost money and produce a worse answer than the one a
 * human wrote for this exact text.
 */
export function answerFromText(
  text: LearningText,
  scope: TextScope
): ReadingExplanation | null {
  switch (scope.kind) {
    case "WORD": {
      const gloss = glossaryIndex(text.glossary ?? []).get(lookupKey(scope.selection));
      return gloss ? fromGloss(gloss) : null;
    }

    case "SENTENCE": {
      const sentence = sentenceAt(text, Number(scope.id));
      if (!sentence) return null;
      return {
        summary: sentence.english,
        meaning: sentence.english,
        grammar: sentence.structureNote,
        relatedConstructs: sentence.constructCodes,
      };
    }

    case "PARAGRAPH": {
      const paragraph = text.paragraphs[Number(scope.id)];
      if (!paragraph) return null;
      return {
        summary: paragraph.translation,
        meaning: paragraph.translation,
        relatedConstructs: [
          ...new Set(paragraph.sentences.flatMap((s) => s.constructCodes ?? [])),
        ].slice(0, 3),
      };
    }

    case "TEXT":
      return { summary: text.summary, meaning: text.summary };

    // A phrase the learner picked out themselves is by definition not in the
    // glossary — nobody knew they would select it.
    case "PHRASE":
      return null;
  }
}

export function fromGloss(gloss: Gloss): ReadingExplanation {
  return {
    summary: gloss.englishGloss,
    meaning: gloss.englishGloss,
    baseForm: gloss.lemma,
    partOfSpeech: gloss.partOfSpeech,
    grammar: gloss.inflectionNote,
  };
}

function sentenceAt(text: LearningText, index: number) {
  return text.paragraphs.flatMap((p) => p.sentences)[index];
}

/** The sentence a selection sits in, for giving the model its context. */
export function contextFor(
  text: LearningText,
  scope: TextScope
): { sentence?: string; paragraph?: string } {
  const sentences = text.paragraphs.flatMap((p) => p.sentences);

  if (scope.kind === "SENTENCE") {
    const s = sentences[Number(scope.id)];
    return { sentence: s?.danish };
  }
  if (scope.kind === "PARAGRAPH") {
    const p = text.paragraphs[Number(scope.id)];
    return { paragraph: p?.sentences.map((s) => s.danish).join(" ") };
  }
  // A word or a phrase: find the first sentence containing it, and the
  // paragraph around that.
  const needle = scope.selection.toLowerCase();
  for (const paragraph of text.paragraphs) {
    for (const s of paragraph.sentences) {
      if (s.danish.toLowerCase().includes(needle)) {
        return {
          sentence: s.danish,
          paragraph: paragraph.sentences.map((x) => x.danish).join(" "),
        };
      }
    }
  }
  return {};
}

// ---------------------------------------------------------------------------
// The generated path
// ---------------------------------------------------------------------------

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}

export function generationAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM = `Du hjælper en voksen kursist, der læser dansk. Kursisten læser engelsk flydende, så forklaringerne skrives på ENGELSK. Det danske bliver stående på dansk — det er dét, der skal læres.

Du svarer KORT. Kursisten har klikket på ét ord eller én sætning midt i en tekst og vil videre med at læse; de har ikke bedt om en grammatiklektion. Én til to sætninger i 'summary'. Uddybende felter udfyldes kun, når de faktisk hjælper.

Du forklarer ordet eller sætningen SÅDAN SOM DEN BRUGES HER. Ikke alle betydninger et ord kan have — kun den, der gælder i denne sætning.

Oversættelser skal være naturligt engelsk. 'Jeg står op klokken syv' er 'I get up at seven', aldrig 'I stand up clock seven'. Hvis den ordrette version viser noget om, hvordan dansk er bygget op, kan den stå i 'literal' ved siden af.`;

/** How much Danish the learner can be assumed to handle, from the text level. */
function levelGuidance(level: number): string {
  if (level <= 2) {
    return `The learner is a beginner (A1-A2). Avoid grammar terminology beyond "verb", "noun", "adjective", "present", "past". Do not mention subordinate clauses, participles or the passive unless the learner asked directly.`;
  }
  if (level <= 3) {
    return `The learner is at A2, working towards PD3 Modul 2. Ordinary grammar terms are fine. Keep it to what explains this sentence.`;
  }
  return `The learner is at B1-B2, preparing for PD3 Modul 3-5. You can name subordinate clauses, the passive, participles and word order directly, and you can be brief because they already know the terms.`;
}

export interface ExplainRequest {
  text: LearningText;
  scope: TextScope;
  depth: ExplanationDepth;
  /** The learner's own question, when they asked one ("why is it er and not var?"). */
  question?: string;
  /** Where the learner is in the course, for pitching the answer. */
  courseChapter?: string;
  /** Official level, when they have told us. */
  learnerLevel?: string;
}

function buildPrompt(req: ExplainRequest): string {
  const { text, scope, depth, question, courseChapter, learnerLevel } = req;
  const ctx = contextFor(text, scope);

  const lines: string[] = [
    levelGuidance(text.level),
    "",
    `TEXT: "${text.danishTitle}" (reading level ${text.level} of 5)`,
    `WHAT THE TEXT IS ABOUT: ${text.summary}`,
  ];

  if (learnerLevel) lines.push(`LEARNER'S OWN LEVEL: ${learnerLevel}`);
  if (courseChapter) lines.push(`CURRENTLY STUDYING: ${courseChapter}`);
  if (ctx.paragraph) lines.push(`PARAGRAPH: ${ctx.paragraph}`);
  if (ctx.sentence) lines.push(`SENTENCE: ${ctx.sentence}`);

  lines.push("", `THE LEARNER SELECTED (${scope.kind.toLowerCase()}): ${scope.selection}`);

  if (question) {
    lines.push("", `THEIR QUESTION: ${question}`);
    lines.push("Answer that question specifically. Do not explain unrelated grammar.");
  }

  lines.push("");
  if (depth === "DEEP") {
    lines.push(
      "The learner has read the short answer and asked for more. Now give the grammar properly: how the form arises, why the words sit where they do, and one or two more Danish examples of the same thing. Still no more than a short paragraph per field."
    );
  } else {
    lines.push(
      "Give the SHORT answer. 'summary' is one or two sentences and is the only field that must be filled. Add 'meaning', 'baseForm' and 'partOfSpeech' when the selection is a word or phrase. Add 'grammar' only if one sentence of it genuinely helps. Leave 'structure', 'examples' and 'literal' out unless they earn their place."
    );
  }

  if (scope.kind === "SENTENCE") {
    lines.push(
      "For a sentence, fill 'structure' with the parts in the order they appear and what each one is doing (subject, verb, object, time, place). Use the learner's language for the roles, not Danish grammar jargon."
    );
  }

  return lines.join("\n");
}

export interface ExplainOutcome {
  explanation: ReadingExplanation | null;
  reason?: string;
}

export async function generateExplanation(req: ExplainRequest): Promise<ExplainOutcome> {
  const client = getClient();
  if (!client) return { explanation: null, reason: "no ANTHROPIC_API_KEY set" };

  try {
    // `parse` rather than `create`, so the SDK validates against the schema and
    // hands back a typed object — the same helper lib/exercises/generator.ts
    // uses.
    const message = await client.messages.parse(
      {
        model: "claude-opus-5",
        // Small on purpose. The cap is part of the product: a request that
        // cannot run long cannot turn a word click into a lecture.
        max_tokens: req.depth === "DEEP" ? 2000 : 900,
        output_config: {
          effort: req.depth === "DEEP" ? "medium" : "low",
          format: zodOutputFormat(ExplanationSchema) as ReturnType<
            typeof zodOutputFormat<never>
          >,
        },
        system: SYSTEM,
        messages: [{ role: "user", content: buildPrompt(req) }],
      },
      { timeout: 60_000 }
    );

    if (message.stop_reason === "refusal") {
      return { explanation: null, reason: "request was declined" };
    }
    return { explanation: (message.parsed_output ?? null) as ReadingExplanation | null };
  } catch (err) {
    const msg =
      err instanceof Anthropic.APIError
        ? `API error ${err.status}: ${err.message}`
        : err instanceof Error
          ? err.message
          : "unknown error";
    console.warn(`[reading/explain] failed for ${req.scope.kind}:`, msg);
    return { explanation: null, reason: msg };
  }
}
