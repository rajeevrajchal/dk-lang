import { tasks as tasksRepo } from "@/lib/repositories";
import { generateExercise, llmGenerationAvailable } from "@/lib/exercises/generator";
import { variantsFor, VARIANT_BY_ID } from "@/lib/exercises/registry";
import {
  DIFFICULTY_GUIDANCE,
  TASKS_PER_TYPE,
  difficultyForTask,
  practiceType,
} from "./catalogue";
import type {
  ExerciseCategory,
  ExerciseVariant,
  MaterialiseOutcome,
  TaskDifficulty,
  TaskListEntry,
  TaskListSummary,
  TaskRow,
  TaskStatus,
  UserTaskProgressRow,
} from "@/types";

// Filling a numbered slot, and reading a ladder back.
//
// A slot is EMPTY until somebody opens it, and permanent once filled. That is
// the whole design:
//
//   · the task list can show fifty tasks without fifty exercises existing;
//   · Task 14 is the same Task 14 tomorrow, so a score against it means
//     something and an attempt history is a list of sittings of one exercise
//     rather than of fifty unrelated ones;
//   · generation happens for the slot the learner actually opened, not for the
//     forty-nine they did not.
//
// The alternative — generating all fifty up front — would cost fifty model
// calls per practice type per module before a learner had answered a single
// question, and most of them would never be opened.

// ---------------------------------------------------------------------------
// Filling a slot
// ---------------------------------------------------------------------------

/**
 * Difficulty order, for choosing the authored variant that fits a band best.
 * The authored pool only labels itself easy/medium/hard, so the five bands are
 * mapped onto those three.
 */
const AUTHORED_DIFFICULTY: Record<TaskDifficulty, ExerciseVariant["difficulty"]> = {
  easy: "easy",
  easy_medium: "easy",
  medium: "medium",
  medium_hard: "hard",
  hard: "hard",
};

/**
 * An authored variant for this slot that no other slot has already taken.
 *
 * Preferring the band's own difficulty and falling back to any unused variant:
 * a hand-written exercise in the wrong band is still better content than an
 * empty slot, and the band is a guide rather than a promise for the authored
 * pool, which predates it.
 */
const pickAuthored = (
  moduleId: number,
  category: ExerciseCategory,
  taskType: string,
  difficulty: TaskDifficulty,
  used: Set<string>
): ExerciseVariant | null => {
  const pool = variantsFor(moduleId, category).filter(
    (v) => v.taskType === taskType && !used.has(v.variantId)
  );
  if (pool.length === 0) return null;
  const wanted = AUTHORED_DIFFICULTY[difficulty];
  return pool.find((v) => v.difficulty === wanted) ?? pool[0];
};

/**
 * Returns the task in a slot, filling it first if it is empty.
 *
 * Order of preference: the row that is already there, then a hand-written
 * exercise nobody has used, then the model. When none of the three can supply
 * anything the outcome carries the reason, because "we could not write you an
 * exercise" and "there is nothing here" need different things said to the
 * learner.
 */
export const ensureTask = async (
  moduleId: number,
  category: ExerciseCategory,
  taskType: string,
  taskNumber: number
): Promise<MaterialiseOutcome> => {
  if (taskNumber < 1 || taskNumber > TASKS_PER_TYPE) {
    return { task: null, reason: `task ${taskNumber} is outside 1–${TASKS_PER_TYPE}` };
  }

  const existing = await tasksRepo.findTask(moduleId, category, taskType, taskNumber);
  if (existing) return { task: existing };

  const difficulty = difficultyForTask(taskNumber);
  const used = await tasksRepo.usedVariantIds(moduleId, category, taskType);

  const authored = pickAuthored(moduleId, category, taskType, difficulty, used);
  if (authored) {
    return {
      task: await tasksRepo.createTask({
        moduleId,
        category,
        taskType,
        taskNumber,
        difficulty,
        variantId: authored.variantId,
        contentJson: JSON.stringify(authored),
        source: "AUTHORED",
        topic: authored.topic,
        title: authored.title,
      }),
    };
  }

  if (!llmGenerationAvailable()) {
    return {
      task: null,
      reason:
        "The hand-written exercises for this practice type have all been used, and there is no AI provider configured to write more. Set ANTHROPIC_API_KEY or OPENAI_API_KEY to fill the rest of the ladder.",
    };
  }

  // Everything already in this ladder, so the model can be told what NOT to
  // write. Titles and topics rather than whole exercises: enough to steer away
  // from a repeat, small enough to fit in a prompt fifty times over.
  const siblings = await tasksRepo.listTasks(moduleId, category, taskType);
  const outcome = await generateExercise(
    taskType as Parameters<typeof generateExercise>[0],
    category,
    moduleId,
    siblings.map((s) => s.topic),
    2,
    {
      taskNumber,
      totalTasks: TASKS_PER_TYPE,
      difficulty,
      difficultyGuidance: DIFFICULTY_GUIDANCE[difficulty],
      existingTitles: siblings.map((s) => `${s.title} (${s.topic})`),
    }
  );

  if (!outcome.variant) {
    return { task: null, reason: outcome.reason ?? "the exercise could not be written" };
  }

  return {
    task: await tasksRepo.createTask({
      moduleId,
      category,
      taskType,
      taskNumber,
      difficulty,
      variantId: outcome.variant.variantId,
      contentJson: JSON.stringify(outcome.variant),
      source: "GENERATED",
      topic: outcome.variant.topic,
      title: outcome.variant.title,
    }),
  };
};

/** The content of a task, for grading and for serving. Never sent as-is. */
export const variantOf = (task: TaskRow): ExerciseVariant | null => {
  try {
    return JSON.parse(task.contentJson) as ExerciseVariant;
  } catch {
    // An authored task can also be recovered from the registry, which is worth
    // doing: the row is a cache of content that still exists in code.
    return VARIANT_BY_ID.get(task.variantId) ?? null;
  }
};

// ---------------------------------------------------------------------------
// Reading a ladder back
// ---------------------------------------------------------------------------

const statusOf = (progress: UserTaskProgressRow | undefined): TaskStatus => {
  if (!progress) return "not_started";
  return progress.status === "COMPLETED" ? "completed" : "in_progress";
};

/**
 * The fifty tasks of one practice type, with this learner's standing on each.
 *
 * Every slot appears whether or not it has been filled, because the list is
 * the learner's map of the ladder — showing only the eleven that happen to
 * exist would make the ladder look eleven long.
 */
export const taskList = async (
  userId: string,
  moduleId: number,
  category: ExerciseCategory,
  taskType: string
): Promise<TaskListSummary | null> => {
  const type = practiceType(taskType);
  if (!type) return null;

  const materialised = await tasksRepo.listTasks(moduleId, category, taskType);
  const progress = await tasksRepo.listProgress(
    userId,
    materialised.map((t) => t.id)
  );
  const byTaskId = new Map(progress.map((p) => [p.taskId, p]));
  const byNumber = new Map(materialised.map((t) => [t.taskNumber, t]));

  const entries: TaskListEntry[] = [];
  for (let n = 1; n <= TASKS_PER_TYPE; n++) {
    const task = byNumber.get(n);
    const p = task ? byTaskId.get(task.id) : undefined;
    entries.push({
      taskNumber: n,
      difficulty: difficultyForTask(n),
      status: statusOf(p),
      taskId: task?.id ?? null,
      title: task?.title ?? null,
      topic: task?.topic ?? null,
      bestScore: p?.bestScore ?? null,
      bestTotal: p?.bestTotal ?? null,
      lastScore: p?.lastScore ?? null,
      lastTotal: p?.lastTotal ?? null,
      lastMistakes: p?.lastMistakes ?? null,
      attemptCount: p?.attemptCount ?? 0,
      lastAttemptAt: p?.lastAttemptAt ?? null,
      firstCompletedAt: p?.firstCompletedAt ?? null,
    });
  }

  return {
    category,
    practiceType: type,
    moduleId,
    total: TASKS_PER_TYPE,
    completed: entries.filter((e) => e.status === "completed").length,
    inProgress: entries.filter((e) => e.status === "in_progress").length,
    entries,
    nextTaskNumber: nextTaskNumber(entries),
  };
};

/**
 * What "continue" opens: the first task that is not finished.
 *
 * In progress before not started, so a task the learner walked away from is
 * offered back before a fresh one — and a completed task is never served
 * automatically while anything unfinished remains. Practising a finished task
 * again stays possible, but only when the learner asks for it by name.
 */
export const nextTaskNumber = (entries: TaskListEntry[]): number | null => {
  const inProgress = entries.find((e) => e.status === "in_progress");
  if (inProgress) return inProgress.taskNumber;
  const notStarted = entries.find((e) => e.status === "not_started");
  if (notStarted) return notStarted.taskNumber;
  return null;
};
