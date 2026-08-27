import { describe, expect, it } from "vitest";
import { deriveInsights, groupHistory } from "./history";
import type { MistakeRow, QuestionEventRow } from "@/types";

const event = (over: Partial<QuestionEventRow> = {}): QuestionEventRow =>
  ({
    id: over.id ?? Math.random().toString(36).slice(2),
    userId: "u1",
    source: "EXERCISE",
    questionKey: "exercise:r1-bolig:1",
    attemptId: "attempt-1",
    examSessionId: null,
    moduleId: 2,
    category: "READING",
    taskType: "reading_task_1_matching",
    topic: "Bolig",
    grammarTopic: "reading-detail",
    questionText: "Which advert fits person 1?",
    danishText: "Familien søger et hus med have.",
    passageLabel: "Annoncerne",
    passageText: "A. Lejlighed…",
    userAnswer: "C",
    correctAnswer: "B",
    isCorrect: false,
    explanation: "B is the only one with a garden under 16,000 kr.",
    attemptNumber: 1,
    createdAt: "2026-08-20T10:00:00.000Z",
    ...over,
  }) as QuestionEventRow;

const mistake = (over: Partial<MistakeRow> = {}): MistakeRow =>
  ({
    id: Math.random().toString(36).slice(2),
    userId: "u1",
    questionKey: "k",
    source: "EXERCISE",
    moduleId: 2,
    category: "READING",
    taskType: "reading_task_1_matching",
    topic: "Bolig",
    grammarTopic: "word-order",
    questionText: "q",
    danishText: null,
    passageLabel: null,
    passageText: null,
    lastWrongAnswer: "C",
    correctAnswer: "B",
    explanation: null,
    attemptId: null,
    timesWrong: 1,
    timesRight: 0,
    lastWrongAt: "2026-08-20T10:00:00.000Z",
    lastSeenAt: "2026-08-20T10:00:00.000Z",
    resolvedAt: null,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
    ...over,
  }) as MistakeRow;

describe("grouping history", () => {
  it("keeps test → paragraph → question", () => {
    const [session] = groupHistory([
      event({ id: "a", passageLabel: "Afsnit 1", isCorrect: false }),
      event({ id: "b", passageLabel: "Afsnit 1", isCorrect: true }),
      event({ id: "c", passageLabel: "Afsnit 2", isCorrect: false }),
    ]);

    expect(session.passages).toHaveLength(2);
    expect(session.passages[0].label).toBe("Afsnit 1");
    expect(session.passages[0].questions).toHaveLength(2);
    expect(session.passages[1].questions).toHaveLength(1);
    expect(session.correct).toBe(1);
    expect(session.total).toBe(3);
  });

  it("keeps the paragraph text so a question can be reviewed in context", () => {
    const [session] = groupHistory([event({ passageText: "Hele afsnittet." })]);
    expect(session.passages[0].text).toBe("Hele afsnittet.");
  });

  it("separates two different attempts into two sessions", () => {
    const sessions = groupHistory([
      event({ attemptId: "attempt-1" }),
      event({ attemptId: "attempt-2" }),
    ]);
    expect(sessions).toHaveLength(2);
  });

  it("groups verb practice by day, since it has no attempt to group by", () => {
    const sessions = groupHistory([
      event({ source: "VERB", attemptId: null, createdAt: "2026-08-20T09:00:00.000Z" }),
      event({ source: "VERB", attemptId: null, createdAt: "2026-08-20T18:00:00.000Z" }),
      event({ source: "VERB", attemptId: null, createdAt: "2026-08-21T09:00:00.000Z" }),
    ]);
    expect(sessions).toHaveLength(2);
  });

  it("puts the newest session first", () => {
    const sessions = groupHistory([
      event({ attemptId: "new", createdAt: "2026-08-25T10:00:00.000Z" }),
      event({ attemptId: "old", createdAt: "2026-08-01T10:00:00.000Z" }),
    ]);
    expect(sessions[0].attemptId).toBe("new");
  });
});

describe("insights", () => {
  it("says nothing without enough evidence", () => {
    expect(deriveInsights([mistake(), mistake()])).toEqual([]);
  });

  it("names a grammar area once there are enough mistakes in it", () => {
    const insights = deriveInsights([
      mistake({ grammarTopic: "word-order" }),
      mistake({ grammarTopic: "word-order" }),
      mistake({ grammarTopic: "word-order" }),
    ]);
    const topic = insights.find((i) => i.kind === "topic");
    expect(topic?.message).toContain("word order");
    expect(topic?.evidence).toBe(3);
  });

  it("counts struggling verbs as verbs, not as questions", () => {
    const insights = deriveInsights([
      mistake({ source: "VERB", grammarTopic: "vælge", taskType: "DA_EN" }),
      mistake({ source: "VERB", grammarTopic: "vælge", taskType: "EN_DA" }),
      mistake({ source: "VERB", grammarTopic: "gælde", taskType: "DA_EN" }),
      mistake({ source: "VERB", grammarTopic: "smøre", taskType: "DA_EN" }),
    ]);
    const summary = insights.find((i) => i.key === "verbs");
    // Three distinct verbs across four mistakes.
    expect(summary?.message).toContain("3 verbs");
  });

  it("ignores mistakes the learner has since answered correctly", () => {
    const resolved = { resolvedAt: "2026-08-22T10:00:00.000Z" };
    const insights = deriveInsights([
      mistake({ grammarTopic: "word-order", ...resolved }),
      mistake({ grammarTopic: "word-order", ...resolved }),
      mistake({ grammarTopic: "word-order", ...resolved }),
    ]);
    expect(insights.some((i) => i.kind === "topic")).toBe(false);
    expect(insights.find((i) => i.kind === "streak")?.evidence).toBe(3);
  });
});
