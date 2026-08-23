import { describe, it, expect } from "vitest";
import { THEORY_LESSONS, THEORY_BY_SLUG } from "@/lib/content-gen/theory";
import { FOUNDATION_LESSONS } from "./foundation-lessons";
import {
  ALL_LESSONS,
  CHAPTER_BY_ID,
  DANISH_COURSE,
  LESSON_BY_SLUG,
  chapterForLesson,
  chaptersForModule,
  courseLessonSlugs,
  nextLessonAfter,
} from "./course";
import { EXERCISE_LADDER, isAutoCheckable } from "./course-constants";
import { chapterComplete, chapterStatus, gradeLesson, gradeLessonExercise, lessonPassed, missingPrerequisites, moduleReadiness, nextUp } from "./progress";
import type { ProgressMap } from "@/types";

const done = (slug: string, score = 5, total = 5) => ({
  lessonSlug: slug,
  score,
  total,
  completedAt: new Date().toISOString(),
});

/** Marks every lesson of the named chapters as passed. */
const completed = (...chapterIds: string[]): ProgressMap => {
  const p: ProgressMap = {};
  for (const id of chapterIds) {
    for (const t of CHAPTER_BY_ID.get(id)!.topics) p[t.lessonSlug] = done(t.lessonSlug);
  }
  return p;
};

// ---------------------------------------------------------------------------
// Backward compatibility — nothing that worked before may break
// ---------------------------------------------------------------------------

describe("backward compatibility", () => {
  it("keeps all twelve original theory lessons, unchanged in shape", () => {
    expect(THEORY_LESSONS).toHaveLength(12);
    for (const l of THEORY_LESSONS) {
      expect(l.slug).toBeTruthy();
      expect(l.sections.length).toBeGreaterThan(0);
      expect(Array.isArray(l.pitfalls)).toBe(true);
    }
  });

  it("keeps every original lesson reachable by its old slug", () => {
    for (const l of THEORY_LESSONS) {
      expect(THEORY_BY_SLUG.get(l.slug)).toBe(l);
    }
  });

  it("leaves the original lessons' new optional fields unset", () => {
    // They were written before the course existed. They must still validate
    // and render without objectives or exercises.
    const original = THEORY_BY_SLUG.get("present-tense")!;
    expect(original.exercises).toBeUndefined();
    expect(original.learningObjectives).toBeUndefined();
    expect(original.primer).toBeUndefined();
  });

  it("adds new lessons without touching the originals", () => {
    // Asserted by composition rather than a count: reading and writing
    // lessons are added to ALL_LESSONS over time, and a magic number would
    // fail every time content is written while proving nothing. What must
    // hold is that every original lesson is still present, by identity.
    for (const l of THEORY_LESSONS) expect(ALL_LESSONS).toContain(l);
    for (const l of FOUNDATION_LESSONS) expect(ALL_LESSONS).toContain(l);
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(
      THEORY_LESSONS.length + FOUNDATION_LESSONS.length
    );
    // No slug is defined twice — that would make LESSON_BY_SLUG ambiguous.
    const slugs = ALL_LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

// ---------------------------------------------------------------------------
// Curriculum integrity
// ---------------------------------------------------------------------------

describe("curriculum integrity", () => {
  it("references only lessons that exist", () => {
    for (const slug of courseLessonSlugs()) {
      expect(LESSON_BY_SLUG.get(slug), `missing lesson: ${slug}`).toBeDefined();
    }
  });

  it("numbers chapters consecutively from 1", () => {
    const numbers = DANISH_COURSE.chapters.map((c) => c.number);
    expect(numbers).toEqual(numbers.map((_, i) => i + 1));
  });

  it("starts with a chapter that depends on nothing", () => {
    expect(DANISH_COURSE.chapters[0].prerequisites).toEqual([]);
  });

  it("never names a prerequisite that comes later in the course", () => {
    for (const c of DANISH_COURSE.chapters) {
      for (const p of c.prerequisites) {
        const prereq = CHAPTER_BY_ID.get(p);
        expect(prereq, `unknown prerequisite ${p}`).toBeDefined();
        expect(prereq!.number).toBeLessThan(c.number);
      }
    }
  });

  it("uses each lesson in exactly one chapter", () => {
    const slugs = courseLessonSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("maps a lesson back to its chapter", () => {
    expect(chapterForLesson("present-tense")?.id).toBe("ch-present-tense");
    expect(chapterForLesson("what-is-a-sentence")?.number).toBe(1);
  });

  it("walks the whole course in order, one lesson at a time", () => {
    const slugs = courseLessonSlugs();
    const walked = [slugs[0]];
    let step = nextLessonAfter(slugs[0]);
    while (step) {
      walked.push(step.lessonSlug);
      step = nextLessonAfter(step.lessonSlug);
    }
    expect(walked).toEqual(slugs);
  });

  it("crosses from the last lesson of a chapter into the next chapter", () => {
    const first = DANISH_COURSE.chapters[0];
    const last = first.topics[first.topics.length - 1].lessonSlug;
    expect(nextLessonAfter(last)?.chapter.id).toBe(DANISH_COURSE.chapters[1].id);
  });

  it("has nowhere to go after the final lesson, and knows nothing of made-up ones", () => {
    const slugs = courseLessonSlugs();
    expect(nextLessonAfter(slugs[slugs.length - 1])).toBeNull();
    expect(nextLessonAfter("no-such-lesson")).toBeNull();
  });

  it("only revisits chapters that came earlier", () => {
    for (const c of DANISH_COURSE.chapters) {
      for (const r of c.revisits ?? []) {
        expect(CHAPTER_BY_ID.get(r)!.number).toBeLessThan(c.number);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Beginner-friendliness — the headline requirement
// ---------------------------------------------------------------------------

describe("beginner-friendliness", () => {
  const chapter1 = DANISH_COURSE.chapters[0];
  const firstLesson = LESSON_BY_SLUG.get(chapter1.topics[0].lessonSlug)!;

  it("explains the grammar words before using them", () => {
    expect(firstLesson.primer).toBeTruthy();
    // The very first lesson must define "verb" rather than assume it.
    const text = JSON.stringify(firstLesson).toLowerCase();
    expect(text).toContain("a verb is a word");
  });

  it("tells the learner what they will be able to do", () => {
    expect(firstLesson.learningObjectives?.length).toBeGreaterThan(0);
    expect(firstLesson.canDo).toBeTruthy();
  });

  it("leads in English while the learner has no Danish", () => {
    expect(chapter1.supportLanguage).toBe("english_led");
  });

  it("shifts towards Danish as the course goes on", () => {
    const last = DANISH_COURSE.chapters[DANISH_COURSE.chapters.length - 1];
    expect(last.supportLanguage).toBe("danish_led");
  });

  it("starts at single words and ends at communication", () => {
    expect(chapter1.stage).toBe("words");
    const last = DANISH_COURSE.chapters[DANISH_COURSE.chapters.length - 1];
    expect(last.stage).toBe("communication");
  });
});

// ---------------------------------------------------------------------------
// Exercise ladder
// ---------------------------------------------------------------------------

describe("exercise ladder", () => {
  const lesson = LESSON_BY_SLUG.get("what-is-a-sentence")!;

  it("attaches exercises to the foundation lessons", () => {
    expect(lesson.exercises?.length).toBeGreaterThan(4);
  });

  it("climbs the ladder rather than staying at recognition", () => {
    const rungs = lesson.exercises!.map((e) => EXERCISE_LADDER[e.kind]);
    expect(Math.min(...rungs)).toBe(EXERCISE_LADDER.recognition);
    // The last exercise must ask the learner to produce, not just recognise.
    expect(rungs[rungs.length - 1]).toBeGreaterThanOrEqual(
      EXERCISE_LADDER.controlled_production
    );
  });

  it("never goes backwards down the ladder within a lesson", () => {
    for (const l of ALL_LESSONS) {
      if (!l.exercises) continue;
      const rungs = l.exercises.map((e) => EXERCISE_LADDER[e.kind]);
      for (let i = 1; i < rungs.length; i++) {
        expect(rungs[i], `${l.slug} exercise ${i}`).toBeGreaterThanOrEqual(rungs[i - 1]);
      }
    }
  });

  it("gives every exercise a unique id", () => {
    const ids = ALL_LESSONS.flatMap((l) => l.exercises ?? []).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("knows which rungs can be auto-checked", () => {
    expect(isAutoCheckable("recognition")).toBe(true);
    expect(isAutoCheckable("controlled_production")).toBe(true);
    expect(isAutoCheckable("free_production")).toBe(false);
    expect(isAutoCheckable("communication")).toBe(false);
  });
});

describe("grading", () => {
  const lesson = LESSON_BY_SLUG.get("what-is-a-sentence")!;

  it("marks the right word in a recognition exercise", () => {
    const ex = lesson.exercises!.find((e) => e.kind === "recognition")!;
    expect(gradeLessonExercise(ex, "1").correct).toBe(true);
    expect(gradeLessonExercise(ex, "0").correct).toBe(false);
  });

  it("ignores case and punctuation in produced answers", () => {
    const ex = lesson.exercises!.find((e) => e.kind === "controlled_production")!;
    expect(gradeLessonExercise(ex, "jeg arbejder").correct).toBe(true);
    expect(gradeLessonExercise(ex, "Jeg arbejder.").correct).toBe(true);
    expect(gradeLessonExercise(ex, "Jeg bor").correct).toBe(false);
  });

  it("accepts a correctly ordered sentence", () => {
    const ex = lesson.exercises!.find((e) => e.kind === "ordering")!;
    expect(gradeLessonExercise(ex, "Jeg bor i Aarhus").correct).toBe(true);
    expect(gradeLessonExercise(ex, "Bor jeg i Aarhus").correct).toBe(false);
  });

  it("accepts matching pairs in any order", () => {
    const ex = lesson.exercises!.find((e) => e.kind === "matching")!;
    expect(gradeLessonExercise(ex, "de→they|jeg→I|han→he|vi→we").correct).toBe(true);
    expect(gradeLessonExercise(ex, "jeg→he|han→I|vi→we|de→they").correct).toBe(false);
  });

  it("refuses to judge free production rather than faking a verdict", () => {
    const free = ALL_LESSONS.flatMap((l) => l.exercises ?? []).find(
      (e) => e.kind === "free_production"
    )!;
    expect(gradeLessonExercise(free, "anything at all").correct).toBeNull();
  });

  it("scores a lesson out of only its checkable exercises", () => {
    const responses: Record<string, string> = {};
    for (const e of lesson.exercises!) {
      if (e.kind === "recognition") responses[e.id] = String(e.answerIndex);
      if (e.kind === "selection") responses[e.id] = e.answer;
      if (e.kind === "ordering") responses[e.id] = e.answer.join(" ");
      if (e.kind === "controlled_production") responses[e.id] = e.acceptedAnswers[0];
      if (e.kind === "matching")
        responses[e.id] = e.pairs.map((p) => `${p.left}→${p.right}`).join("|");
    }
    const { score, total } = gradeLesson(lesson.exercises!, responses);
    expect(score).toBe(total);
    // The communication exercise is not counted — it cannot be.
    expect(total).toBeLessThan(lesson.exercises!.length);
  });
});

// ---------------------------------------------------------------------------
// Progression
// ---------------------------------------------------------------------------

describe("progression", () => {
  it("points a brand-new learner at Chapter 1", () => {
    const next = nextUp({});
    expect(next?.chapter.number).toBe(1);
    expect(next?.lessonSlug).toBe("what-is-a-sentence");
  });

  it("counts a lesson as passed at 60%, not only at perfection", () => {
    expect(lessonPassed(done("x", 3, 5))).toBe(true);
    expect(lessonPassed(done("x", 2, 5))).toBe(false);
    expect(lessonPassed(undefined)).toBe(false);
  });

  it("counts a lesson with no checkable exercises as done once submitted", () => {
    expect(lessonPassed({ lessonSlug: "x", score: null, total: null, completedAt: "" })).toBe(true);
  });

  it("never locks a chapter, however little has been done", () => {
    // Prerequisites are advice about what a chapter builds on, not a gate:
    // a learner may open any chapter, in any order, at any time.
    for (const chapter of DANISH_COURSE.chapters) {
      expect(chapterStatus(chapter, {})).not.toBe("locked");
    }
  });

  it("explains which prerequisite is missing", () => {
    const present = CHAPTER_BY_ID.get("ch-present-tense")!;
    const missing = missingPrerequisites(present, completed("ch-sentence-basics"));
    expect(missing.map((c) => c.id)).toEqual(["ch-pronouns"]);
  });

  it("moves the learner on once a chapter is done", () => {
    const next = nextUp(completed("ch-sentence-basics"));
    expect(next?.chapter.number).toBe(2);
  });

  it("reports chapter status", () => {
    const p = completed("ch-sentence-basics");
    expect(chapterStatus(CHAPTER_BY_ID.get("ch-sentence-basics")!, p)).toBe("complete");
    expect(chapterStatus(CHAPTER_BY_ID.get("ch-nouns")!, p)).toBe("available");
    expect(chapterStatus(CHAPTER_BY_ID.get("ch-subordinate")!, p)).toBe("available");
  });

  it("treats a chapter with a half-finished multi-lesson topic as in progress", () => {
    const modals = CHAPTER_BY_ID.get("ch-future-modals")!;
    // The exact number of topics is incidental and grows as reading and
    // writing lessons are added; what the test needs is more than one.
    expect(modals.topics.length).toBeGreaterThan(1);
    const partial: ProgressMap = { [modals.topics[0].lessonSlug]: done(modals.topics[0].lessonSlug) };
    expect(chapterComplete(modals, partial)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PD3 modules as milestones, not the spine
// ---------------------------------------------------------------------------

describe("module alignment", () => {
  it("lets one grammar point support several modules", () => {
    const present = CHAPTER_BY_ID.get("ch-present-tense")!;
    expect(present.supportsModules.length).toBeGreaterThan(1);
    expect(present.supportsModules).toContain(2);
  });

  it("is spined on grammar, not partitioned by module", () => {
    // If modules were the spine, each chapter would belong to exactly one
    // module and the modules would carve the course into blocks. Instead most
    // chapters serve several modules, and the modules' chapter sets overlap —
    // which is what "a grammar topic can support multiple modules" means.
    const multiModule = DANISH_COURSE.chapters.filter((c) => c.supportsModules.length > 1);
    expect(multiModule.length).toBeGreaterThan(DANISH_COURSE.chapters.length / 2);

    const forModule2 = new Set(chaptersForModule(2).map((c) => c.id));
    const forModule3 = new Set(chaptersForModule(3).map((c) => c.id));
    const shared = [...forModule2].filter((id) => forModule3.has(id));
    expect(shared.length).toBeGreaterThan(0);
  });

  it("finds the chapters that build towards a module", () => {
    const forModule2 = chaptersForModule(2);
    expect(forModule2.length).toBeGreaterThan(3);
    expect(forModule2.map((c) => c.id)).toContain("ch-subordinate");
  });

  it("reports readiness as a share of supporting chapters", () => {
    const none = moduleReadiness(2, {});
    expect(none.ratio).toBe(0);
    const some = moduleReadiness(2, completed("ch-sentence-basics"));
    expect(some.complete).toBe(1);
    expect(some.ratio).toBeGreaterThan(0);
    expect(some.ratio).toBeLessThan(1);
  });
});
