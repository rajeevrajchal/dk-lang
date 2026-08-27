import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verbs as verbsRepo } from "@/lib/repositories";
import { filterVerbs } from "@/lib/verbs";
import { VERB_GROUPS, VERB_THEMES } from "@/lib/verbs/constants";
import type { VerbFilter, VerbGroup, VerbTheme } from "@/types";

// The verb collection, joined to this learner's progress.
//
// Filtering happens on the server over all 500 rows rather than in the browser
// over a payload of all 500: the browse page is the one screen a learner opens
// on a phone to look one verb up, and shipping the whole collection to do it
// would be the slowest thing in the app.

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme");
  const group = Number(searchParams.get("group"));
  const status = searchParams.get("status");

  const filter: VerbFilter = {
    search: searchParams.get("search"),
    theme: (VERB_THEMES as readonly string[]).includes(theme ?? "")
      ? (theme as VerbTheme)
      : null,
    group: (VERB_GROUPS as readonly number[]).includes(group) ? (group as VerbGroup) : null,
    status:
      status === "learned" || status === "unlearned" || status === "struggling"
        ? status
        : "all",
  };

  const [all, stats] = await Promise.all([
    verbsRepo.withProgress(session.user.id),
    verbsRepo.stats(session.user.id),
  ]);

  const matched = filterVerbs(all, filter);
  const limit = Math.min(Number(searchParams.get("limit")) || 60, 200);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  return NextResponse.json({
    stats,
    total: matched.length,
    verbs: matched.slice(offset, offset + limit),
  });
};
