import type {
  CommunicationDemand,
  SpeakingStage,
  TaskType,
} from "./types";

// Which speaking opgaver each module is made of, and what phases each opgave
// runs through.
//
// The point of this file is that a module is COMPOSED FROM task types rather
// than being one. Modul 2 speaking is a mindmap presentation and an
// information-gap exchange; Modul 3 is a prepared topic and a picture
// preference discussion. Same engine, different composition — no per-module
// engine.
//
// It is deliberately plain data. The stage list is the whole "state machine":
// stages run in order, the app tracks which one it is on, and that is all the
// machinery this needs.

/**
 * Speaking task types per module. A module without an entry falls back to the
 * category-wide list in types.ts, which is what every module did before this
 * file existed — so nothing changes for them.
 */
export const SPEAKING_TASKS_BY_MODULE: Record<number, TaskType[]> = {
  2: ["speaking_mindmap", "speaking_information_gap"],
  3: ["speaking_prepared_topic", "speaking_picture_preference"],
};

export function speakingTasksForModule(moduleId: number): TaskType[] | null {
  return SPEAKING_TASKS_BY_MODULE[moduleId] ?? null;
}

/**
 * The demand ceiling a module examines at. Modul 2 stays on concrete
 * questions; Modul 3 expects the candidate to elaborate, prefer and justify.
 * Used to keep generated follow-ups at the right level rather than letting
 * the model drift into debate questions.
 */
export const MODULE_DEMANDS: Record<number, CommunicationDemand[]> = {
  2: ["factual", "description"],
  3: ["description", "elaboration", "preference", "reasoning", "experience"],
};

export function demandsForModule(moduleId: number): CommunicationDemand[] {
  return MODULE_DEMANDS[moduleId] ?? ["factual", "description"];
}

// ---------------------------------------------------------------------------
// Stage templates
// ---------------------------------------------------------------------------

/**
 * The phases of each opgave. Instructions are in Danish because they are read
 * by the learner as part of the task, exactly like the printed instruktion on
 * the paper test.
 */
export const STAGE_TEMPLATES: Partial<Record<TaskType, SpeakingStage[]>> = {
  // Modul 2, Opgave 1 — mindmap presentation, then examiner follow-up.
  speaking_mindmap: [
    {
      type: "presentation",
      role: "solo",
      communicationDemand: "description",
      approxMinutes: 2,
      instruction:
        "Fortæl om emnet. Brug ordene i mindmappet som hjælp — du skal ikke nå dem alle, og du behøver ikke tage dem i rækkefølge.",
    },
    {
      type: "examiner_followup",
      role: "examiner",
      communicationDemand: "factual",
      approxMinutes: 3,
      instruction: "Eksaminator stiller spørgsmål om det, du har fortalt. Svar med hele sætninger.",
    },
  ],

  // Modul 2, Opgave 2 — the two sides hold different information.
  speaking_information_gap: [
    {
      type: "information_exchange",
      role: "partner",
      communicationDemand: "factual",
      approxMinutes: 4,
      instruction:
        "I ved ikke det samme. Stil spørgsmål for at få de oplysninger, du mangler, og svar på din partners spørgsmål.",
    },
  ],

  // Modul 3, Opgave 1 — two topics offered, one drawn, then presentation and
  // a longer follow-up that pushes past facts.
  speaking_prepared_topic: [
    {
      type: "presentation",
      role: "solo",
      communicationDemand: "description",
      approxMinutes: 2,
      instruction: "Fortæl sammenhængende om det emne, du har trukket. Du har 1-2 minutter.",
    },
    {
      type: "examiner_followup",
      role: "examiner",
      communicationDemand: "elaboration",
      approxMinutes: 4,
      instruction:
        "Eksaminator spørger ind til dit emne. Uddyb, giv eksempler, og forklar hvorfor du mener det, du mener.",
    },
  ],

  // Modul 3, Opgave 2 — pair discussion over four options, then the examiner
  // widens it out. Two different roles, in that order.
  speaking_picture_preference: [
    {
      type: "pair_discussion",
      role: "partner",
      communicationDemand: "preference",
      approxMinutes: 4,
      instruction:
        "Tal om mulighederne sammen. Stil spørgsmål til hinanden, sig hvad I helst vil vælge, og begrund det.",
    },
    {
      type: "examiner_interview",
      role: "examiner",
      communicationDemand: "experience",
      approxMinutes: 3,
      instruction:
        "Eksaminator spørger til dine egne erfaringer med emnet og til grundene bag dit valg.",
    },
  ],
};

export function stagesForTaskType(taskType: TaskType): SpeakingStage[] | null {
  return STAGE_TEMPLATES[taskType] ?? null;
}

/** True for the task types that carry the modultest opgave structure. */
export function isStructuredSpeakingTask(taskType: TaskType): boolean {
  return taskType in STAGE_TEMPLATES;
}

/**
 * The opgave number a speaking task sits at in its module, for labelling.
 * The original three prompts have no opgave number — they are practice
 * prompts, not opgaver — so they return undefined and are labelled by title.
 */
export const SPEAKING_OPGAVE_NUMBER: Partial<Record<TaskType, number>> = {
  speaking_mindmap: 1,
  speaking_information_gap: 2,
  speaking_prepared_topic: 1,
  speaking_picture_preference: 2,
};
