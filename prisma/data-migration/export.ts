/**
 * Snapshots every row out of the current database into one JSON file.
 *
 * Run this BEFORE switching the Prisma datasource to PostgreSQL, while the
 * SQLite database is still readable:
 *
 *     npx tsx prisma/data-migration/export.ts
 *
 * The output is ordered so that `import.ts` can insert it back without ever
 * violating a foreign key — parents before children, all the way down. That
 * ordering is the whole reason this is a script and not a `pg_dump`.
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const prisma = new PrismaClient();

// Insertion order. Anything referenced by a later table must appear earlier.
export const TABLE_ORDER = [
  // Content, seeded and independent of any learner.
  "tier",
  "module",
  "construct",
  "item",
  "itemConstruct",
  "vocabItem",
  // Identity.
  "user",
  "account",
  "session",
  "verificationToken",
  "userProfile",
  // Learner records, in dependency order.
  "reportCard",
  "officialTestResult",
  "examSession",
  "attempt",
  "constructAccuracy",
  "srsState",
  "vocabSrsState",
  "moduleSkillStatus",
  "exerciseAttempt",
  "lessonProgress",
  "readingProgress",
  "savedWord",
  "readingNote",
  "readingHighlight",
  "readingExplanation",
] as const;

async function main() {
  const out: Record<string, unknown[]> = {};

  for (const table of TABLE_ORDER) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (prisma as any)[table];
    if (!delegate?.findMany) {
      console.warn(`  ! no delegate for "${table}" — skipping`);
      continue;
    }
    const rows = await delegate.findMany();
    out[table] = rows;
    if (rows.length) console.log(`  ${String(rows.length).padStart(5)}  ${table}`);
  }

  const target = resolve(process.cwd(), "prisma/data-migration/snapshot.json");
  mkdirSync(dirname(target), { recursive: true });
  // Dates serialise to ISO strings; the importer turns them back.
  writeFileSync(target, JSON.stringify(out, null, 2));

  const total = Object.values(out).reduce((n, rows) => n + rows.length, 0);
  console.log(`\n${total} rows -> ${target}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
