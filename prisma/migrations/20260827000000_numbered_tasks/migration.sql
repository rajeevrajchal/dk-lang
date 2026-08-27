-- Numbered practice tasks: content, per-learner summary, and the link from an
-- attempt to the slot it was a sitting of.
--
-- Apply with the three-step procedure in docs/learning-history.md §8:
--   1. this migration
--   2. supabase/rls.sql   (Task is shared content; UserTaskProgress is owned)
--   3. npm run db:reload-schema

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "taskNumber" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTaskProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER,
    "bestTotal" INTEGER,
    "lastScore" INTEGER,
    "lastTotal" INTEGER,
    "lastMistakes" INTEGER,
    "firstCompletedAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTaskProgress_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ExerciseAttempt" ADD COLUMN "taskId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Task_moduleId_category_taskType_taskNumber_key" ON "Task"("moduleId", "category", "taskType", "taskNumber");

-- CreateIndex
CREATE INDEX "Task_moduleId_category_taskType_idx" ON "Task"("moduleId", "category", "taskType");

-- CreateIndex
CREATE UNIQUE INDEX "UserTaskProgress_userId_taskId_key" ON "UserTaskProgress"("userId", "taskId");

-- CreateIndex
CREATE INDEX "UserTaskProgress_userId_idx" ON "UserTaskProgress"("userId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_taskId_idx" ON "ExerciseAttempt"("userId", "taskId");

-- AddForeignKey
ALTER TABLE "UserTaskProgress" ADD CONSTRAINT "UserTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskProgress" ADD CONSTRAINT "UserTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
