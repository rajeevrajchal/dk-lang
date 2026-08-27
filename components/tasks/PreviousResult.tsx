import Link from "next/link";
import { AnswerFeedbackList } from "@/components/exercises/AnswerFeedbackList";
import { DanishText } from "@/components/translation/DanishText";
import { EmptyState } from "@/components/ui/states";
import type { AttemptReview } from "@/lib/tasks/review";
import type { TaskAttemptSummary } from "@/types";

// What a finished task shows when you open it again.
//
// The rule this screen exists to enforce: clicking a task you have already
// done must not silently restart it. A learner opening Task 12 is far more
// often asking "how did I do?" than "let me do that again", and a flow that
// answers the second question by default throws away the first — the previous
// answers are gone the moment the new attempt starts.
//
// So: the result first, the review under it, and practising again as an
// explicit choice.

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const PreviousResult = ({
  review,
  attempts,
  taskNumber,
  practiceTypeLabel,
  listHref,
  practiceAgainHref,
  showReview,
  reviewHref,
}: {
  review: AttemptReview | null;
  /** Every sitting, newest first. Never overwritten, so this is the record. */
  attempts: TaskAttemptSummary[];
  taskNumber: number;
  practiceTypeLabel: string;
  listHref: string;
  practiceAgainHref: string;
  /** Whether the per-answer review is expanded (?review=1). */
  showReview: boolean;
  reviewHref: string;
}) => {
  if (!review) {
    return (
      <EmptyState
        title={`Task ${taskNumber}`}
        body="This task has been opened but never submitted, so there is no result to show yet."
        action={
          <Link
            href={practiceAgainHref}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Continue this task
          </Link>
        }
      />
    );
  }

  const { recorded, result } = review;
  const scored = recorded.total != null && recorded.total > 0;
  const correct = recorded.score ?? 0;
  const mistakes = recorded.mistakes ?? 0;
  // Newest first, so the last element is the first sitting. "Improved" means
  // the most recent score beats the very first one — the comparison a learner
  // actually cares about, and the reason attempts are never overwritten.
  const newest = attempts[0]?.score;
  const oldest = attempts[attempts.length - 1]?.score;
  const improved =
    attempts.length > 1 && newest != null && oldest != null && newest > oldest;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={listHref} className="text-sm text-slate-500 hover:underline">
          ← {practiceTypeLabel}
        </Link>
      </div>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white">
            ✓ Completed
          </span>
          <span className="text-xs text-slate-500">{practiceTypeLabel}</span>
        </div>
        <h1 className="mt-3 text-xl font-semibold">Task {taskNumber}</h1>
        <p className="mt-1 text-sm text-slate-600">{review.variantTitle}</p>
      </header>

      <section className="rounded-xl border-2 border-slate-900 bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Previous result
        </h2>

        {scored ? (
          <>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {correct} <span className="text-lg font-normal text-slate-400">/ {recorded.total}</span>
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Correct</dt>
                <dd className="mt-0.5 text-lg font-medium text-emerald-700">{correct}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Mistakes</dt>
                <dd className="mt-0.5 text-lg font-medium text-red-700">{mistakes}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Last attempted</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{fmtDate(review.at)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-700">
            Submitted on {fmtDate(review.at)}. This kind of task has no automatic score — you
            check it against the task&apos;s own checklist.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {result.answers.length > 0 && (
            <Link
              href={showReview ? listHref : reviewHref}
              className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {showReview ? "Hide answers" : "Review answers"}
            </Link>
          )}
          <Link
            href={practiceAgainHref}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Practise again
          </Link>
          <Link
            href={listHref}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Back to task list
          </Link>
        </div>
      </section>

      {attempts.length > 1 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Every attempt
          </h2>
          {improved && (
            <p className="mt-1 text-sm text-emerald-700">
              You have improved on this task since your first attempt.
            </p>
          )}
          <ul className="mt-3 divide-y divide-slate-100">
            {attempts.map((a) => (
              <li key={a.attemptId} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-slate-600">{fmtDateTime(a.at)}</span>
                <span className="font-medium text-slate-900">
                  {a.total != null ? `${a.score}/${a.total}` : a.status === "COMPLETED" ? "Submitted" : "Not submitted"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showReview && result.answers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your answers
          </h2>

          {/* The Danish the task was about, kept with the review — a reading
              answer without its text cannot be learned from. */}
          {review.passages.length > 0 && (
            <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Show the Danish text again
              </summary>
              <div className="mt-3 space-y-3">
                {review.passages.map((p, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {p.label}
                    </p>
                    <DanishText
                      as="div"
                      text={p.danish}
                      className="mt-0.5 text-sm text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </details>
          )}

          <AnswerFeedbackList
            attemptId={review.attemptId}
            answers={result.answers}
            initialFeedback={review.feedback}
          />
        </section>
      )}
    </div>
  );
};
