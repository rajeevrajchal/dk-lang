// The speaking conversation as it is actually run: who said what, what has
// been covered, and how far through the opgave the candidate is.
//
// The task's *content* (stages, mindmap, information gap) lives in
// ./exercises — this is the state built up while working through it.

import type { CommunicationDemand, TaskType } from "./exercises";
import type { ExaminerTurnGenerated } from "./generation";

export type SpeakingSpeaker = "examiner" | "partner" | "candidate";

export interface SpeakingTurn {
  speaker: SpeakingSpeaker;
  text: string;
  /** For an examiner/partner turn: which coverage target it was aimed at. */
  target?: string;
  demand?: CommunicationDemand;
}

export interface SpeakingState {
  taskType: TaskType;
  moduleId: number;
  topic: string;
  /** Index into the task's stage list. */
  stageIndex: number;
  /**
   * Everything the candidate should end up having talked about — the mindmap
   * categories, or the facts they have to find out in an information gap.
   */
  allTargets: string[];
  coveredTargets: string[];
  turns: SpeakingTurn[];
  /**
   * Every question already put to the candidate, kept across stage
   * boundaries. `turns` is per-stage and is cleared on advance, so without
   * this the examiner would reopen a stage by repeating its first question.
   */
  askedQuestions: string[];
}

export interface SpeakingCriterion {
  id: string;
  /** What the learner had to do, in their interface language. */
  label: string;
  /**
   * Whether the app can tell from the transcript. Null means the learner has
   * to judge it themselves — most of speaking is like that without audio.
   */
  met: boolean | null;
  detail?: string;
}

export interface ExaminerOutcome {
  turn: ExaminerTurnGenerated | null;
  reason?: string;
}

/** One line of the transcript as the conversation UI holds it. */
export interface ConversationTurn {
  speaker: "examiner" | "candidate";
  text: string;
}
