-- Learning history, mistake review, the verb collection and the translation
-- cache.
--
-- Written by hand rather than by `prisma migrate dev` because that needs a
-- live database; the SQL is the same shape the init migration produced. Run
-- with `prisma migrate deploy`, then re-run supabase/rls.sql so the new
-- learner-owned tables pick up their policies (section 3 generates a policy
-- for every table with a "userId" column) and "TranslationCache" picks up the
-- shared-content read policy in section 5.

-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "danish" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "json" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "attemptId" TEXT,
    "examSessionId" TEXT,
    "moduleId" INTEGER,
    "category" TEXT,
    "taskType" TEXT,
    "topic" TEXT,
    "grammarTopic" TEXT,
    "questionText" TEXT NOT NULL,
    "danishText" TEXT,
    "passageLabel" TEXT,
    "passageText" TEXT,
    "userAnswer" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "explanation" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "moduleId" INTEGER,
    "category" TEXT,
    "taskType" TEXT,
    "topic" TEXT,
    "grammarTopic" TEXT,
    "questionText" TEXT NOT NULL,
    "danishText" TEXT,
    "passageLabel" TEXT,
    "passageText" TEXT,
    "lastWrongAnswer" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "attemptId" TEXT,
    "timesWrong" INTEGER NOT NULL DEFAULT 1,
    "timesRight" INTEGER NOT NULL DEFAULT 0,
    "lastWrongAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MistakeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "learned" BOOLEAN NOT NULL DEFAULT false,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerbProgress_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ExerciseAttempt" ADD COLUMN "feedbackJson" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_hash_key" ON "TranslationCache"("hash");

-- CreateIndex
CREATE INDEX "QuestionEvent_userId_createdAt_idx" ON "QuestionEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionEvent_userId_questionKey_idx" ON "QuestionEvent"("userId", "questionKey");

-- CreateIndex
CREATE INDEX "QuestionEvent_attemptId_idx" ON "QuestionEvent"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "MistakeRecord_userId_questionKey_key" ON "MistakeRecord"("userId", "questionKey");

-- CreateIndex
CREATE INDEX "MistakeRecord_userId_resolvedAt_idx" ON "MistakeRecord"("userId", "resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerbProgress_userId_verbId_key" ON "VerbProgress"("userId", "verbId");

-- CreateIndex
CREATE INDEX "VerbProgress_userId_idx" ON "VerbProgress"("userId");

-- AddForeignKey
ALTER TABLE "QuestionEvent" ADD CONSTRAINT "QuestionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeRecord" ADD CONSTRAINT "MistakeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbProgress" ADD CONSTRAINT "VerbProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
