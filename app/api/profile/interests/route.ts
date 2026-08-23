import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { users } from "@/lib/repositories";
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

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const interestsJson = await users.getInterestsJson(session.user.id);
  return NextResponse.json({ interests: parseInterests(interestsJson) });
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = InterestsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const json = JSON.stringify(parsed.data.interests);

  await users.setInterestsJson(session.user.id, json);

  return NextResponse.json({ interests: parsed.data.interests });
};
