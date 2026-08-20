-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "responseJson" TEXT,
    "score" INTEGER,
    "total" INTEGER,
    "mistakes" INTEGER,
    "wordCount" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_moduleId_category_idx" ON "ExerciseAttempt"("userId", "moduleId", "category");
