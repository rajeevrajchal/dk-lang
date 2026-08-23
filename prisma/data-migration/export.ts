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
import { SNAPSHOT_PATH, TABLE_ORDER } from "./tables";

const prisma = new PrismaClient();


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

  const target = resolve(process.cwd(), SNAPSHOT_PATH);
  mkdirSync(dirname(target), { recursive: true });
  // Dates serialise to ISO strings; the importer turns them back.
  writeFileSync(target, JSON.stringify(out, null, 2));

  const total = Object.values(out).reduce((n, rows) => n + rows.length, 0);
  console.log(`\n${total} rows -> ${target}`);
}

// Only when run directly. Importing this module must not export anything —
// import.ts used to pull TABLE_ORDER from here, which silently ran this and
// overwrote the snapshot with the contents of the target database.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
