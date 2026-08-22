import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VARIANT_BY_ID } from "@/lib/exercises/registry";
import { generateExplanation, explanationAvailable } from "@/lib/exercises/explain";
import type { ExerciseVariant } from "@/lib/exercises/types";

// A full sentence-and-word pass over a long opgave takes a while.
export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { attemptId } = await params;

  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // The explanation translates the whole text and walks its grammar, so it
  // would hand over the answers. It is only available once the learner has
  // actually answered — and, inside a mock test, once the test is handed in.
  if (attempt.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Answer the exercise first" },
      { status: 409 }
    );
  }
  if (attempt.examSessionId) {
    const exam = await prisma.examSession.findUnique({
      where: { id: attempt.examSessionId },
      select: { status: true },
    });
    if (exam?.status !== "COMPLETED") {
      return NextResponse.json({ error: "Finish the test first" }, { status: 409 });
    }
  }

  // Cached from a previous open.
  if (attempt.explanationJson) {
    return NextResponse.json({ cached: true, ...JSON.parse(attempt.explanationJson) });
  }

  if (!explanationAvailable()) {
    return NextResponse.json(
      { error: "unavailable", reason: "no ANTHROPIC_API_KEY set" },
      { status: 503 }
    );
  }

  const variant: ExerciseVariant | undefined = attempt.variantJson
    ? (JSON.parse(attempt.variantJson) as ExerciseVariant)
    : VARIANT_BY_ID.get(attempt.variantId);
  if (!variant) {
    return NextResponse.json({ error: "Unknown exercise" }, { status: 410 });
  }

  const outcome = await generateExplanation(variant);
  if (!outcome.explanation) {
    return NextResponse.json(
      { error: "unavailable", reason: outcome.reason },
      { status: 503 }
    );
  }

  await prisma.exerciseAttempt.update({
    where: { id: attemptId },
    data: { explanationJson: JSON.stringify(outcome.explanation) },
  });

  return NextResponse.json({ cached: false, ...outcome.explanation });
}
