import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { READING_TOPICS } from "@/lib/reading/library";
import { parseInterests } from "@/lib/reading/interests";

// What the learner is interested in reading about.
//
// On UserProfile rather than a table of its own: it is a short list of facts
// about the learner, in the same place as their level. Recommendations read
// it; nothing else does, and an empty list simply means recommendations fall
// back to level alone.

const InterestsSchema = z.object({
  interests: z.array(z.enum(READING_TOPICS)).max(READING_TOPICS.length),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { interestsJson: true },
  });
  return NextResponse.json({ interests: parseInterests(profile?.interestsJson) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = InterestsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const json = JSON.stringify(parsed.data.interests);

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: { interestsJson: json },
    create: { userId: session.user.id, interestsJson: json },
  });

  return NextResponse.json({ interests: parsed.data.interests });
}
