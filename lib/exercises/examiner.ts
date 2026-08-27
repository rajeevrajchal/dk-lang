import { generateStructured } from "@/lib/ai/generate";
import { aiAvailable } from "@/lib/ai/registry";
import { ExaminerTurnSchema } from "./schemas";
import { currentStage, isStruggling, nextDemand, nextFocus, uncoveredTargets } from "./speaking-state";
import type {
  ExaminerOutcome,
  ExaminerTurnGenerated,
  ExerciseVariant,
  SpeakingContent,
  SpeakingState,
} from "@/types";

// One examiner (or partner) turn.
//
// The prompt is assembled in layers rather than being one block:
//
//   CORE  →  MODULE  →  TASK TYPE  →  STAGE  →  STATE  →  GOAL
//
// The app decides the goal — which target to head for, which demand level, and
// whether to ease off — from SpeakingState. The model only turns that decision
// into a natural Danish question. That is what makes the follow-up build on
// the last answer instead of reading out a pre-generated list.

export const examinerAvailable = (): boolean => {
  return aiAvailable();
};

const CORE = `Du spiller en rolle i en simuleret dansk modultest (Danskuddannelse 3).

Du stiller ÉT spørgsmål ad gangen. Aldrig en liste.

Regler, der gælder hele tiden:
- Spørgsmålet skal bygge på det, kursisten lige har sagt. Skift ikke emne, medmindre du får besked på det.
- Ét spørgsmål pr. tur. Kort og klart. Ingen forklaringer, ingen ros, ingen retning af fejl.
- Spørg kun om noget, kursisten selv har nævnt, eller som hører naturligt til emnet.
- Skriv på dansk, i det sprogniveau modultesten bruger.`;

const DEMAND_GUIDANCE: Record<string, string> = {
  factual: "Stil et konkret spørgsmål: Hvad? Hvor? Hvornår? Hvem? Hvor ofte? Hvor længe?",
  description: "Bed kursisten beskrive noget: Hvordan er ...? Fortæl om ...",
  elaboration: "Bed kursisten uddybe det, han/hun lige sagde, eller give et eksempel.",
  preference: "Spørg til, hvad kursisten helst vil, eller hvad han/hun bedst kan lide.",
  reasoning: "Bed om en begrundelse: Hvorfor? Hvad er grunden?",
  experience: "Spørg til kursistens egne erfaringer med det.",
};

const STAGE_GUIDANCE: Record<string, string> = {
  presentation:
    "Kursisten præsenterer selv. Sig kun en kort sætning, der giver ordet videre — stil ikke spørgsmål endnu.",
  examiner_followup:
    "Du er EKSAMINATOR. Du spørger ind til det, kursisten fortalte i sin præsentation.",
  information_exchange:
    "Du er PARTNER, ikke eksaminator. I er ligeværdige. Du svarer på det, kursisten spørger om, ud fra de oplysninger, du har, og du spørger selv om det, du mangler.",
  pair_discussion:
    "Du er PARTNER, ikke eksaminator. I sammenligner mulighederne. Sig gerne din egen mening og spørg til kursistens.",
  examiner_interview:
    "Du er EKSAMINATOR. Pardiskussionen er slut, og du spørger nu til kursistens egne erfaringer og grunde.",
};

const buildPrompt = (
  variant: ExerciseVariant,
  state: SpeakingState,
  lastAnswer: string | null
): string => {
  const content = variant.content as SpeakingContent;
  const stage = currentStage(state);
  const demand = nextDemand(state);
  const { target } = nextFocus(state);
  const uncovered = uncoveredTargets(state);

  const layers: string[] = [];

  layers.push(`MODUL: ${variant.moduleId}.`);
  layers.push(`OPGAVETYPE: ${variant.taskType}. ${variant.title}`);
  if (stage) {
    layers.push(`FASE: ${stage.type}. ${STAGE_GUIDANCE[stage.type] ?? ""}`);
  }
  layers.push(`EMNE: ${state.topic}`);

  // The partner in an information gap can only answer from what it holds —
  // otherwise it invents facts and the gap stops being a gap.
  if (content.informationGap && stage?.role === "partner") {
    const g = content.informationGap;
    layers.push(
      `DINE OPLYSNINGER (du må kun svare ud fra disse):\n${g.partner.holds
        .map((i) => `  - ${i.label}: ${i.value}`)
        .join("\n")}`
    );
    layers.push(`DET, DU SELV MANGLER AT SPØRGE OM: ${g.partner.mustFindOut.join(", ")}`);
    layers.push(
      "Hvis kursisten spørger om noget, du ikke har på din liste, så sig ærligt, at du ikke ved det."
    );
  }

  if (content.preferenceOptions && stage?.role === "partner") {
    layers.push(
      `MULIGHEDERNE:\n${content.preferenceOptions
        .map((o) => `  ${o.id}. ${o.label} — ${o.description}`)
        .join("\n")}`
    );
  }

  // State: what has and has not been covered, and what was just said.
  const said = state.turns
    .slice(-6)
    .map((t) => `  ${t.speaker === "candidate" ? "KURSIST" : "DIG"}: ${t.text}`)
    .join("\n");
  layers.push(
    `SAMTALEN INDTIL NU:\n${said || "  (ingen endnu — det her er første tur)"}`
  );
  layers.push(
    `ALLEREDE TALT OM: ${state.coveredTargets.length ? state.coveredTargets.join(", ") : "ingenting endnu"}`
  );
  layers.push(`IKKE TALT OM ENDNU: ${uncovered.length ? uncovered.join(", ") : "alt er dækket"}`);

  // The goal the app has decided on.
  const goal: string[] = [];
  if (isStruggling(state)) {
    goal.push(
      "Kursisten svarer meget kort og har det svært. Gør spørgsmålet LETTERE — stil et helt konkret spørgsmål, eller giv to muligheder at vælge imellem."
    );
  } else {
    goal.push(DEMAND_GUIDANCE[demand] ?? DEMAND_GUIDANCE.factual);
  }
  if (target) {
    goal.push(`Før samtalen hen mod: ${target}.`);
  } else if (lastAnswer) {
    goal.push("Alt er dækket. Gå dybere ned i det, kursisten lige sagde.");
  }
  layers.push(`DIN OPGAVE NU:\n  - ${goal.join("\n  - ")}`);

  layers.push(
    `Sæt desuden 'coveredByLastAnswer' til de punkter fra listen [${state.allTargets.join(
      ", "
    )}], som kursistens SIDSTE svar rent faktisk kom ind på. Tom liste hvis ingen.`
  );
  layers.push(
    "Sæt 'stageComplete' til true, hvis der ikke er mere, det giver mening at spørge om i denne fase."
  );

  return layers.join("\n\n");
};

/**
 * Asks for the next examiner/partner turn. Returns null with a reason rather
 * than throwing, so the caller can fall back to the exercise's pre-written
 * follow-up list and the conversation still goes somewhere without a key.
 */
export const nextExaminerTurn = async (
  variant: ExerciseVariant,
  state: SpeakingState,
  lastAnswer: string | null
): Promise<ExaminerOutcome> => {
  // Model, effort and token budget come from the task config — see
  // lib/ai/registry.ts. A failed turn is expected rather than exceptional:
  // scriptedExaminerTurn below carries the conversation when it happens.
  const { object, reason } = await generateStructured({
    task: "examiner-turn",
    schema: ExaminerTurnSchema,
    system: CORE,
    prompt: buildPrompt(variant, state, lastAnswer),
  });

  if (!object) {
    console.warn(`[examiner] turn failed for ${variant.variantId}: ${reason}`);
    return { turn: null, reason };
  }
  return { turn: object };
};

/**
 * Offline stand-in for a turn, used when generation is unavailable.
 *
 * It still respects state — it walks the exercise's own follow-up list and
 * skips what has been covered — so the conversation progresses sensibly
 * without an API key. It just cannot react to the specific words used.
 */
export const scriptedExaminerTurn = (
  variant: ExerciseVariant,
  state: SpeakingState
): ExaminerTurnGenerated => {
  const content = variant.content as SpeakingContent;
  const target = uncoveredTargets(state)[0];
  const stage = currentStage(state);

  // During a presentation the candidate holds the floor — hand over rather
  // than interrupting with a question.
  if (stage?.type === "presentation") {
    return {
      question: "Værsgo — fortæl om dit emne. Tag den tid, du har brug for.",
      target: null,
      coveredByLastAnswer: [],
      stageComplete: false,
    };
  }

  // askedQuestions spans stages, so advancing a stage cannot reopen the pool.
  const asked = new Set(state.askedQuestions);
  const pool = [...content.questions, ...content.followUps];
  const question =
    pool.find((q) => !asked.has(q)) ?? "Vil du fortælle lidt mere om det?";

  return {
    question,
    target: target ?? null,
    coveredByLastAnswer: [],
    stageComplete: asked.size >= pool.length,
  };
};
