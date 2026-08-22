import { describe, it, expect } from "vitest";
import { ALL_VARIANTS, selectNextTaskType, selectNextVariant, toPublicExercise } from "./registry";
import { validateVariant } from "./validate";
import { gradeExercise } from "./grading";
import { speakingCriteria } from "./speaking-evaluation";
import { scriptedExaminerTurn } from "./examiner";
import {
  SPEAKING_TASKS_BY_MODULE,
  demandsForModule,
  stagesForTaskType,
} from "./speaking-patterns";
import {
  advanceStage,
  currentStage,
  detectCoverage,
  initialSpeakingState,
  isStageComplete,
  isStruggling,
  isTaskComplete,
  nextDemand,
  nextFocus,
  recordCandidateTurn,
  recordExaminerTurn,
  uncoveredTargets,
} from "./speaking-state";
import { TASK_TYPES_BY_CATEGORY } from "./types";
import type { ExerciseVariant, SpeakingContent } from "./types";

const variant = (id: string): ExerciseVariant => {
  const v = ALL_VARIANTS.find((x) => x.variantId === id);
  if (!v) throw new Error(`no variant ${id}`);
  return v;
};
const speaking = (id: string) => variant(id).content as SpeakingContent;

// ---------------------------------------------------------------------------
// Backward compatibility — this is the non-negotiable part
// ---------------------------------------------------------------------------

describe("backward compatibility", () => {
  it("every pre-existing variant still validates", () => {
    for (const v of ALL_VARIANTS) {
      const res = validateVariant(v);
      expect(res.errors, `${v.variantId}: ${res.errors.join("; ")}`).toEqual([]);
    }
  });

  it("keeps the original speaking task types available", () => {
    for (const t of ["speaking_interview", "speaking_topic", "speaking_situation"] as const) {
      expect(TASK_TYPES_BY_CATEGORY.SPEAKING).toContain(t);
    }
  });

  it("original speaking prompts carry no stages and still pass validation", () => {
    const old = speaking("s-interview-hverdag");
    expect(old.stages).toBeUndefined();
    expect(old.mindmap).toBeUndefined();
    expect(validateVariant(variant("s-interview-hverdag")).ok).toBe(true);
  });

  it("still returns a null score for speaking rather than inventing one", () => {
    const r = gradeExercise(variant("s-mindmap-arbejde"), {});
    expect(r.score).toBeNull();
    expect(r.total).toBeNull();
  });

  it("reading exercises are untouched by the speaking work", () => {
    const r1 = variant("r1-bolig");
    const pub = toPublicExercise(r1, "attempt-1", true);
    expect(pub.content).not.toHaveProperty("answers");
    expect(gradeExercise(r1, { "1": "B", "2": "C", "3": "D", "4": "E" }).score).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Module composition
// ---------------------------------------------------------------------------

describe("module-aware composition", () => {
  it("composes each module from its own speaking task types", () => {
    expect(SPEAKING_TASKS_BY_MODULE[2]).toEqual([
      "speaking_mindmap",
      "speaking_information_gap",
    ]);
    expect(SPEAKING_TASKS_BY_MODULE[3]).toEqual([
      "speaking_prepared_topic",
      "speaking_picture_preference",
    ]);
  });

  it("serves module 2 its own opgaver, not module 3's", () => {
    const first = selectNextTaskType(2, "SPEAKING", []);
    expect(first).toBe("speaking_mindmap");
    const second = selectNextTaskType(2, "SPEAKING", [
      { variantId: "x", taskType: "speaking_mindmap", completedAt: new Date() },
    ]);
    expect(second).toBe("speaking_information_gap");
  });

  it("serves module 3 the module 3 opgaver", () => {
    expect(selectNextTaskType(3, "SPEAKING", [])).toBe("speaking_prepared_topic");
  });

  it("falls back to the category list for a module with no composition", () => {
    expect(selectNextTaskType(4, "SPEAKING", [])).toBe("speaking_interview");
  });

  it("serves module 2 its opgaver from the authored pool too, not just via generation", () => {
    // The fallback path (no API key) must respect the module composition —
    // otherwise a learner without a key gets the general prompts instead.
    const picked = selectNextVariant(2, "SPEAKING", []);
    expect(picked?.variant.taskType).toBe("speaking_mindmap");
    const next = selectNextVariant(2, "SPEAKING", [
      { variantId: "s-mindmap-arbejde", taskType: "speaking_mindmap", completedAt: new Date() },
    ]);
    expect(next?.variant.taskType).toBe("speaking_information_gap");
  });

  it("still serves the original prompts for a module with no composition", () => {
    const picked = selectNextVariant(4, "SPEAKING", []);
    expect(picked).toBeNull(); // no module 4 variants authored
  });

  it("raises the communication demand from module 2 to module 3", () => {
    expect(demandsForModule(2)).toEqual(["factual", "description"]);
    expect(demandsForModule(3)).toContain("reasoning");
    expect(demandsForModule(3)).toContain("experience");
    // The Modul 2 ceiling is the point: no "why do you think..." at A2.
    expect(demandsForModule(2)).not.toContain("reasoning");
  });
});

// ---------------------------------------------------------------------------
// Module 2 — Opgave 1, mindmap
// ---------------------------------------------------------------------------

describe("module 2 · mindmap presentation", () => {
  it("has a topic and keyword categories", () => {
    const c = speaking("s-mindmap-arbejde");
    expect(c.mindmap?.title).toBe("Mit arbejde");
    expect(c.mindmap?.categories.length).toBeGreaterThanOrEqual(5);
    // Keywords, not questions — a mindmap that asks questions is a quiz.
    for (const cat of c.mindmap!.categories) {
      expect(cat).not.toContain("?");
      expect(cat.split(/\s+/).length).toBeLessThanOrEqual(4);
    }
  });

  it("runs presentation then examiner follow-up, as two distinct stages", () => {
    const stages = stagesForTaskType("speaking_mindmap")!;
    expect(stages.map((s) => s.type)).toEqual(["presentation", "examiner_followup"]);
    expect(stages[0].role).toBe("solo");
    expect(stages[1].role).toBe("examiner");
  });

  it("rejects a mindmap with no categories", () => {
    const broken = structuredClone(variant("s-mindmap-arbejde"));
    (broken.content as SpeakingContent).mindmap!.categories = [];
    const res = validateVariant(broken);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/keyword categories/);
  });

  it("rejects a two-phase opgave whose stages don't distinguish the phases", () => {
    const broken = structuredClone(variant("s-mindmap-arbejde"));
    const c = broken.content as SpeakingContent;
    c.stages = [c.stages![0], { ...c.stages![0] }];
    const res = validateVariant(broken);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/distinguish presentation from follow-up/);
  });
});

// ---------------------------------------------------------------------------
// Conversation state — the adaptive follow-up
// ---------------------------------------------------------------------------

describe("conversation state", () => {
  const v = variant("s-mindmap-arbejde");

  it("starts uncovered and knows what it has to get through", () => {
    const s = initialSpeakingState(v);
    expect(s.topic).toBe("Mit arbejde");
    expect(s.coveredTargets).toEqual([]);
    expect(uncoveredTargets(s)).toEqual(s.allTargets);
    expect(currentStage(s)?.type).toBe("presentation");
  });

  it("marks a target covered from what the candidate actually said", () => {
    let s = initialSpeakingState(v);
    s = recordCandidateTurn(s, "Jeg cykler, så transport til arbejde tager ti minutter.");
    expect(s.coveredTargets).toContain("transport til arbejde");
    expect(uncoveredTargets(s)).not.toContain("transport til arbejde");
  });

  it("does not mark unrelated targets as covered", () => {
    let s = initialSpeakingState(v);
    s = recordCandidateTurn(s, "Jeg arbejder på en café.");
    expect(s.coveredTargets).not.toContain("kollegaer / chef");
  });

  it("aims the next question at something not yet discussed", () => {
    let s = initialSpeakingState(v);
    s = recordCandidateTurn(s, "Jeg taler om mine arbejdsopgaver hver dag.");
    const focus = nextFocus(s);
    expect(s.allTargets).toContain(focus.target);
    expect(focus.target).not.toBe("arbejdsopgaver");
    expect(focus.lastAnswer).toMatch(/arbejdsopgaver/);
  });

  it("detects a struggling candidate from two very short answers", () => {
    let s = initialSpeakingState(v);
    s = recordCandidateTurn(s, "Ja.");
    s = recordCandidateTurn(s, "En café.");
    expect(isStruggling(s)).toBe(true);
  });

  it("eases the demand back down when the candidate is struggling", () => {
    let s = initialSpeakingState(variant("s-prepared-hverdag"));
    s = advanceStage(s); // into the follow-up stage, which starts at elaboration
    s = recordCandidateTurn(s, "Ja.");
    s = recordCandidateTurn(s, "Nej.");
    // Module 3's easiest demand, not the stage's elaboration baseline.
    expect(nextDemand(s)).toBe(demandsForModule(3)[0]);
  });

  it("never asks above what the module examines", () => {
    let s = initialSpeakingState(v);
    s = advanceStage(s);
    for (let i = 0; i < 10; i++) {
      s = recordExaminerTurn(s, `spørgsmål ${i}`);
      s = recordCandidateTurn(s, "Jeg arbejder på et hospital i Odense hver dag.");
    }
    // Modul 2 tops out at description; it must not drift into reasoning.
    expect(demandsForModule(2)).toContain(nextDemand(s));
  });

  it("finishes the presentation stage once the candidate has spoken", () => {
    let s = initialSpeakingState(v);
    expect(isStageComplete(s)).toBe(false);
    s = recordCandidateTurn(s, "Jeg arbejder på et hospital.");
    expect(isStageComplete(s)).toBe(true);
  });

  it("does not finish the follow-up stage while targets are uncovered", () => {
    let s = advanceStage(initialSpeakingState(v));
    for (let i = 0; i < 6; i++) {
      s = recordExaminerTurn(s, `q${i}`);
      s = recordCandidateTurn(s, "Ja.");
    }
    expect(uncoveredTargets(s).length).toBeGreaterThan(0);
    expect(isStageComplete(s)).toBe(false);
  });

  it("completes the task after its last stage", () => {
    let s = initialSpeakingState(v);
    s = advanceStage(s);
    s = advanceStage(s);
    expect(isTaskComplete(s)).toBe(true);
  });

  it("coverage detection ignores short filler words", () => {
    expect(detectCoverage("Jeg har en god dag", ["dage / tid"])).toEqual([]);
    expect(detectCoverage("Jeg holder pauser klokken tolv", ["pauser"])).toEqual(["pauser"]);
  });
});

describe("scripted examiner fallback", () => {
  it("does not repeat a question after advancing a stage", () => {
    // advanceStage clears the per-stage transcript; askedQuestions must not be
    // cleared with it, or the examiner reopens the stage with its first
    // question — which is exactly what happened before askedQuestions existed.
    const v = variant("s-mindmap-arbejde");
    let s = initialSpeakingState(v);
    const first = scriptedExaminerTurn(v, s);
    s = recordExaminerTurn(s, first.question);
    s = recordCandidateTurn(s, "Jeg arbejder på et hospital.");
    s = advanceStage(s);
    expect(s.turns).toHaveLength(0);
    expect(s.askedQuestions).toContain(first.question);
    expect(scriptedExaminerTurn(v, s).question).not.toBe(first.question);
  });

  it("hands over instead of interrupting during the presentation stage", () => {
    const v = variant("s-mindmap-arbejde");
    const s = initialSpeakingState(v);
    expect(currentStage(s)?.type).toBe("presentation");
    const turn = scriptedExaminerTurn(v, s);
    expect(turn.question).not.toContain("?");
  });

  it("asks a new question each turn instead of repeating itself", () => {
    const v = variant("s-mindmap-arbejde");
    let s = advanceStage(initialSpeakingState(v));
    const asked: string[] = [];
    for (let i = 0; i < 4; i++) {
      const turn = scriptedExaminerTurn(v, s);
      asked.push(turn.question);
      s = recordExaminerTurn(s, turn.question);
      s = recordCandidateTurn(s, "Jeg arbejder på et hospital.");
    }
    expect(new Set(asked).size).toBe(asked.length);
  });
});

// ---------------------------------------------------------------------------
// Module 2 — Opgave 2, information gap
// ---------------------------------------------------------------------------

describe("module 2 · information gap", () => {
  const c = speaking("s-infogap-cafe");

  it("gives the two sides different information", () => {
    const mine = c.informationGap!.candidate.holds.map((i) => i.label);
    const theirs = c.informationGap!.partner.holds.map((i) => i.label);
    expect(mine.some((l) => theirs.includes(l))).toBe(false);
  });

  it("makes the exchange go both ways", () => {
    expect(c.informationGap!.candidate.mustFindOut.length).toBeGreaterThan(0);
    expect(c.informationGap!.partner.mustFindOut.length).toBeGreaterThan(0);
  });

  it("only asks the candidate to find out things the partner actually holds", () => {
    const partnerLabels = c.informationGap!.partner.holds.map((i) => i.label);
    for (const want of c.informationGap!.candidate.mustFindOut) {
      expect(partnerLabels).toContain(want);
    }
  });

  it("rejects a gap where both sides hold identical information", () => {
    const broken = structuredClone(variant("s-infogap-cafe"));
    const g = (broken.content as SpeakingContent).informationGap!;
    g.partner.holds = structuredClone(g.candidate.holds);
    g.candidate.mustFindOut = g.candidate.holds.map((i) => i.label);
    const res = validateVariant(broken);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/identical information/);
  });

  it("rejects asking about something the partner does not hold", () => {
    const broken = structuredClone(variant("s-infogap-cafe"));
    (broken.content as SpeakingContent).informationGap!.candidate.mustFindOut = ["noget-andet"];
    const res = validateVariant(broken);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/does not hold/);
  });

  it("treats the partner as a partner, not an examiner", () => {
    expect(stagesForTaskType("speaking_information_gap")![0].role).toBe("partner");
  });
});

// ---------------------------------------------------------------------------
// Module 3
// ---------------------------------------------------------------------------

describe("module 3 · prepared topic", () => {
  const c = speaking("s-prepared-hverdag");

  it("offers exactly two topics to draw from", () => {
    expect(c.preparedTopics).toHaveLength(2);
    expect(c.preparedTopics![0].title).not.toBe(c.preparedTopics![1].title);
  });

  it("gives each topic prompts to prepare from", () => {
    for (const t of c.preparedTopics!) expect(t.prompts.length).toBeGreaterThanOrEqual(3);
  });

  it("separates the presentation from the follow-up and raises the demand", () => {
    const stages = stagesForTaskType("speaking_prepared_topic")!;
    expect(stages.map((s) => s.type)).toEqual(["presentation", "examiner_followup"]);
    expect(stages[1].communicationDemand).toBe("elaboration");
  });

  it("rejects an exercise that offers only one topic", () => {
    const broken = structuredClone(variant("s-prepared-hverdag"));
    (broken.content as SpeakingContent).preparedTopics = [c.preparedTopics![0]];
    const res = validateVariant(broken);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/expected 2 to draw from/);
  });
});

describe("module 3 · picture preference", () => {
  const c = speaking("s-preference-ferie");

  it("offers a topic and exactly four options", () => {
    expect(c.preferenceTopic).toBeTruthy();
    expect(c.preferenceOptions).toHaveLength(4);
    expect(new Set(c.preferenceOptions!.map((o) => o.id)).size).toBe(4);
  });

  it("runs pair discussion first, then the examiner interview", () => {
    const stages = stagesForTaskType("speaking_picture_preference")!;
    expect(stages.map((s) => s.type)).toEqual(["pair_discussion", "examiner_interview"]);
    // The two roles must be distinct, or a pair task becomes an interview.
    expect(stages[0].role).toBe("partner");
    expect(stages[1].role).toBe("examiner");
  });

  it("asks for a preference first and experience afterwards", () => {
    const stages = stagesForTaskType("speaking_picture_preference")!;
    expect(stages[0].communicationDemand).toBe("preference");
    expect(stages[1].communicationDemand).toBe("experience");
  });

  it("rejects a preference task with only two options", () => {
    const broken = structuredClone(variant("s-preference-ferie"));
    (broken.content as SpeakingContent).preferenceOptions = c.preferenceOptions!.slice(0, 2);
    const res = validateVariant(broken);
    expect(res.ok).toBe(false);
    expect(res.errors.join(" ")).toMatch(/expected exactly 4/);
  });
});

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

describe("task-aware evaluation", () => {
  it("judges a mindmap and an information gap on different things", () => {
    const mindmap = speakingCriteria("speaking_mindmap", speaking("s-mindmap-arbejde"));
    const gap = speakingCriteria("speaking_information_gap", speaking("s-infogap-cafe"));
    expect(mindmap.map((c) => c.id)).not.toEqual(gap.map((c) => c.id));
    expect(gap.map((c) => c.id)).toContain("asked");
    expect(gap.map((c) => c.id)).toContain("obtained");
    expect(mindmap.map((c) => c.id)).toContain("covered");
  });

  it("requires a preference and a reason on the preference task", () => {
    const ids = speakingCriteria("speaking_picture_preference", speaking("s-preference-ferie")).map(
      (c) => c.id
    );
    expect(ids).toContain("preference");
    expect(ids).toContain("reason");
  });

  it("reports what is still uncovered from the transcript", () => {
    const v = variant("s-mindmap-arbejde");
    let s = initialSpeakingState(v);
    s = recordCandidateTurn(s, "Jeg taler om transport til arbejde og mine arbejdsopgaver.");
    const covered = speakingCriteria("speaking_mindmap", speaking("s-mindmap-arbejde"), s).find(
      (c) => c.id === "covered"
    )!;
    expect(covered.detail).toMatch(/Ikke nævnt/);
    expect(covered.detail).not.toMatch(/arbejdsopgaver/);
  });

  it("leaves criteria self-assessed when there is no transcript", () => {
    const criteria = speakingCriteria("speaking_mindmap", speaking("s-mindmap-arbejde"));
    expect(criteria.every((c) => c.met === null)).toBe(true);
  });
});
