import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { verbs as verbsRepo } from "@/lib/repositories";

// The learner's own "I know this" mark.
//
// Deliberately not derived from practice accuracy: what the learner claims and
// what the app measured are two different facts, and the app keeps both so it
// can notice when they disagree.

const LearnedSchema = z.object({
  verbId: z.string().min(1).max(60),
  learned: z.boolean(),
});

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = LearnedSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await verbsRepo.setLearned(session.user.id, parsed.data.verbId, parsed.data.learned);
  } catch {
    return NextResponse.json({ error: "Unknown verb" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
};
