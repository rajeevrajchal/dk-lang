"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/http/client";
import { ActionButton } from "@/components/ui/states";
import { ExercisePlayer } from "@/components/exercises/ExercisePlayer";
import { DIFFICULTY_LABELS } from "@/lib/tasks/catalogue";
import type { ApiError, ExerciseCategory, PracticeType, PublicExercise, TaskDifficulty } from "@/types";

// Sitting one numbered task.
//
// Everything below the header is ExercisePlayer, which is the same component
// the "serve me the next one" flow uses. What this adds is the three things
// that only make sense for a numbered task: where it sits in the ladder, where
// to go when it is finished, and the fact that finishing it changes a list
// somewhere else — so the task list is refreshed rather than left stale.

type OpenedTask = PublicExercise & {
  ready: true;
  taskId: string;
  taskNumber: number;
  difficulty: TaskDifficulty;
};

type OpenResponse = OpenedTask | { ready: false; status: "preparing" };

// A cold slot answers "preparing" immediately rather than holding the request
// open for however long generation takes (see app/api/tasks/open/route.ts).
// This is what turns that into "wait a little longer" instead of "fail" from
// the learner's side: keep asking until the slot is ready, an error arrives,
// or it has gone on long enough that something is actually wrong.
//
// The interval backs off rather than staying fixed: generation runs
// 68-152s, so a flat 3s poll means dozens of near-identical requests in the
// network tab for one open task, which reads as a loop that forgot to stop
// rather than a wait that is actually progressing. Starting quick keeps a
// task that turns out to already be cached feeling instant; capping at 8s
// keeps the wait itself from being made to feel longer than it is.
const POLL_INTERVAL_START_MS = 2000;
const POLL_INTERVAL_STEP_MS = 1000;
const POLL_INTERVAL_MAX_MS = 8000;
const MAX_WAIT_MS = 5 * 60 * 1000;

const pollDelay = (attempt: number): number =>
  Math.min(POLL_INTERVAL_START_MS + attempt * POLL_INTERVAL_STEP_MS, POLL_INTERVAL_MAX_MS);

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });

export const TaskRunner = ({
  category,
  practiceType,
  taskNumber,
  listHref,
  isRepeat,
}: {
  category: ExerciseCategory;
  practiceType: PracticeType;
  taskNumber: number;
  listHref: string;
  /** True when the learner explicitly chose to practise a finished task again. */
  isRepeat: boolean;
}) => {
  const router = useRouter();
  const [finished, setFinished] = useState(false);

  const load = useCallback(
    async (signal: AbortSignal): Promise<OpenedTask> => {
      const deadline = Date.now() + MAX_WAIT_MS;
      for (let attempt = 0; ; attempt++) {
        // No module in the payload — deliberately. The server reads it from
        // the learner's profile, so a task cannot be opened at a level the
        // learner has not said they are at.
        const result = await apiFetch<OpenResponse>("/api/tasks/open", {
          signal,
          json: { category, taskType: practiceType.taskType, taskNumber },
        });
        if (result.ready !== false) return result;

        if (Date.now() >= deadline) {
          const timeout: ApiError = {
            status: 0,
            message: "This is taking longer than expected. Please try again.",
          };
          throw timeout;
        }
        await sleep(pollDelay(attempt), signal);
      }
    },
    [category, practiceType.taskType, taskNumber]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={listHref} className="text-sm text-slate-500 hover:underline">
          ← {practiceType.label}
        </Link>
        {isRepeat && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            Practising again — your previous result is kept
          </span>
        )}
      </div>

      <ExercisePlayer
        load={load}
        loadingNote={{
          title: `Preparing Task ${taskNumber}…`,
          body: "The first time a task is opened its text is written and then kept, so it is the same task every time you come back to it.",
        }}
        sideNoteSurface={
          category === "WRITING" ? "writing" : category === "SPEAKING" ? "speaking" : "reading"
        }
        emptyTitle={`Task ${taskNumber}`}
        emptyBody="This task could not be prepared."
        header={(exercise) => (
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                Task {taskNumber}
              </span>
              <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600">
                {DIFFICULTY_LABELS[(exercise as OpenedTask).difficulty] ?? ""}
              </span>
              <span className="text-xs text-slate-500">{practiceType.label}</span>
              {exercise.generated && (
                <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-500">
                  Written for you
                </span>
              )}
            </div>
            <h1 className="mt-3 text-xl font-semibold">{exercise.title}</h1>
          </header>
        )}
        onCompleted={() => {
          setFinished(true);
          // The task list this came from now shows a stale status; refreshing
          // the server components behind it is cheaper than re-fetching on the
          // list's own next render and means "back" shows the truth.
          router.refresh();
        }}
        footer={(result) => (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {(result.mistakes ?? 0) > 0 && (
              <p className="text-xs text-slate-500">
                Your mistakes are saved to your{" "}
                <Link href="/mistakes" className="font-medium underline">
                  review list
                </Link>
                , and this attempt is kept in this task&apos;s history.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link
                href={listHref}
                className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Back to task list
              </Link>
              <ActionButton variant="secondary" onClick={() => window.location.reload()}>
                Practise this task again
              </ActionButton>
            </div>
          </div>
        )}
      />

      {finished && (
        <p className="text-xs text-slate-400">
          Task {taskNumber} is now marked completed. Opening it again will show this result
          first.
        </p>
      )}
    </div>
  );
};
