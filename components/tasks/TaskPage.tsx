import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserLevel } from "@/lib/level";
import { tasks as tasksRepo } from "@/lib/repositories";
import { moduleFor } from "@/lib/tasks/module";
import {
  CATEGORY_BY_KEY,
  TASKS_PER_TYPE,
  practiceTypeBySlug,
} from "@/lib/tasks/catalogue";
import { reviewAttempt } from "@/lib/tasks/review";
import { TaskRunner } from "./TaskRunner";
import { PreviousResult } from "./PreviousResult";
import type { ExerciseCategory } from "@/types";

// One numbered task.
//
// The screen decides between two things, and the decision is the requirement:
//
//   completed, no explicit ask  → the PREVIOUS RESULT, with review and
//                                 "practise again" as choices
//   anything else               → the task itself
//
// So clicking a finished task never silently restarts it and never discards
// what the learner did last time. `?again=1` is the explicit ask, which is why
// it is in the URL rather than in a piece of client state — the learner can
// see what they chose, and a refresh does not change it.

export const TaskPage = async ({
  category,
  practiceTypeSlug,
  taskNumberParam,
  searchParams,
}: {
  category: ExerciseCategory;
  practiceTypeSlug: string;
  taskNumberParam: string;
  searchParams: Promise<{ again?: string; review?: string }>;
}) => {
  const session = await auth();
  const definition = CATEGORY_BY_KEY.get(category)!;
  const type = practiceTypeBySlug(category, practiceTypeSlug);
  if (!type) notFound();

  const taskNumber = Number(taskNumberParam);
  if (!Number.isInteger(taskNumber) || taskNumber < 1 || taskNumber > TASKS_PER_TYPE) {
    notFound();
  }

  const { again, review } = await searchParams;
  const practiseAgain = again === "1";

  const level = await getUserLevel(session!.user.id);
  const moduleId = moduleFor(level.currentModule);

  const basePath = `/class/${definition.slug}/${type.slug}`;
  const listHref = `${basePath}/${taskNumber}`;

  // Whether this task has been done before. The slot may not even have been
  // materialised yet, in which case it certainly has not.
  const existing = await tasksRepo.findTask(moduleId, category, type.taskType, taskNumber);
  const progress = existing
    ? await tasksRepo.findProgress(session!.user.id, existing.id)
    : null;

  const isCompleted = progress?.status === "COMPLETED";

  if (isCompleted && !practiseAgain && existing) {
    const [latest, attempts] = await Promise.all([
      tasksRepo.latestCompletedAttempt(session!.user.id, existing.id),
      tasksRepo.attemptsForTask(session!.user.id, existing.id),
    ]);

    return (
      <div className="mx-auto max-w-3xl p-6 sm:p-8">
        <PreviousResult
          review={latest ? await reviewAttempt(session!.user.id, latest.id) : null}
          attempts={attempts}
          taskNumber={taskNumber}
          practiceTypeLabel={type.label}
          listHref={basePath}
          practiceAgainHref={`${listHref}?again=1`}
          showReview={review === "1"}
          reviewHref={`${listHref}?review=1`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <TaskRunner
        category={category}
        practiceType={type}
        taskNumber={taskNumber}
        listHref={basePath}
        isRepeat={practiseAgain && isCompleted}
      />
    </div>
  );
};
