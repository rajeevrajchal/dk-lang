// Learning mode: the one thing that separates Lessons, Class and Mock.
//
// The exercise engine underneath them is identical — same task types, same
// selection, same grading. What changes is how much the app teaches while the
// learner works, when feedback arrives, and whether they can try again. That
// is a configuration, so it lives here rather than in three parallel engines.
//
// Deliberately NOT a database column. The app already stores enough to know
// which mode an attempt belongs to:
//
//   ExerciseAttempt.examSessionId set    -> mock
//   ExerciseAttempt.examSessionId null   -> class
//   LessonProgress row                   -> lesson
//
// Adding a `mode` field would have created a second source of truth that could
// disagree with examSessionId. Deriving it cannot.

export const LEARNING_MODES = ["lesson", "class", "mock"] as const;
export type LearningMode = (typeof LEARNING_MODES)[number];

export function isLearningMode(value: unknown): value is LearningMode {
  return typeof value === "string" && (LEARNING_MODES as readonly string[]).includes(value);
}

export interface ModeBehaviour {
  /** When the learner finds out whether they were right. */
  feedback: "immediate" | "on_submit" | "end_of_session";
  /**
   * How much the app says while they work.
   *  taught     — explain the rule first, walk them through it (Lessons)
   *  supported  — explanations available on request afterwards (Class)
   *  minimal    — instructions only, like the printed test (Mock)
   */
  guidance: "taught" | "supported" | "minimal";
  /** Whether the "explain this text" breakdown is offered. */
  explanationsOffered: boolean;
  /** Whether the learner can redo the same task straight away. */
  retryAllowed: boolean;
  /** Whether the session runs against a clock. */
  timed: boolean;
  /** Whether a result is recorded against module unlock state. */
  countsTowardsReadiness: boolean;
}

export const MODE_BEHAVIOUR: Record<LearningMode, ModeBehaviour> = {
  // Explain → demonstrate → guide → practise → correct → review.
  lesson: {
    feedback: "immediate",
    guidance: "taught",
    explanationsOffered: true,
    retryAllowed: true,
    timed: false,
    countsTowardsReadiness: false,
  },
  // Practise, repeat, focus on a skill, adapt to the module.
  class: {
    feedback: "on_submit",
    guidance: "supported",
    explanationsOffered: true,
    retryAllowed: true,
    timed: false,
    countsTowardsReadiness: false,
  },
  // Simulate. Minimal guidance, strict order, everything scored at the end.
  mock: {
    feedback: "end_of_session",
    guidance: "minimal",
    explanationsOffered: false,
    retryAllowed: false,
    timed: true,
    countsTowardsReadiness: true,
  },
};

export function behaviourFor(mode: LearningMode): ModeBehaviour {
  return MODE_BEHAVIOUR[mode];
}

/**
 * The mode an ExerciseAttempt belongs to, from what is already stored on the
 * row. This is the derivation the whole design rests on — see the file header.
 */
export function modeForAttempt(attempt: { examSessionId: string | null }): LearningMode {
  return attempt.examSessionId ? "mock" : "class";
}

/** Whether feedback may be shown as soon as this attempt is submitted. */
export function revealsFeedbackOnSubmit(mode: LearningMode): boolean {
  return MODE_BEHAVIOUR[mode].feedback !== "end_of_session";
}
