"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/http/client";
import { useAction } from "@/lib/hooks/useAction";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import {
  ActionButton,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonList,
} from "@/components/ui/states";
import { SideNotes } from "@/components/ui/SideNotes";
import { DanishText } from "@/components/translation/DanishText";
import { VERB_THEMES, conjugationLine, groupExplanation, themeLabel } from "@/lib/verbs";
import type { VerbGroup, VerbStats, VerbTheme, VerbWithProgress } from "@/types";

// Browsing five hundred verbs.
//
// The list is fetched, filtered and paged on the SERVER (app/api/verbs). The
// whole collection with its examples is a large payload, and the one thing a
// learner does here most often is look a single verb up on a phone — shipping
// all five hundred to answer that would be the slowest thing in the app.
//
// The search box is debounced for the same reason the translation cache
// exists: a request per keystroke is the classic way to make a fast feature
// feel slow.

interface VerbsResponse {
  stats: VerbStats;
  total: number;
  verbs: VerbWithProgress[];
}

const PAGE_SIZE = 40;

const StatusChip = ({ row }: { row: VerbWithProgress }) => {
  if (row.struggling) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
        {row.wrongCount} wrong / {row.correctCount} right
      </span>
    );
  }
  if (row.learned) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
        Learned
      </span>
    );
  }
  if (row.correctCount + row.wrongCount > 0) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        {row.correctCount}/{row.correctCount + row.wrongCount} right
      </span>
    );
  }
  return null;
};

const VerbCard = ({
  row,
  onToggleLearned,
  busy,
}: {
  row: VerbWithProgress;
  onToggleLearned: (verbId: string, learned: boolean) => void;
  busy: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const v = row.verb;

  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="text-left"
          >
            <span className="text-base font-semibold text-slate-900">at {v.infinitive}</span>
            <span className="ml-2 text-sm text-slate-500">{v.english}</span>
          </button>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{conjugationLine(v)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusChip row={row} />
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleLearned(v.infinitive, !row.learned)}
            className="rounded border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            {row.learned ? "Mark unlearned" : "Mark learned"}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-2 border-t border-slate-100 px-4 py-3">
          <div>
            <DanishText
              text={v.example}
              className="text-sm font-medium text-slate-900"
              as="div"
            />
            <p className="mt-0.5 text-sm text-slate-500">{v.exampleEnglish}</p>
          </div>
          <p className="text-xs text-slate-600">{groupExplanation(v)}</p>
          {v.usage && (
            <p className="text-xs text-blue-900">
              <span className="font-semibold">In use: </span>
              {v.usage}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {v.themes.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500"
              >
                {themeLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

export const VerbBrowser = ({
  initialSearch = "",
  initialStatus = "all",
}: {
  initialSearch?: string;
  initialStatus?: string;
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [debounced, setDebounced] = useState(initialSearch);
  const [theme, setTheme] = useState<VerbTheme | "">("");
  const [group, setGroup] = useState<VerbGroup | "">("");
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(0);

  // Typing "arbejde" is seven keystrokes and should be one request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const url = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    if (debounced) params.set("search", debounced);
    if (theme) params.set("theme", theme);
    if (group) params.set("group", String(group));
    if (status !== "all") params.set("status", status);
    return `/api/verbs?${params.toString()}`;
  }, [debounced, theme, group, status, page]);

  const { status: reqStatus, data, error, reload } = useAsyncData<VerbsResponse>(url, {
    keepPreviousData: true,
  });

  const toggle = useCallback(
    async (verbId: string, learned: boolean) => {
      await apiFetch("/api/verbs/learned", { json: { verbId, learned } });
      reload();
      return true;
    },
    [reload]
  );
  const learnedAction = useAction(toggle);

  const pages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {data ? (
          <>
            <Stat label="Verbs" value={`${data.stats.total}`} />
            <Stat label="Marked learned" value={`${data.stats.learned}`} />
            <Stat label="Practised" value={`${data.stats.practised}`} />
            <Stat label="Struggling with" value={`${data.stats.struggling}`} />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
        )}
      </div>

      <SideNotes context={{ surface: "verbs" }} title="Worth knowing about Danish verbs" />

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Danish or English…"
          aria-label="Search verbs"
          className="min-w-[14rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value as VerbTheme | "");
            setPage(0);
          }}
          aria-label="Filter by theme"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All themes</option>
          {VERB_THEMES.map((t) => (
            <option key={t} value={t}>
              {themeLabel(t)}
            </option>
          ))}
        </select>
        <select
          value={group}
          onChange={(e) => {
            setGroup(e.target.value === "" ? "" : (Number(e.target.value) as VerbGroup));
            setPage(0);
          }}
          aria-label="Filter by conjugation group"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All groups</option>
          <option value="1">Group 1 (-ede)</option>
          <option value="2">Group 2 (-te)</option>
          <option value="3">Irregular</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          aria-label="Filter by progress"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="unlearned">Not yet learned</option>
          <option value="learned">Learned</option>
          <option value="struggling">Struggling with</option>
        </select>
        <Link
          href="/verbs/practice"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Practise
        </Link>
      </div>

      {learnedAction.error && (
        <ErrorState error={learnedAction.error} title="Could not save that" />
      )}

      {reqStatus === "error" && (
        <ErrorState error={error} onRetry={reload} title="Could not load the verbs" />
      )}

      {reqStatus === "loading" && !data && <SkeletonList rows={5} lines={1} />}

      {data && data.verbs.length === 0 && (
        <EmptyState
          title="No verbs match that"
          body="Try a different search, or clear the filters."
          action={
            <ActionButton
              variant="secondary"
              onClick={() => {
                setSearch("");
                setTheme("");
                setGroup("");
                setStatus("all");
              }}
            >
              Clear filters
            </ActionButton>
          }
        />
      )}

      {data && data.verbs.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            {data.total} verb{data.total === 1 ? "" : "s"}
            {reqStatus === "loading" && " · updating…"}
          </p>
          <ul className="space-y-2">
            {data.verbs.map((row) => (
              <VerbCard
                key={row.verb.infinitive}
                row={row}
                busy={learnedAction.pending}
                onToggleLearned={(id, learned) => void learnedAction.run(id, learned)}
              />
            ))}
          </ul>

          {pages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <ActionButton
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </ActionButton>
              <span className="text-xs text-slate-500">
                Page {page + 1} of {pages}
              </span>
              <ActionButton
                variant="secondary"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </ActionButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
  </div>
);
