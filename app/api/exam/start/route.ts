import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { content, exercises } from "@/lib/repositories";
import { MODULES } from "@/lib/curriculum/modules";

const StartSchema = z.object({
  moduleId: z.number(),
  skill: z.literal("READING"), // only reading is built out end-to-end so far
});

// Fixed-length, timed mock modultest for a single discipline. Unlike
// practice mode (lib/adaptive/engine.ts), item selection here is a
// representative, weighted sample across the module's tiers rather than an
// adaptive spiral — a mock exam should look like the real thing every time.
const TIER_WEIGHTS: Record<number, number> = { 1: 3, 2: 5, 3: 4 };
export const TIME_LIMIT_SECONDS = 12 * 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = StartSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { moduleId, skill } = parsed.data;

  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  }

  const examSession = await exercises.createExamSession({
    userId: session.user.id,
    moduleId,
    examType: mod.isFinalExam ? "PD3" : "MODULTEST",
    status: "IN_PROGRESS",
  });

  const picked: Awaited<ReturnType<typeof content.examPoolAtTier>> = [];
  for (const [tierStr, wanted] of Object.entries(TIER_WEIGHTS)) {
    const tierId = Number(tierStr);
    // MATCHING items are excluded from the timed mock exam UI for now (the
    // exam page only renders MC/TF/GAP_FILL); they still appear in adaptive
    // practice mode via lib/adaptive/engine.ts.
    const pool = await content.examPoolAtTier(moduleId, skill, tierId);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, wanted);
    picked.push(...shuffled);
  }
  const items = picked.sort(() => Math.random() - 0.5);

  return NextResponse.json({
    examSessionId: examSession.id,
    timeLimitSeconds: TIME_LIMIT_SECONDS,
    items: items.map((item) => ({
      id: item.id,
      tierId: item.tierId,
      type: item.type,
      topic: item.topic,
      passageText: item.passageText,
      passageId: item.passageId,
      promptText: item.promptText,
      optionsJson: item.optionsJson,
    })),
  });
}
