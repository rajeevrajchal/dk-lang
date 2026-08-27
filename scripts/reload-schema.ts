/**
 * Tells PostgREST to re-read the database schema.
 *
 *     npx tsx scripts/reload-schema.ts
 *
 * RUN THIS AFTER EVERY MIGRATION. Supabase serves the REST API through
 * PostgREST, which holds the schema in memory. A table created after that
 * cache was built is invisible to it, and every query against the new table
 * fails with:
 *
 *     Could not find the table 'public.X' in the schema cache
 *
 * which reads like a missing table even though the table is right there, and
 * sends you looking for a migration that has in fact already been applied.
 *
 * Uses the Prisma connection because it is the one piece of tooling here that
 * speaks the Postgres wire protocol; the notification itself is plain SQL.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.$executeRawUnsafe(`notify pgrst, 'reload schema'`);
  console.log("PostgREST schema reload signalled");
};

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
