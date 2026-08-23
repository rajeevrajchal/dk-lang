/**
 * Runs a .sql file against the database, without needing psql installed.
 *
 *     npx tsx scripts/run-sql.ts supabase/functions.sql
 *
 * Uses the Prisma connection, which is the one piece of tooling here that
 * already speaks the Postgres wire protocol. Statements are split respecting
 * dollar-quoted bodies ($$ ... $$) — a naive split on ";" would tear every
 * function definition in this project in half, since their bodies are full of
 * semicolons.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Splits on semicolons that are not inside a string or a dollar-quoted body. */
export function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let buf = "";
  let i = 0;
  let inSingle = false;
  let dollarTag: string | null = null;

  while (i < sql.length) {
    const rest = sql.slice(i);

    // Line and block comments — skipped so a ";" inside one cannot split.
    if (!inSingle && !dollarTag && rest.startsWith("--")) {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      buf += sql.slice(i, stop);
      i = stop;
      continue;
    }

    if (!inSingle && !dollarTag) {
      // Opening a dollar-quoted body: $$ or $tag$.
      const m = rest.match(/^\$([A-Za-z_]\w*)?\$/);
      if (m) {
        dollarTag = m[0];
        buf += dollarTag;
        i += dollarTag.length;
        continue;
      }
    } else if (dollarTag && rest.startsWith(dollarTag)) {
      buf += dollarTag;
      i += dollarTag.length;
      dollarTag = null;
      continue;
    }

    const ch = sql[i];

    if (!dollarTag && ch === "'") {
      inSingle = !inSingle;
      buf += ch;
      i += 1;
      continue;
    }

    if (ch === ";" && !inSingle && !dollarTag) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }

  if (buf.trim()) out.push(buf.trim());
  // Comment-only fragments are not statements.
  return out.filter((s) => s.split("\n").some((l) => l.trim() && !l.trim().startsWith("--")));
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: npx tsx scripts/run-sql.ts <file.sql>");
    process.exit(1);
  }

  const statements = splitStatements(readFileSync(file, "utf8"));
  console.log(`${file}: ${statements.length} statements`);

  let n = 0;
  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      n += 1;
    } catch (err) {
      const first = statement.split("\n").find((l) => l.trim() && !l.trim().startsWith("--"));
      console.error(`\nFailed on statement ${n + 1}:\n  ${first?.slice(0, 100)}\n`);
      throw err;
    }
  }

  console.log(`${n} statements applied`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
