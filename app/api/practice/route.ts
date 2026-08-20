import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { selectPracticeSet } from "@/lib/adaptive/engine";
import { SKILLS, type Skill } from "@/lib/constants";
import { getServerDictionary } from "@/lib/i18n/server";
import { formatTierReason } from "@/lib/i18n/format";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = Number(searchParams.get("moduleId"));
  const skill = searchParams.get("skill") as Skill | null;
  const count = Number(searchParams.get("count") ?? 8);

  if (!moduleId || !skill || !SKILLS.includes(skill)) {
    return NextResponse.json({ error: "moduleId and a valid skill are required" }, { status: 400 });
  }

  const dict = await getServerDictionary();
  const result = await selectPracticeSet(session.user.id, moduleId, skill, count);
  return NextResponse.json({
    ...result,
    tierReason: formatTierReason(dict, result.tierReason),
  });
}
