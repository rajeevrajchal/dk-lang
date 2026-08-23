-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "education" TEXT,
    "currentModule" INTEGER,
    "levelSource" TEXT,
    "levelSetAt" DATETIME,
    "onboardedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfficialTestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "education" TEXT,
    "module" INTEGER,
    "result" TEXT,
    "takenAt" DATETIME,
    "source" TEXT NOT NULL DEFAULT 'SELF_REPORTED',
    "reportCardId" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OfficialTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "chapterId" TEXT,
    "score" INTEGER,
    "total" INTEGER,
    "responsesJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "startedAt" DATETIME,
    "lastVisitedAt" DATETIME,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LessonProgress" ("chapterId", "completedAt", "id", "lessonSlug", "responsesJson", "score", "total", "updatedAt", "userId") SELECT "chapterId", "completedAt", "id", "lessonSlug", "responsesJson", "score", "total", "updatedAt", "userId" FROM "LessonProgress";
DROP TABLE "LessonProgress";
ALTER TABLE "new_LessonProgress" RENAME TO "LessonProgress";
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");
CREATE UNIQUE INDEX "LessonProgress_userId_lessonSlug_key" ON "LessonProgress"("userId", "lessonSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "OfficialTestResult_userId_idx" ON "OfficialTestResult"("userId");
