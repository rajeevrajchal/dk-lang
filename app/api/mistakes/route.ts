import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { history } from "@/lib/repositories";
import { deriveInsights, HISTORY_SOURCES } from "@/lib/learning/history";
import type { HistorySource } from "@/types";

// Everything the learner has got wrong, and what those mistakes have in
// common.
//
// The insights are computed from the same rows that are returned, so a learner
// can always check the claim against the list underneath it — which is the
// point of computing them from real performance rather than asserting them.

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "resolved" || statusParam === "all" ? statusParam : "open";

  const [mistakes, all] = await Promise.all([
    history.listMistakes(session.user.id, {
      source: (HISTORY_SOURCES as readonly string[]).includes(source ?? "")
        ? (source as HistorySource)
        : undefined,
      category: searchParams.get("category") ?? undefined,
      status,
      limit: Math.min(Number(searchParams.get("limit")) || 100, 200),
    }),
    // Insights are derived from EVERY mistake, not the filtered page — a
    // pattern computed from what happens to be on screen is not a pattern.
    history.allMistakes(session.user.id),
  ]);

  return NextResponse.json({
    mistakes,
    insights: deriveInsights(all),
    counts: {
      open: all.filter((m) => m.resolvedAt === null).length,
      resolved: all.filter((m) => m.resolvedAt !== null).length,
    },
  });
};
