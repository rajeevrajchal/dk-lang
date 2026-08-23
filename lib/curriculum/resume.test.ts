import { describe, expect, it } from "vitest";
import { DANISH_COURSE } from "./course";
import { courseProgress, lessonInProgress, lessonPassed, resumePoint } from "./progress";
import type { ProgressMap } from "@/types";

// Lesson lifecycle and resuming. The rules that make "leave and come back"
// work, tested without a database.

const firstChapter = DANISH_COURSE.chapters[0];
const secondChapter = DANISH_COURSE.chapters[1];
const firstSlug = firstChapter.topics[0].lessonSlug;
const secondSlug = secondChapter.topics[0].lessonSlug;

const completed = (slug: string, at: string, score = 5, total = 5) => {
  return { lessonSlug: slug, score, total, completedAt: at, status: "COMPLETED" as const };
};

const opened = (slug: string, visitedAt: string) => {
  return {
    lessonSlug: slug,
    score: null,
    total: null,
    completedAt: visitedAt,
    status: "IN_PROGRESS" as const,
    lastVisitedAt: visitedAt,
  };
};

describe("lesson status", () => {
  it("does not treat an opened lesson as passed", () => {
    const result = opened(firstSlug, "2026-08-01T10:00:00Z");
    expect(lessonPassed(result)).toBe(false);
    expect(lessonInProgress(result)).toBe(true);
  });

  it("treats a legacy row with no status as completed", () => {
    // Every row written before the lifecycle field existed was written on
    // submission, so absence must mean COMPLETED or old progress vanishes.
    const legacy = { lessonSlug: firstSlug, score: 4, total: 5, completedAt: "2026-01-01" };
    expect(lessonPassed(legacy)).toBe(true);
  });

  it("still counts a submitted lesson with no auto-checkable exercises", () => {
    expect(lessonPassed(completed(firstSlug, "2026-08-01", 0, 0))).toBe(true);
  });

  it("fails a submitted lesson below the mastery threshold", () => {
    expect(lessonPassed(completed(firstSlug, "2026-08-01", 1, 5))).toBe(false);
  });
});

describe("resumePoint", () => {
  it("returns the first lesson of the course for a new learner", () => {
    const point = resumePoint({});
    expect(point?.chapter.id).toBe(firstChapter.id);
    expect(point?.lessonSlug).toBe(firstSlug);
    expect(point?.resumed).toBe(false);
  });

  it("returns the most recently visited unfinished lesson", () => {
    const progress: ProgressMap = {
      [firstSlug]: completed(firstSlug, "2026-08-01T10:00:00Z"),
      [secondSlug]: opened(secondSlug, "2026-08-05T10:00:00Z"),
    };
    const point = resumePoint(progress);
    expect(point?.lessonSlug).toBe(secondSlug);
    expect(point?.resumed).toBe(true);
  });

  it("prefers where the learner actually was over the earliest gap", () => {
    // A learner who skipped ahead and stopped in a later chapter should land
    // back there, not be dragged to the first hole in their progress.
    const laterSlug = DANISH_COURSE.chapters[2].topics[0].lessonSlug;
    const progress: ProgressMap = {
      [secondSlug]: opened(secondSlug, "2026-08-01T10:00:00Z"),
      [laterSlug]: opened(laterSlug, "2026-08-09T10:00:00Z"),
    };
    expect(resumePoint(progress)?.lessonSlug).toBe(laterSlug);
  });

  it("falls back to the next new lesson once everything opened is finished", () => {
    const progress: ProgressMap = { [firstSlug]: completed(firstSlug, "2026-08-01T10:00:00Z") };
    const point = resumePoint(progress);
    expect(point?.resumed).toBe(false);
    expect(point?.lessonSlug).not.toBe(firstSlug);
  });
});

describe("courseProgress", () => {
  it("counts only passed lessons", () => {
    const progress: ProgressMap = {
      [firstSlug]: completed(firstSlug, "2026-08-01T10:00:00Z"),
      [secondSlug]: opened(secondSlug, "2026-08-02T10:00:00Z"),
    };
    const summary = courseProgress(progress);
    expect(summary.completed).toBe(1);
    expect(summary.total).toBeGreaterThan(1);
    expect(summary.chaptersComplete).toBe(1);
    expect(summary.currentChapter?.id).toBe(secondChapter.id);
  });
});
