import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { lessons } from "@/lib/repositories";
import { LESSON_BY_SLUG, chapterForLesson } from "@/lib/curriculum/course";
import { gradeLesson } from "@/lib/curriculum/progress";

/** Everything the learner has completed, keyed by lesson slug. */
export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await lessons.loadProgress(session.user.id));
};

const SubmitSchema = z.object({
  lessonSlug: z.string(),
  responses: z.record(z.string(), z.string()),
});

/**
 * Records a finished lesson. Grading happens here rather than in the browser
 * so the answer keys stay server-side, the same rule the Practice Zone
 * follows.
 */
export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { lessonSlug, responses } = parsed.data;

  const lesson = LESSON_BY_SLUG.get(lessonSlug);
  if (!lesson) return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });

  const { checks, score, total } = gradeLesson(lesson.exercises ?? [], responses);
  const chapter = chapterForLesson(lessonSlug);

  await lessons.recordCompletion(session.user.id, lessonSlug, {
    chapterId: chapter?.id ?? null,
    score,
    total,
    responsesJson: JSON.stringify(responses),
  });

  return NextResponse.json({ checks, score, total });
};
