import Link from "next/link";
import { DIFFICULTY_LABELS } from "@/lib/tasks/catalogue";
import type { TaskListEntry, TaskListSummary } from "@/types";

// The fifty tasks of one practice type.
//
// Every slot is shown, filled or not, because the list is the learner's map of
// the ladder — showing only the eleven that happen to have been opened would
// make a fifty-step ladder look eleven long.
//
// Status is the thing this screen exists to communicate, so it is on the card
// rather than behind a hover: what have I done, how did it go, and what is
// next. The difficulty band is on the card too, because "task 47 is hard" is
// the reason a learner picks 12 instead.

const STATUS_STYLE: Record<
  TaskListEntry["status"],
  { card: string; chip: string; label: string }
> = {
  completed: {
    card: "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50",
    chip: "bg-emerald-600 text-white",
    label: "Completed",
  },
  in_progress: {
    card: "border-amber-300 bg-amber-50/50 hover:bg-amber-50",
    chip: "bg-amber-500 text-white",
    label: "In progress",
  },
  not_started: {
    card: "border-slate-200 bg-white hover:bg-slate-50",
    chip: "bg-slate-100 text-slate-500",
    label: "Not started",
  },
};

const fmtDate = (iso: string | null) => {
  return iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;
};

const TaskCard = ({ entry, href }: { entry: TaskListEntry; href: string }) => {
  const style = STATUS_STYLE[entry.status];
  const scored = entry.bestTotal != null && entry.bestTotal > 0;

  return (
    <Link
      href={href}
      className={`flex flex-col rounded-xl border p-4 transition ${style.card}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">Task {entry.taskNumber}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.chip}`}
        >
          {entry.status === "completed" ? "✓" : ""} {style.label}
        </span>
      </div>

      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
        {DIFFICULTY_LABELS[entry.difficulty]}
      </p>

      {entry.title && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{entry.title}</p>
      )}

      {entry.status === "completed" && (
        <div className="mt-auto pt-3">
          {scored ? (
            <p className="text-sm font-medium text-slate-900">
              {entry.bestScore} / {entry.bestTotal}
              {entry.lastTotal != null &&
                entry.lastScore !== entry.bestScore &&
                entry.lastScore != null && (
                  <span className="ml-1.5 text-xs font-normal text-slate-500">
                    (last {entry.lastScore}/{entry.lastTotal})
                  </span>
                )}
            </p>
          ) : (
            <p className="text-sm text-slate-600">Submitted</p>
          )}
          <p className="mt-0.5 text-[11px] text-slate-400">
            {entry.attemptCount} attempt{entry.attemptCount === 1 ? "" : "s"}
            {fmtDate(entry.lastAttemptAt) ? ` · ${fmtDate(entry.lastAttemptAt)}` : ""}
          </p>
        </div>
      )}

      {entry.status === "in_progress" && (
        <p className="mt-auto pt-3 text-[11px] text-amber-700">Opened, not submitted</p>
      )}
    </Link>
  );
};

export const TaskGrid = ({
  summary,
  basePath,
}: {
  summary: TaskListSummary;
  /** e.g. "/class/reading/fill-in-the-blanks" — the task number is appended. */
  basePath: string;
}) => {
  const pct = Math.round((summary.completed / summary.total) * 100);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">
            {summary.completed} of {summary.total} completed
          </p>
          {summary.nextTaskNumber != null && (
            <Link
              href={`${basePath}/${summary.nextTaskNumber}`}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {summary.inProgress > 0 ? "Continue" : "Start"} Task {summary.nextTaskNumber}
            </Link>
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
        </div>
        {/* Said explicitly, because it is the rule that decides what "Start"
            opens: finished tasks are never served automatically while
            anything unfinished remains. */}
        <p className="mt-2 text-[11px] text-slate-400">
          Practice moves through the unfinished tasks first. A completed task stays here for
          review, and can be practised again whenever you choose it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {summary.entries.map((entry) => (
          <TaskCard
            key={entry.taskNumber}
            entry={entry}
            href={`${basePath}/${entry.taskNumber}`}
          />
        ))}
      </div>
    </div>
  );
};
