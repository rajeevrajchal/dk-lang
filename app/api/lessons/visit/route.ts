import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { LESSON_BY_SLUG } from "@/lib/curriculum/course";
import { recordLessonVisit } from "@/lib/curriculum/lesson-progress";

const VisitSchema = z.object({
  lessonSlug: z.string(),
  chapterId: z.string().nullable().optional(),
});

/** Marks a lesson as opened, so the learner can be sent back to it later. */
export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = VisitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!LESSON_BY_SLUG.has(parsed.data.lessonSlug)) {
    return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  }

  await recordLessonVisit(
    session.user.id,
    parsed.data.lessonSlug,
    parsed.data.chapterId ?? null
  );
  return NextResponse.json({ ok: true });
};
