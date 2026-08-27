import { TASK_NUMBER } from "@/lib/exercises/constants";
import { VERB_BY_ID } from "@/lib/verbs";
import type {
  HistoryPassage,
  HistorySession,
  LearningInsight,
  MistakeRow,
  QuestionEventRow,
  TaskType,
} from "@/types";

// Turning the event log into something a learner can read.
//
// Pure functions over rows, with no database access, so the same grouping runs
// on the server for a page and in a test. The repository fetches; this decides
// what the rows mean.

export const HISTORY_SOURCES = ["EXERCISE", "VERB"] as const;

const opgaveTitle = (taskType: string | null, topic: string | null): string => {
  const n = taskType ? TASK_NUMBER[taskType as TaskType] : undefined;
  const label = n != null ? `Opgave ${n}` : (taskType ?? "Practice");
  return topic ? `${label} — ${topic}` : label;
};

/**
 * Groups events into Test → Paragraph → Question.
 *
 * Two levels of grouping, both by a key the event already carries: the attempt
 * it belonged to, then the passage within it. Verb practice has neither, so it
 * groups by day instead — a round of verbs is a session, not an opgave, and
 * pretending otherwise would produce a hundred one-question "tests".
 */
export const groupHistory = (events: QuestionEventRow[]): HistorySession[] => {
  const sessions = new Map<string, HistorySession>();

  for (const e of events) {
    const sessionKey =
      e.attemptId ?? `${e.source}:${new Date(e.createdAt).toISOString().slice(0, 10)}`;

    let session = sessions.get(sessionKey);
    if (!session) {
      session = {
        attemptId: e.attemptId,
        source: e.source as HistorySession["source"],
        title:
          e.source === "VERB"
            ? `Verb practice — ${new Date(e.createdAt).toLocaleDateString("en-GB")}`
            : opgaveTitle(e.taskType, e.topic),
        category: e.category,
        taskType: e.taskType,
        moduleId: e.moduleId,
        topic: e.topic,
        at: e.createdAt,
        correct: 0,
        total: 0,
        passages: [],
      };
      sessions.set(sessionKey, session);
    }

    // The newest event in a session dates it — events arrive newest-first.
    if (e.createdAt > session.at) session.at = e.createdAt;
    session.total += 1;
    if (e.isCorrect) session.correct += 1;

    const passageKey = e.passageLabel ?? "";
    let passage = session.passages.find((p) => (p.label ?? "") === passageKey);
    if (!passage) {
      passage = { label: e.passageLabel, text: e.passageText, questions: [] };
      session.passages.push(passage);
    }
    // The first event to name a passage supplies its text; later ones may have
    // been recorded before the text was captured.
    passage.text ??= e.passageText;

    passage.questions.push({
      id: e.id,
      questionText: e.questionText,
      danishText: e.danishText,
      userAnswer: e.userAnswer,
      correctAnswer: e.correctAnswer,
      isCorrect: e.isCorrect,
      explanation: e.explanation,
      grammarTopic: e.grammarTopic,
      attemptNumber: e.attemptNumber,
      createdAt: e.createdAt,
    });
  }

  const ordered = [...sessions.values()].sort((a, b) => (a.at < b.at ? 1 : -1));
  // Questions read in the order they were answered, not the order they came
  // back from the database.
  for (const s of ordered) {
    for (const p of s.passages) {
      p.questions.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    }
  }
  return ordered;
};

/** Whether a session has anything worth reviewing. */
export const hasMistakes = (session: HistorySession): boolean => {
  return session.passages.some((p: HistoryPassage) => p.questions.some((q) => !q.isCorrect));
};

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const MIN_EVIDENCE = 3;

/**
 * What this learner's mistakes have in common.
 *
 * Every insight is computed from their own rows and states how many mistakes
 * support it. Nothing is hardcoded and nothing is claimed on one data point —
 * `MIN_EVIDENCE` exists so the app never says "you struggle with word order"
 * because of a single slip.
 */
export const deriveInsights = (mistakes: MistakeRow[]): LearningInsight[] => {
  const open = mistakes.filter((m) => m.resolvedAt === null);
  const insights: LearningInsight[] = [];

  const countBy = <K extends keyof MistakeRow>(field: K): Map<string, number> => {
    const counts = new Map<string, number>();
    for (const m of open) {
      const value = m[field];
      if (typeof value !== "string" || !value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return counts;
  };

  const topicCounts = countBy("grammarTopic");
  for (const [topic, count] of [...topicCounts].sort((a, b) => b[1] - a[1]).slice(0, 3)) {
    if (count < MIN_EVIDENCE) continue;
    // A verb topic is named as a verb; anything else is a grammar area.
    const verb = VERB_BY_ID.get(topic);
    insights.push(
      verb
        ? {
            kind: "verb",
            key: topic,
            message: `“at ${verb.infinitive}” (${verb.english}) keeps catching you out.`,
            evidence: count,
            href: `/verbs?search=${encodeURIComponent(verb.infinitive)}`,
          }
        : {
            kind: "topic",
            key: topic,
            message: `You are still getting ${topic.replace(/[-:]/g, " ")} wrong.`,
            evidence: count,
            href: "/mistakes",
          }
    );
  }

  const taskCounts = countBy("taskType");
  for (const [taskType, count] of [...taskCounts].sort((a, b) => b[1] - a[1]).slice(0, 2)) {
    if (count < MIN_EVIDENCE) continue;
    const n = TASK_NUMBER[taskType as TaskType];
    insights.push({
      kind: "taskType",
      key: taskType,
      message:
        n != null
          ? `Opgave ${n} is where most of your open mistakes are.`
          : `Most of your open mistakes are in ${taskType.replace(/_/g, " ")}.`,
      evidence: count,
      href: "/mistakes",
    });
  }

  // The encouraging one, and the only reason resolved mistakes are kept.
  const resolved = mistakes.filter((m) => m.resolvedAt !== null).length;
  if (resolved >= MIN_EVIDENCE) {
    insights.push({
      kind: "streak",
      key: "resolved",
      message: `You have since answered ${resolved} previously-wrong question${resolved === 1 ? "" : "s"} correctly.`,
      evidence: resolved,
    });
  }

  // Struggling verbs, counted across the collection rather than per question:
  // "at vælge" wrong in three different modes is one verb, not three.
  const verbIds = new Set(
    open.filter((m) => m.source === "VERB" && m.grammarTopic).map((m) => m.grammarTopic!)
  );
  if (verbIds.size >= MIN_EVIDENCE) {
    insights.push({
      kind: "verb",
      key: "verbs",
      message: `You have struggled with these ${verbIds.size} verbs.`,
      evidence: verbIds.size,
      href: "/verbs?status=struggling",
    });
  }

  return insights;
};
