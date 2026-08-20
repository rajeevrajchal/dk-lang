import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VARIANT_BY_ID } from "@/lib/exercises/registry";
import { gradeExercise } from "@/lib/exercises/grading";
import type { ExerciseVariant } from "@/lib/exercises/types";

const SubmitSchema = z.object({
  response: z.record(z.string(), z.string()),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { attemptId } = await params;

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Generated exercises carry their own answer key on the attempt row;
  // authored ones are looked up in the registry.
  const variant: ExerciseVariant | undefined = attempt.variantJson
    ? (JSON.parse(attempt.variantJson) as ExerciseVariant)
    : VARIANT_BY_ID.get(attempt.variantId);

  if (!variant) {
    return NextResponse.json({ error: "Unknown exercise" }, { status: 410 });
  }

  // Grading happens here, never on the client — the answer key lives only in
  // the variant on the server.
  const result = gradeExercise(variant, parsed.data.response);

  // Already submitted: return the stored grading rather than re-scoring, so a
  // double submit can't overwrite the first result.
  if (attempt.status === "COMPLETED") {
    return NextResponse.json({ alreadySubmitted: true, ...result });
  }

  await prisma.exerciseAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      responseJson: JSON.stringify(parsed.data.response),
      score: result.score,
      total: result.total,
      mistakes: result.mistakes,
      wordCount: result.wordCount ?? null,
    },
  });

  return NextResponse.json(result);
}
