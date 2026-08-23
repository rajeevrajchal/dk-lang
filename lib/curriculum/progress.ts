import { DANISH_COURSE, CHAPTER_BY_ID } from "./course";
import { isAutoCheckable, type CourseChapter, type LessonExercise } from "./course-types";

// Progression through the course: what is done and what to do next.
//
// Pure functions over a plain record of lesson results, so the rules can be
// tested without a database. Persistence is the caller's problem.
//
// Mastery is deliberately forgiving. The point of the Class is to teach, not
// to gate — a learner who got 3 of 5 right has understood enough to move on
// and will meet the same grammar again in a later chapter anyway (that is what
// `revisits` is for). Demanding perfection would just trap people.

/** Fraction of auto-checkable exercises that must be right to count as passed. */
export const MASTERY_THRESHOLD = 0.6;

/**
 * Where a lesson has got to. A row exists as soon as the lesson is OPENED, so
 * "has a row" no longer means "is finished" — status is what says that.
 *
 * Optional, and treated as COMPLETED when absent: every row written before
 * lessons tracked a lifecycle was written on submission, and the pure
 * functions here are also called from tests that build a ProgressMap by hand.
 */
export const LESSON_STATUSES = ["IN_PROGRESS", "COMPLETED"] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export interface LessonResult {
  lessonSlug: string;
  /** Correct out of the auto-checkable exercises. Null if none were checkable. */
  score: number | null;
  total: number | null;
  completedAt: string;
  status?: LessonStatus;
  /** When the learner last had this lesson open — what resuming is based on. */
  lastVisitedAt?: string | null;
}

export type ProgressMap = Record<string, LessonResult>;

/** Whether the learner has finished this lesson (as opposed to opened it). */
export function lessonSubmitted(result: LessonResult | undefined): boolean {
  if (!result) return false;
  return (result.status ?? "COMPLETED") === "COMPLETED";
}

export function lessonPassed(result: LessonResult | undefined): boolean {
  if (!result) return false;
  // Opened but not handed in is not passed, however good the (absent) score.
  if (!lessonSubmitted(result)) return false;
  // A lesson made only of free-production work counts as done once submitted.
  if (result.total == null || result.total === 0) return true;
  return (result.score ?? 0) / result.total >= MASTERY_THRESHOLD;
}

/** Started but not finished — the state "Continue lesson" exists for. */
export function lessonInProgress(result: LessonResult | undefined): boolean {
  return !!result && !lessonPassed(result);
}

export function chapterLessonSlugs(chapter: CourseChapter): string[] {
  return chapter.topics.map((t) => t.lessonSlug);
}

export function chapterComplete(chapter: CourseChapter, progress: ProgressMap): boolean {
  return chapterLessonSlugs(chapter).every((slug) => lessonPassed(progress[slug]));
}

export function chapterProgress(
  chapter: CourseChapter,
  progress: ProgressMap
): { done: number; total: number } {
  const slugs = chapterLessonSlugs(chapter);
  return { done: slugs.filter((s) => lessonPassed(progress[s])).length, total: slugs.length };
}

/**
 * Every chapter is open, always.
 *
 * `prerequisites` still says what a chapter is built on — that is real, and
 * `missingPrerequisites` reports it — but it is a recommendation, not a gate.
 * A learner who wants to look ahead, or go back to Chapter 2 after finishing
 * Chapter 9, is doing something reasonable and should not be stopped.
 */
export type ChapterStatus = "available" | "in_progress" | "complete";

export function chapterStatus(chapter: CourseChapter, progress: ProgressMap): ChapterStatus {
  if (chapterComplete(chapter, progress)) return "complete";
  const { done } = chapterProgress(chapter, progress);
  return done > 0 ? "in_progress" : "available";
}

/**
 * The single thing to do next: the first unfinished lesson in course order.
 * This is what makes the Class able to answer "what should I learn next?"
 * rather than presenting a menu — a suggestion, not a restriction.
 */
export function nextUp(
  progress: ProgressMap
): { chapter: CourseChapter; lessonSlug: string } | null {
  for (const chapter of DANISH_COURSE.chapters) {
    const slug = chapterLessonSlugs(chapter).find((s) => !lessonPassed(progress[s]));
    if (slug) return { chapter, lessonSlug: slug };
  }
  return null;
}

/** Which prerequisites are still missing, for telling a learner what a
 * chapter builds on. Informational only — nothing is locked. */
export function missingPrerequisites(
  chapter: CourseChapter,
  progress: ProgressMap
): CourseChapter[] {
  return chapter.prerequisites
    .map((id) => CHAPTER_BY_ID.get(id))
    .filter((c): c is CourseChapter => !!c && !chapterComplete(c, progress));
}

/**
 * How ready the learner is for a PD3 module: the share of the chapters that
 * support it which are complete. A milestone, not a gate — the Practice Zone
 * keeps its own unlock rules (lib/unlock.ts), which this does not touch.
 */
export function moduleReadiness(
  moduleId: number,
  progress: ProgressMap
): { complete: number; total: number; ratio: number } {
  const chapters = DANISH_COURSE.chapters.filter((c) => c.supportsModules.includes(moduleId));
  const complete = chapters.filter((c) => chapterComplete(c, progress)).length;
  return {
    complete,
    total: chapters.length,
    ratio: chapters.length === 0 ? 0 : complete / chapters.length,
  };
}

/**
 * Progress across the whole course, for the Dashboard: how many lessons are
 * done out of how many exist, and which chapter the learner is in.
 */
export function courseProgress(progress: ProgressMap): {
  completed: number;
  total: number;
  ratio: number;
  chaptersComplete: number;
  chaptersTotal: number;
  currentChapter: CourseChapter | null;
} {
  const allSlugs = DANISH_COURSE.chapters.flatMap(chapterLessonSlugs);
  const completed = allSlugs.filter((s) => lessonPassed(progress[s])).length;
  const chaptersComplete = DANISH_COURSE.chapters.filter((c) =>
    chapterComplete(c, progress)
  ).length;
  const next = nextUp(progress);

  return {
    completed,
    total: allSlugs.length,
    ratio: allSlugs.length === 0 ? 0 : completed / allSlugs.length,
    chaptersComplete,
    chaptersTotal: DANISH_COURSE.chapters.length,
    currentChapter: next?.chapter ?? null,
  };
}

export interface ResumePoint {
  chapter: CourseChapter;
  lessonSlug: string;
  /** True when this is somewhere they left off rather than the next new thing. */
  resumed: boolean;
}

/**
 * Where "Continue learning" goes.
 *
 * The most recently visited lesson they have not finished wins — a learner who
 * stopped halfway through Chapter 4 should land back in Chapter 4, not at the
 * first gap in Chapter 2. With nothing open, this is just nextUp().
 */
export function resumePoint(progress: ProgressMap): ResumePoint | null {
  let best: { slug: string; at: number } | null = null;
  for (const [slug, result] of Object.entries(progress)) {
    if (lessonPassed(result)) continue;
    const at = new Date(result.lastVisitedAt ?? result.completedAt).getTime();
    if (Number.isNaN(at)) continue;
    if (!best || at > best.at) best = { slug, at };
  }

  if (best) {
    const chapter = DANISH_COURSE.chapters.find((c) =>
      chapterLessonSlugs(c).includes(best!.slug)
    );
    if (chapter) return { chapter, lessonSlug: best.slug, resumed: true };
  }

  const next = nextUp(progress);
  return next ? { ...next, resumed: false } : null;
}

// ---------------------------------------------------------------------------
// Grading the exercise ladder
// ---------------------------------------------------------------------------

function normalise(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}

export interface ExerciseCheck {
  id: string;
  /** Null when the exercise has no single right answer — the learner judges. */
  correct: boolean | null;
  expected?: string;
  explanation?: string;
}

/**
 * Checks one exercise. The top five rungs of the ladder have right answers;
 * free production and communication do not, and return null rather than a
 * fabricated verdict.
 */
export function gradeLessonExercise(
  exercise: LessonExercise,
  response: string
): ExerciseCheck {
  const base = { id: exercise.id, explanation: exercise.explanation };
  if (!isAutoCheckable(exercise.kind)) return { ...base, correct: null };

  switch (exercise.kind) {
    case "recognition": {
      const words = exercise.sentence.split(/\s+/);
      return {
        ...base,
        correct: response === String(exercise.answerIndex),
        expected: words[exercise.answerIndex],
      };
    }
    case "selection":
      return {
        ...base,
        correct: normalise(response) === normalise(exercise.answer),
        expected: exercise.answer,
      };
    case "matching": {
      // Response is "left→right" pairs joined by "|", order-insensitive.
      const given = new Set(response.split("|").map(normalise).filter(Boolean));
      const want = exercise.pairs.map((p) => normalise(`${p.left}→${p.right}`));
      return {
        ...base,
        correct: want.length === given.size && want.every((w) => given.has(w)),
        expected: exercise.pairs.map((p) => `${p.left} → ${p.right}`).join(", "),
      };
    }
    case "ordering":
      return {
        ...base,
        correct: normalise(response) === normalise(exercise.answer.join(" ")),
        expected: exercise.answer.join(" "),
      };
    case "controlled_production":
      return {
        ...base,
        correct: exercise.acceptedAnswers.some((a) => normalise(a) === normalise(response)),
        expected: exercise.acceptedAnswers[0],
      };
    default:
      return { ...base, correct: null };
  }
}

/** Grades a whole lesson's exercises. */
export function gradeLesson(
  exercises: LessonExercise[],
  responses: Record<string, string>
): { checks: ExerciseCheck[]; score: number | null; total: number | null } {
  const checks = exercises.map((e) => gradeLessonExercise(e, responses[e.id] ?? ""));
  const checkable = checks.filter((c) => c.correct !== null);
  if (checkable.length === 0) return { checks, score: null, total: null };
  return {
    checks,
    score: checkable.filter((c) => c.correct).length,
    total: checkable.length,
  };
}
