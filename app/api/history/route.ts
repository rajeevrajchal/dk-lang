import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { history } from "@/lib/repositories";
import { groupHistory } from "@/lib/learning/history";
import { HISTORY_SOURCES } from "@/lib/learning/history";
import type { HistorySource } from "@/types";

// The learner's own history, grouped Test → Paragraph → Question.
//
// The grouping happens on the server because it is the same function the
// mistake review uses, and because the client has no business knowing that a
// "session" is really an ExerciseAttempt id.

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const category = searchParams.get("category");

  const events = await history.listEvents(session.user.id, {
    source: (HISTORY_SOURCES as readonly string[]).includes(source ?? "")
      ? (source as HistorySource)
      : undefined,
    category: category ?? undefined,
    onlyWrong: searchParams.get("onlyWrong") === "true",
    limit: Math.min(Number(searchParams.get("limit")) || 200, 400),
  });

  return NextResponse.json({ sessions: groupHistory(events) });
};
