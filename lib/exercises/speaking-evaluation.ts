import { uncoveredTargets } from "./speaking-state";
import type {
  SpeakingContent,
  SpeakingCriterion,
  SpeakingState,
  TaskType,
} from "@/types";

// What "doing the task well" means, per task type.
//
// These are practice-engine criteria, not official grading. The source
// material gives the task formats, not a marking scheme, so nothing here
// claims to be how the real modultest is scored — and nothing here produces a
// number. Speaking still returns a null score from grading.ts exactly as
// before; this only adds a checklist the learner can hold their performance
// against, which is the thing a mindmap task and an information-gap task
// genuinely differ on.

/**
 * Criteria for a finished speaking task. `state` is optional: without a
 * transcript every criterion is self-assessed, which is the right answer for
 * an exercise the learner did out loud without typing anything.
 */
export const speakingCriteria = (
  taskType: TaskType,
  content: SpeakingContent,
  state?: SpeakingState
): SpeakingCriterion[] => {
  const answered = state?.turns.filter((t) => t.speaker === "candidate").length ?? 0;
  const missed = state ? uncoveredTargets(state) : [];

  switch (taskType) {
    case "speaking_mindmap":
      return [
        {
          id: "covered",
          label: "Talte om emnet ved hjælp af ordene i mindmappet",
          met: state ? missed.length < (state.allTargets.length || 1) : null,
          detail: missed.length > 0 ? `Ikke nævnt: ${missed.join(", ")}` : undefined,
        },
        {
          id: "relevant",
          label: "Gav relevante oplysninger om emnet",
          met: null,
        },
        {
          id: "followup",
          label: "Kunne svare på eksaminators spørgsmål",
          met: state ? answered > 1 : null,
        },
        {
          id: "sentences",
          label: "Svarede med hele sætninger, ikke kun ét ord",
          met: state
            ? state.turns
                .filter((t) => t.speaker === "candidate")
                .every((t) => t.text.trim().split(/\s+/).length > 2)
            : null,
        },
      ];

    case "speaking_information_gap":
      return [
        {
          id: "asked",
          label: "Stillede spørgsmål for at få de manglende oplysninger",
          met: state ? answered > 0 : null,
        },
        {
          id: "obtained",
          label: "Fik fat i de oplysninger, der manglede",
          met: state ? missed.length === 0 : null,
          detail: missed.length > 0 ? `Mangler stadig: ${missed.join(", ")}` : undefined,
        },
        {
          id: "understood",
          label: "Forstod partnerens svar",
          met: null,
        },
        {
          id: "gave",
          label: "Gav sine egne oplysninger, da der blev spurgt",
          met: null,
        },
      ];

    case "speaking_prepared_topic":
      return [
        { id: "coherent", label: "Talte sammenhængende om emnet i 1-2 minutter", met: null },
        {
          id: "elaborated",
          label: "Uddybede og gav eksempler, da eksaminator spurgte",
          met: state ? answered > 1 : null,
        },
        { id: "reasons", label: "Forklarede hvorfor — ikke kun hvad", met: null },
        { id: "experience", label: "Fortalte om egne erfaringer med emnet", met: null },
      ];

    case "speaking_picture_preference":
      return [
        {
          id: "discussed",
          label: "Talte om mulighederne med sin partner",
          met: state ? answered > 0 : null,
        },
        { id: "preference", label: "Sagde tydeligt, hvad han/hun helst ville vælge", met: null },
        { id: "reason", label: "Begrundede sit valg", met: null },
        { id: "interaction", label: "Både stillede og svarede på spørgsmål", met: null },
        { id: "interview", label: "Kunne fortsætte samtalen med eksaminator", met: state ? answered > 2 : null },
      ];

    default:
      // The original free-form prompts keep the generic self-check they had.
      return [
        { id: "answered", label: "Svarede på alle spørgsmålene", met: null },
        { id: "sentences", label: "Svarede med hele sætninger", met: null },
        { id: "tenses", label: "Brugte både nutid, datid og fremtid", met: null },
      ];
  }
};

/** English labels, for the interface language switch. */
export const CRITERION_LABELS_EN: Record<string, string> = {
  covered: "Spoke about the topic using the mindmap keywords",
  relevant: "Gave relevant information about the topic",
  followup: "Could answer the examiner's questions",
  sentences: "Answered in full sentences, not single words",
  asked: "Asked questions to get the missing information",
  obtained: "Got hold of the information that was missing",
  understood: "Understood the partner's answers",
  gave: "Gave their own information when asked",
  coherent: "Spoke coherently about the topic for 1–2 minutes",
  elaborated: "Elaborated and gave examples when asked",
  reasons: "Explained why, not just what",
  experience: "Talked about their own experience of the topic",
  discussed: "Discussed the options with their partner",
  preference: "Said clearly which option they preferred",
  reason: "Gave a reason for the choice",
  interaction: "Both asked and answered questions",
  interview: "Could carry the conversation on with the examiner",
  answered: "Answered all the questions",
  tenses: "Used present, past and future",
};
