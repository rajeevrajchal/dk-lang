import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { EDUCATIONS, getUserLevel, markOnboarded, setUserLevel } from "@/lib/level";

const LevelSchema = z.object({
  education: z.enum(EDUCATIONS).nullable(),
  currentModule: z.number().int().min(1).max(5).nullable(),
  /**
   * Onboarding sends "ONBOARDING"; the Settings form sends nothing and is
   * treated as a correction to whatever the learner said before. Notably there
   * is no way to pass a score to this endpoint — level is told to us, never
   * measured. See docs/product-architecture.md §7.
   */
  source: z.literal("ONBOARDING").optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getUserLevel(session.user.id));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = LevelSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { education, currentModule, source } = parsed.data;

  const existing = await getUserLevel(session.user.id);
  await setUserLevel(
    session.user.id,
    { education, currentModule },
    // A correction keeps the provenance it already had where that makes
    // sense: editing the module after an official result still came from that
    // result. Onboarding always records itself.
    source === "ONBOARDING" ? "ONBOARDING" : (existing.levelSource ?? "ONBOARDING")
  );

  if (source === "ONBOARDING") await markOnboarded(session.user.id);

  return NextResponse.json(await getUserLevel(session.user.id));
}

/** "Skip for now" — onboarding is done, the level stays unset. */
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markOnboarded(session.user.id);
  return NextResponse.json(await getUserLevel(session.user.id));
}
