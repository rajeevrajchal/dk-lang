import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { history } from "@/lib/repositories";
import { groupHistory, HISTORY_SOURCES } from "@/lib/learning/history";
import { HistoryTimeline } from "@/components/history/HistoryTimeline";
import type { HistorySource } from "@/types";

// Learning history.
//
// Rendered on the server: this page has no interaction beyond expanding a row,
// so fetching it in the browser would only add a spinner. The filters are
// links rather than client state for the same reason — they change the URL,
// which means they can be shared and the back button works.

const FILTERS: { label: string; source?: HistorySource; onlyWrong?: boolean }[] = [
  { label: "Everything" },
  { label: "Only mistakes", onlyWrong: true },
  { label: "Exercises", source: "EXERCISE" },
  { label: "Verbs", source: "VERB" },
];

const HistoryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; onlyWrong?: string }>;
}) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const source = (HISTORY_SOURCES as readonly string[]).includes(params.source ?? "")
    ? (params.source as HistorySource)
    : undefined;
  const onlyWrong = params.onlyWrong === "true";

  const events = await history.listEvents(session.user.id, {
    source,
    onlyWrong,
    limit: 250,
  });
  const sessions = groupHistory(events);

  const isActive = (f: (typeof FILTERS)[number]) =>
    (f.source ?? undefined) === source && !!f.onlyWrong === onlyWrong;

  const href = (f: (typeof FILTERS)[number]) => {
    const p = new URLSearchParams();
    if (f.source) p.set("source", f.source);
    if (f.onlyWrong) p.set("onlyWrong", "true");
    const q = p.toString();
    return q ? `/history?${q}` : "/history";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your history</h1>
          <p className="mt-1 text-sm text-slate-600">
            Every question you have answered, grouped by the test and the paragraph it
            belonged to.
          </p>
        </div>
        <Link
          href="/mistakes"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Review mistakes
        </Link>
      </header>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={href(f)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isActive(f)
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <HistoryTimeline sessions={sessions} />
    </div>
  );
};

export default HistoryPage;
