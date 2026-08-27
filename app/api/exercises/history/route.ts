import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exercises } from "@/lib/repositories";
import { TASK_NUMBER, VARIANT_BY_ID } from "@/lib/exercises/registry";
import type { TaskType } from "@/types";

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = Number(searchParams.get("moduleId"));
  const category = searchParams.get("category");

  const rows = await exercises.recentCompleted(
    session.user.id,
    { ...(moduleId ? { moduleId } : {}), ...(category ? { category } : {}) },
    30
  );

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
};
