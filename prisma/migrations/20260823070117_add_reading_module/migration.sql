-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "interestsJson" TEXT;

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "textId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPENED',
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "mark" TEXT,
    "readSeconds" INTEGER NOT NULL DEFAULT 0,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'WORD',
    "danish" TEXT NOT NULL,
    "lemma" TEXT,
    "translation" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "contextSentence" TEXT,
    "grammarNote" TEXT,
    "sourceTextId" TEXT,
    "note" TEXT,
    "learned" BOOLEAN NOT NULL DEFAULT false,
    "vocabItemId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "textId" TEXT NOT NULL,
    "anchorKind" TEXT NOT NULL,
    "anchorId" TEXT,
    "quote" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingHighlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "textId" TEXT NOT NULL,
    "sentenceIndex" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'YELLOW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingHighlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingExplanation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textId" TEXT NOT NULL,
    "scopeKind" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "depth" TEXT NOT NULL DEFAULT 'DEFAULT',
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ReadingProgress_userId_idx" ON "ReadingProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_textId_key" ON "ReadingProgress"("userId", "textId");

-- CreateIndex
CREATE INDEX "SavedWord_userId_idx" ON "SavedWord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedWord_userId_danish_key" ON "SavedWord"("userId", "danish");

-- CreateIndex
CREATE INDEX "ReadingNote_userId_textId_idx" ON "ReadingNote"("userId", "textId");

-- CreateIndex
CREATE INDEX "ReadingHighlight_userId_textId_idx" ON "ReadingHighlight"("userId", "textId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingHighlight_userId_textId_sentenceIndex_key" ON "ReadingHighlight"("userId", "textId", "sentenceIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingExplanation_textId_scopeKind_scopeId_level_depth_key" ON "ReadingExplanation"("textId", "scopeKind", "scopeId", "level", "depth");
