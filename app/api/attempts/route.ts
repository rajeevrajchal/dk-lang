import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gradeResponse } from "@/lib/grading";
import { recordAttemptEffects } from "@/lib/adaptive/engine";
import type { ItemTypeCode, Skill } from "@/lib/constants";

const AttemptSchema = z.object({
  itemId: z.string(),
  response: z.union([z.string(), z.array(z.string())]),
  timeMs: z.number().optional(),
  examSessionId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = AttemptSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { itemId, response, timeMs, examSessionId } = parsed.data;

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const isCorrect = gradeResponse(item.type as ItemTypeCode, item.answerJson, response);

  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      itemId,
      examSessionId,
      responseJson: JSON.stringify(response),
      isCorrect,
      timeMs,
    },
  });

  await recordAttemptEffects(session.user.id, itemId, item.skill as Skill, isCorrect);

  return NextResponse.json({
    isCorrect,
    explanation: item.explanation,
    correctAnswer: JSON.parse(item.answerJson),
  });
}
