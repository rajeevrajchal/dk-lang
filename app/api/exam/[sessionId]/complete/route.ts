import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { applyInAppExamResult, EXAM_PASS_THRESHOLD } from "@/lib/unlock";
import type { Skill } from "@/lib/constants";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sessionId } = await params;

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { attempts: true },
  });
  if (!examSession || examSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (examSession.status === "COMPLETED") {
    return NextResponse.json({
      score: JSON.parse(examSession.scoresJson ?? "{}"),
      passed: JSON.parse(examSession.passedJson ?? "{}"),
    });
  }

  const total = examSession.attempts.length;
  const correct = examSession.attempts.filter((a) => a.isCorrect).length;
  const score = total > 0 ? correct / total : 0;
  const passed = score >= EXAM_PASS_THRESHOLD;

  // Only READING is exercised end-to-end today (see app/api/exam/start).
  const skill: Skill = "READING";

  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      scoresJson: JSON.stringify({ [skill]: score }),
      passedJson: JSON.stringify({ [skill]: passed }),
    },
  });

  await applyInAppExamResult(session.user.id, examSession.moduleId, skill, score, passed);

  return NextResponse.json({ score, correct, total, passed, threshold: EXAM_PASS_THRESHOLD });
}
