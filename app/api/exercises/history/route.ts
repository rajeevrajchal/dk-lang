import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TASK_NUMBER, VARIANT_BY_ID } from "@/lib/exercises/registry";
import type { TaskType } from "@/lib/exercises/types";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = Number(searchParams.get("moduleId"));
  const category = searchParams.get("category");

  const rows = await prisma.exerciseAttempt.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      ...(moduleId ? { moduleId } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { completedAt: "desc" },
    take: 30,
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      category: r.category,
      taskType: r.taskType,
      taskNumber: TASK_NUMBER[r.taskType as TaskType] ?? null,
      topic: r.topic,
      generated: r.generated,
      title: r.variantJson
        ? ((JSON.parse(r.variantJson) as { title?: string }).title ?? r.topic)
        : (VARIANT_BY_ID.get(r.variantId)?.title ?? r.variantId),
      score: r.score,
      total: r.total,
      mistakes: r.mistakes,
      completedAt: r.completedAt,
    }))
  );
}
