import { z } from "zod";
import { generateStructured } from "@/lib/ai/generate";
import { aiAvailable } from "@/lib/ai/registry";
import { GRAMMAR_TOPICS, TOPIC_LABELS } from "@/lib/learning/topics";
import { extractExplainableText } from "./explainable";
import type {
  AnswerFeedback,
  ExerciseResult,
  ExerciseVariant,
  FeedbackOutcome,
  GradedAnswer,
  GrammarTopic,
} from "@/types";

// English feedback on the answers this learner actually gave.
//
// The variants already carry a rationale per answer — but they carry it in
// DANISH, which is exactly backwards for a learner who is being taught Danish:
// the thing they cannot yet read is the explanation of the thing they got
// wrong. The Danish question, the Danish text and the Danish answer stay
// Danish; the explanation of them is English.
//
// Two levels, and the first is always available:
//
//   baseline   composed here, offline, from the grading itself — what you
//              answered, what the answer was, and the rule the task type
//              exercises. Enough to learn from, and it never fails.
//   generated  a model pass that also explains why the answer you PICKED is
//              wrong, which needs to know what that answer said. Cached on the
//              attempt, so it is paid for once.
//
// Distinguishing the two matters: a learner is entitled to feedback whether or
// not an API key is configured, so the baseline is not an error state.

/** The rule each task type is really testing, in English. */
const TASK_RULE: Record<string, { topic: GrammarTopic; rule: string }> = {
  reading_task_1_matching: {
    topic: "reading-detail",
    rule: "Each person states one or two conditions — a price, a place, a time. The right advert is the one that satisfies ALL of them; an advert that matches most of them is the distractor.",
  },
  reading_task_2_wrong_sentence: {
    topic: "reading-inference",
    rule: "The odd sentence is not the strange one — it is the one that contradicts something the rest of the paragraph says. Find the statement it clashes with.",
  },
  reading_task_3_missing_words: {
    topic: "vocabulary",
    rule: "The gap is fixed by the words around it: the preposition before it, the article, and whether the sentence needs a noun, a verb or an adjective. Each word from the bank is used once.",
  },
  reading_task_4_people_matching: {
    topic: "reading-detail",
    rule: "Each question is answered by one detail in one person's text. Two of the three people usually mention the topic — only one of them says the thing the question asks about.",
  },
};

const baselineFor = (
  answer: GradedAnswer,
  variant: ExerciseVariant
): AnswerFeedback => {
  const rule = TASK_RULE[variant.taskType];

  // The variant's own note, when it has one. These are written in English —
  // they are explanations, and this app's explanations are English — so they
  // can be shown as they are rather than paraphrased.
  const authored = answer.why?.trim();

  if (answer.isCorrect) {
    return {
      key: answer.key,
      isCorrect: true,
      whyCorrect: authored
        ? `“${answer.expected}” is right. ${authored}`
        : `“${answer.expected}” is right.`,
      grammarTopic: rule?.topic ?? "vocabulary",
      source: "baseline",
    };
  }

  return {
    key: answer.key,
    isCorrect: false,
    whyYoursWrong:
      answer.given === null
        ? "You left this one blank, so there was nothing to check."
        : `You answered “${answer.given}”, which does not satisfy what the question asks for.`,
    whyCorrect: authored
      ? `The correct answer is “${answer.expected}”. ${authored}`
      : `The correct answer is “${answer.expected}”.`,
    rule: rule?.rule,
    grammarTopic: rule?.topic ?? "vocabulary",
    source: "baseline",
  };
};

/** Baseline feedback for a whole graded result. Never fails, never blocks. */
export const baselineFeedback = (
  result: ExerciseResult,
  variant: ExerciseVariant
): AnswerFeedback[] => {
  return result.answers.map((a) => baselineFor(a, variant));
};

// ---------------------------------------------------------------------------
// The generated pass
// ---------------------------------------------------------------------------

export const feedbackAvailable = (): boolean => aiAvailable();

const FeedbackSchema = z.object({
  answers: z
    .array(
      z.object({
        key: z.string(),
        /** Why the answer the learner chose does not work. */
        whyYoursWrong: z.string(),
        /** Why the correct answer is correct. */
        whyCorrect: z.string(),
        /** The Danish rule behind it, in one or two sentences. */
        rule: z.string(),
        topic: z.enum(GRAMMAR_TOPICS),
      })
    )
    .min(1)
    .max(20),
});

const SYSTEM = `You explain a Danish learner's mistakes to them, in ENGLISH.

The learner is an adult preparing for the Danish modultest. They read English fluently and are learning Danish, so the explanation is in English and every Danish word you quote stays in Danish — the Danish is the thing being learned.

For each answer you are given, write three things:

1. whyYoursWrong — why the option THEY chose does not work. Refer to what that option actually says. Never write "that is simply wrong"; say what it means and why it does not fit.
2. whyCorrect — why the correct answer is correct, pointing at the words in the Danish that settle it.
3. rule — the Danish grammar or vocabulary rule at work, stated so it transfers to the next question. One or two sentences. If the question is pure reading comprehension rather than grammar, say what to look for in the text instead.

Be concrete and short. Two to three sentences per field, no more. Do not praise, do not apologise, and do not repeat the question back.`;

const buildPrompt = (
  variant: ExerciseVariant,
  wrong: GradedAnswer[]
): string => {
  const blocks = extractExplainableText(variant) ?? [];
  const lines = [
    `EXERCISE: ${variant.title} (${variant.taskType}, Modul ${variant.moduleId}, topic ${variant.topic})`,
    `INSTRUCTION GIVEN TO THE LEARNER: ${variant.instruction.join(" ")}`,
    "",
    "THE DANISH TEXT:",
    ...blocks.map((b) => `[${b.label}] ${b.danish}`),
    "",
    "THE ANSWERS TO EXPLAIN:",
  ];

  for (const a of wrong) {
    lines.push(
      `- key: ${a.key}`,
      `  question: ${a.label}`,
      `  learner answered: ${a.given ?? "(left blank)"}`,
      `  correct answer: ${a.expected}`,
      a.why ? `  note written for this question (may be in Danish — translate the reasoning into English rather than quoting it): ${a.why}` : ""
    );
  }

  lines.push(
    "",
    `Return one entry per key above, using exactly these keys: ${wrong.map((a) => a.key).join(", ")}.`,
    `Pick 'topic' from the list you were given; use "reading-detail" when the answer is stated in the text and "reading-inference" when it has to be worked out.`
  );

  return lines.filter(Boolean).join("\n");
};

/**
 * Explains the wrong answers. Correct ones keep their baseline entry — a
 * learner who got it right does not need three paragraphs about it, and
 * generating them would triple the cost of every call.
 */
export const generateFeedback = async (
  result: ExerciseResult,
  variant: ExerciseVariant
): Promise<FeedbackOutcome> => {
  const wrong = result.answers.filter((a) => !a.isCorrect);
  if (wrong.length === 0) {
    return { feedback: baselineFeedback(result, variant) };
  }
  if (!feedbackAvailable()) {
    return { feedback: baselineFeedback(result, variant), reason: "no AI provider configured" };
  }

  const { object, reason } = await generateStructured({
    task: "reading-explanation-deep",
    schema: FeedbackSchema,
    system: SYSTEM,
    prompt: buildPrompt(variant, wrong),
  });

  if (!object) {
    console.warn(`[feedback] failed for ${variant.variantId}: ${reason}`);
    return { feedback: baselineFeedback(result, variant), reason };
  }

  const byKey = new Map(object.answers.map((a) => [a.key, a]));
  return {
    feedback: result.answers.map((a) => {
      const generated = byKey.get(a.key);
      if (!generated || a.isCorrect) return baselineFor(a, variant);
      return {
        key: a.key,
        isCorrect: false,
        whyYoursWrong: generated.whyYoursWrong,
        whyCorrect: generated.whyCorrect,
        rule: generated.rule,
        grammarTopic: generated.topic,
        source: "generated" as const,
      };
    }),
  };
};

/** One line of English summarising a piece of feedback, for the history log. */
export const feedbackSummary = (f: AnswerFeedback): string => {
  return [f.whyYoursWrong, f.whyCorrect, f.rule].filter(Boolean).join(" ");
};

export { TOPIC_LABELS };
