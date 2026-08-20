-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExerciseAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "examSessionId" TEXT,
    "orderIndex" INTEGER,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "variantJson" TEXT,
    "responseJson" TEXT,
    "score" INTEGER,
    "total" INTEGER,
    "mistakes" INTEGER,
    "wordCount" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseAttempt_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "ExamSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExerciseAttempt" ("category", "completedAt", "generated", "id", "mistakes", "moduleId", "responseJson", "score", "startedAt", "status", "taskType", "topic", "total", "userId", "variantId", "variantJson", "wordCount") SELECT "category", "completedAt", "generated", "id", "mistakes", "moduleId", "responseJson", "score", "startedAt", "status", "taskType", "topic", "total", "userId", "variantId", "variantJson", "wordCount" FROM "ExerciseAttempt";
DROP TABLE "ExerciseAttempt";
ALTER TABLE "new_ExerciseAttempt" RENAME TO "ExerciseAttempt";
CREATE INDEX "ExerciseAttempt_userId_moduleId_category_idx" ON "ExerciseAttempt"("userId", "moduleId", "category");
CREATE INDEX "ExerciseAttempt_examSessionId_idx" ON "ExerciseAttempt"("examSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
