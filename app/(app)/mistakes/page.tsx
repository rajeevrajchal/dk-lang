import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { history } from "@/lib/repositories";
import { deriveInsights } from "@/lib/learning/history";
import { MistakeList } from "@/components/mistakes/MistakeList";
import { SideNotes } from "@/components/ui/SideNotes";
import type { GrammarTopic, MistakeRow } from "@/types";

// Mistake review.
//
// The insights at the top are computed from every mistake this learner has,
// not from the page being shown, and each one states how many mistakes support
// it — so the claim can always be checked against the list underneath. Nothing
// here is hardcoded: with no data there are no insights, which is the honest
// answer rather than a generic tip.

const VERB_PRACTICE_LIMIT = 20;

const MistakesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status: statusParam } = await searchParams;
  const status = statusParam === "resolved" || statusParam === "all" ? statusParam : "open";

  const [mistakes, all] = await Promise.all([
    history.listMistakes(session.user.id, { status, limit: 100 }),
    history.allMistakes(session.user.id),
  ]);

  const insights = deriveInsights(all);
  const open = all.filter((m) => m.resolvedAt === null);
  const resolved = all.length - open.length;

  // The verbs worth another round: open verb mistakes, most-wrong first. This
  // is what makes "practise your mistakes again" real rather than a link back
  // to generic practice.
  const strugglingVerbs = [
    ...new Set(
      [...open]
        .filter((m: MistakeRow) => m.source === "VERB" && m.grammarTopic)
        .sort((a, b) => b.timesWrong - a.timesWrong)
        .map((m) => m.grammarTopic as string)
    ),
  ].slice(0, VERB_PRACTICE_LIMIT);

  // The grammar areas the open mistakes cluster in, so the side notes shown
  // are the ones about what this learner is actually getting wrong.
  const topics = [
    ...new Set(open.map((m) => m.grammarTopic).filter(Boolean)),
  ] as GrammarTopic[];

  const tabs = [
    { key: "open", label: `Still wrong (${open.length})` },
    { key: "resolved", label: `Right since (${resolved})` },
    { key: "all", label: `All (${all.length})` },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your mistakes</h1>
          <p className="mt-1 text-sm text-slate-600">
            What you got wrong, what you answered, and the paragraph it came from.
          </p>
        </div>
        <Link
          href="/history"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Full history
        </Link>
      </header>

      {insights.length > 0 && (
        <section className="rounded-xl border border-slate-900 bg-slate-900 p-5 text-white">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            What your answers show
          </h2>
          <ul className="mt-3 space-y-2">
            {insights.map((i) => (
              <li key={`${i.kind}-${i.key}`} className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm">{i.message}</span>
                <span className="text-[11px] text-slate-400">
                  from {i.evidence} mistake{i.evidence === 1 ? "" : "s"}
                </span>
                {i.href && (
                  <Link href={i.href} className="text-[11px] font-medium underline">
                    Work on it
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {strugglingVerbs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            {strugglingVerbs.length} verb{strugglingVerbs.length === 1 ? "" : "s"} from your
            mistakes are ready to practise again.
          </p>
          <Link
            href={`/verbs/practice?verbs=${strugglingVerbs.join(",")}`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Practise them
          </Link>
        </div>
      )}

      <nav className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "open" ? "/mistakes" : `/mistakes?status=${t.key}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              status === t.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {topics.length > 0 && (
        <SideNotes
          context={{ topics }}
          limit={2}
          title="About what you are getting wrong"
        />
      )}

      <MistakeList mistakes={mistakes} />
    </div>
  );
};

export default MistakesPage;
