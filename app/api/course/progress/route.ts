import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LESSON_BY_SLUG, chapterForLesson } from "@/lib/curriculum/course";
import { gradeLesson, type ProgressMap } from "@/lib/curriculum/progress";

/** Everything the learner has completed, keyed by lesson slug. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id },
  });

  const progress: ProgressMap = {};
  for (const r of rows) {
    progress[r.lessonSlug] = {
      lessonSlug: r.lessonSlug,
      score: r.score,
      total: r.total,
      completedAt: r.completedAt.toISOString(),
    };
  }
  return NextResponse.json(progress);
}

const SubmitSchema = z.object({
  lessonSlug: z.string(),
  responses: z.record(z.string(), z.string()),
});

/**
 * Records a finished lesson. Grading happens here rather than in the browser
 * so the answer keys stay server-side, the same rule the Practice Zone
 * follows.
 */
export async function POST(req: Request) {
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

  await prisma.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId: session.user.id, lessonSlug } },
    // Re-doing a lesson keeps the better score — the Class teaches, it does
    // not punish a second attempt.
    update: {
      score: score,
      total: total,
      responsesJson: JSON.stringify(responses),
      chapterId: chapter?.id ?? null,
    },
    create: {
      userId: session.user.id,
      lessonSlug,
      chapterId: chapter?.id ?? null,
      score,
      total,
      responsesJson: JSON.stringify(responses),
    },
  });

  return NextResponse.json({ checks, score, total });
}
