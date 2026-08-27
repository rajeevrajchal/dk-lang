import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  addOfficialTestResult,
  deleteOfficialTestResult,
  EDUCATIONS,
  listOfficialTestResults,
  OFFICIAL_RESULTS,
  TEST_TYPES,
} from "@/lib/level";

const ResultSchema = z.object({
  testType: z.enum(TEST_TYPES),
  education: z.enum(EDUCATIONS).nullable().optional(),
  module: z.number().int().min(1).max(5).nullable().optional(),
  result: z.enum(OFFICIAL_RESULTS).nullable().optional(),
  takenAt: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listOfficialTestResults(session.user.id));
};

/**
 * Records a real test the learner sat. Self-reported: the app takes their word
 * for it and says so in the UI, exactly as it does for a report card it has
 * OCR'd but not verified.
 */
export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ResultSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { takenAt, ...rest } = parsed.data;

  const row = await addOfficialTestResult(session.user.id, {
    ...rest,
    takenAt: takenAt ? new Date(takenAt) : null,
  });
  return NextResponse.json(row);
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const removed = await deleteOfficialTestResult(session.user.id, id);
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
};
