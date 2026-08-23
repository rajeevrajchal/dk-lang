"use client";

import { useEffect } from "react";

/**
 * Records that this lesson is open, once, when the page mounts.
 *
 * This is what makes "continue where you left off" possible: without a row
 * written on open, an abandoned lesson leaves no trace and the app can only
 * ever offer the next unstarted one. Fire-and-forget — a failed call costs a
 * resume point, not the lesson.
 */
export function LessonVisit({
  lessonSlug,
  chapterId,
}: {
  lessonSlug: string;
  chapterId: string;
}) {
  useEffect(() => {
    fetch("/api/lessons/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonSlug, chapterId }),
    }).catch(() => {});
  }, [lessonSlug, chapterId]);

  return null;
}
