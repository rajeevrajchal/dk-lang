// English feedback on a learner's answers.
//
// Separate from GradedAnswer (types/exercises.ts) on purpose: grading answers
// "was this right?", which is a fact about the answer key, and feedback answers
// "why, and what should I learn from it?", which depends on what this learner
// actually chose.

import type { GRAMMAR_TOPICS } from "@/lib/learning/topics";

export type GrammarTopic = (typeof GRAMMAR_TOPICS)[number];

export interface AnswerFeedback {
  /** Matches GradedAnswer.key, so the two line up in the results list. */
  key: string;
  isCorrect: boolean;
  /** Why the option the learner picked does not work. Absent when correct. */
  whyYoursWrong?: string;
  /** Why the correct answer is correct. */
  whyCorrect: string;
  /** The Danish rule at work, stated so it transfers to the next question. */
  rule?: string;
  grammarTopic: GrammarTopic;
  /**
   * Whether this was composed offline from the grading, or written by the
   * model. Shown to nobody, but it is what tells the UI whether asking for
   * more would produce anything.
   */
  source: "baseline" | "generated";
}

export interface FeedbackOutcome {
  feedback: AnswerFeedback[];
  /** Why the generated pass did not happen, when it did not. */
  reason?: string;
}
