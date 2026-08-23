import { demandsForModule, stagesForTaskType } from "./speaking-patterns";
import type {
  CommunicationDemand,
  ExerciseVariant,
  SpeakingContent,
  SpeakingSpeaker,
  SpeakingStage,
  SpeakingState,
} from "@/types";

// Conversation state for a speaking task.
//
// The application owns this, not the prompt. The model is asked for one
// question at a time and told what has already been covered; it does not get
// to decide where the conversation is, whether a stage is finished, or what
// counts as covered. That split is what stops the examiner behaving like a
// shuffled question list.
//
// Everything here is pure and synchronous so it can be tested without the API.

/** Turns of examiner questioning per stage before it is considered done. */
const MIN_EXAMINER_TURNS = 4;
/** A candidate answer at or below this many words reads as struggling. */
const SHORT_ANSWER_WORDS = 3;

/** The coverage targets implied by a speaking exercise's content. */
export const targetsFor = (content: SpeakingContent): string[] => {
  if (content.mindmap) return content.mindmap.categories;
  if (content.informationGap) return content.informationGap.candidate.mustFindOut;
  if (content.preferenceOptions) return content.preferenceOptions.map((o) => o.label);
  if (content.preparedTopics?.length) return content.preparedTopics[0].prompts;
  // The original free-form prompts: the questions themselves are the targets.
  return content.questions;
};

export const initialSpeakingState = (variant: ExerciseVariant): SpeakingState => {
  const content = variant.content as SpeakingContent;
  return {
    taskType: variant.taskType,
    moduleId: variant.moduleId,
    topic: content.mindmap?.title ?? content.preferenceTopic ?? variant.topic,
    stageIndex: 0,
    allTargets: targetsFor(content),
    coveredTargets: [],
    turns: [],
    askedQuestions: [],
  };
};

export const stagesFor = (state: SpeakingState): SpeakingStage[] => {
  return stagesForTaskType(state.taskType) ?? [];
};

export const currentStage = (state: SpeakingState): SpeakingStage | null => {
  return stagesFor(state)[state.stageIndex] ?? null;
};

export const uncoveredTargets = (state: SpeakingState): string[] => {
  return state.allTargets.filter((t) => !state.coveredTargets.includes(t));
};

/**
 * Best-effort coverage detection from the candidate's own words.
 *
 * A target like "transport til arbejde" is counted as covered when a
 * meaningful word from it shows up in the answer. This is deliberately
 * conservative — it under-counts rather than over-counts, so the examiner
 * revisits a thin area instead of skipping it. When the API is available the
 * model's own judgement is merged on top (see recordCandidateTurn).
 */
export const detectCoverage = (answer: string, targets: string[]): string[] => {
  const haystack = answer.toLowerCase();
  return targets.filter((target) =>
    target
      .toLowerCase()
      .split(/[^\p{L}]+/u)
      .filter((w) => w.length > 3)
      .some((w) => haystack.includes(w))
  );
};

export const recordExaminerTurn = (
  state: SpeakingState,
  text: string,
  target?: string,
  demand?: CommunicationDemand
): SpeakingState => {
  const stage = currentStage(state);
  const speaker: SpeakingSpeaker = stage?.role === "partner" ? "partner" : "examiner";
  return {
    ...state,
    turns: [...state.turns, { speaker, text, target, demand }],
    askedQuestions: [...state.askedQuestions, text],
  };
};

/**
 * Records what the candidate said and updates coverage. `alsoCovered` is the
 * model's assessment, merged with the local heuristic — the app still owns
 * the record, the model only contributes to it.
 */
export const recordCandidateTurn = (
  state: SpeakingState,
  text: string,
  alsoCovered: string[] = []
): SpeakingState => {
  const detected = detectCoverage(text, uncoveredTargets(state));
  const confirmed = alsoCovered.filter((t) => state.allTargets.includes(t));
  const covered = [...new Set([...state.coveredTargets, ...detected, ...confirmed])];
  return {
    ...state,
    coveredTargets: covered,
    turns: [...state.turns, { speaker: "candidate", text }],
  };
};

export const examinerTurnsInStage = (state: SpeakingState): number => {
  return state.turns.filter((t) => t.speaker !== "candidate").length;
};

/**
 * Whether the candidate looks stuck: their last two answers were very short.
 * The examiner should simplify or offer a concrete choice rather than pushing
 * on to a harder demand.
 */
export const isStruggling = (state: SpeakingState): boolean => {
  const answers = state.turns.filter((t) => t.speaker === "candidate").slice(-2);
  if (answers.length < 2) return false;
  return answers.every((a) => a.text.trim().split(/\s+/).filter(Boolean).length <= SHORT_ANSWER_WORDS);
};

/**
 * A stage is finished once the candidate has been asked enough and there is
 * nothing important left uncovered. A presentation stage has no questioning,
 * so it ends as soon as the candidate has spoken once.
 */
export const isStageComplete = (state: SpeakingState): boolean => {
  const stage = currentStage(state);
  if (!stage) return true;
  const candidateTurns = state.turns.filter((t) => t.speaker === "candidate").length;

  if (stage.type === "presentation") return candidateTurns >= 1;

  return examinerTurnsInStage(state) >= MIN_EXAMINER_TURNS && uncoveredTargets(state).length === 0;
};

/** Moves to the next stage. The per-stage transcript resets; what has been
 *  covered and what has already been asked deliberately do not. */
export const advanceStage = (state: SpeakingState): SpeakingState => {
  return { ...state, stageIndex: state.stageIndex + 1, turns: [] };
};

export const isTaskComplete = (state: SpeakingState): boolean => {
  return state.stageIndex >= stagesFor(state).length;
};

/**
 * The demand for the next question.
 *
 * The stage sets the baseline. A struggling candidate is dropped back to the
 * module's easiest demand rather than being pushed further. Otherwise the
 * demand climbs one rung per examiner turn, but never above what the module
 * examines — which is what keeps a Modul 2 follow-up on "hvor ligger caféen?"
 * instead of drifting into "hvorfor tror du, folk skifter job?".
 */
export const nextDemand = (state: SpeakingState): CommunicationDemand => {
  const stage = currentStage(state);
  const allowed = demandsForModule(state.moduleId);
  if (!stage) return allowed[0];
  if (isStruggling(state)) return allowed[0];

  const base = allowed.indexOf(stage.communicationDemand);
  const start = base === -1 ? 0 : base;
  const climb = Math.floor(examinerTurnsInStage(state) / 2);
  return allowed[Math.min(start + climb, allowed.length - 1)];
};

/**
 * What the next question should be about: the most important thing not yet
 * discussed, falling back to the last thing the candidate said so the
 * examiner deepens rather than jumping.
 */
export const nextFocus = (state: SpeakingState): { target?: string; lastAnswer?: string } => {
  const uncovered = uncoveredTargets(state);
  const lastAnswer = [...state.turns].reverse().find((t) => t.speaker === "candidate")?.text;
  return { target: uncovered[0], lastAnswer };
};
