import { PrismaClient } from "@prisma/client";

// Prisma, for schema work only.
//
// The application does NOT query through this — every read and write goes
// through lib/repositories/*, which uses supabase-js so that Row Level
// Security applies. Prisma is kept because it is still the best tool for the
// job it does here: owning the schema (prisma/schema.prisma), generating
// migrations, and driving the data-migration scripts.
//
// It lives under prisma/ rather than lib/ precisely so that it cannot be
// imported from a route or a component — that would reintroduce the
// ORM-bypasses-RLS problem the repositories exist to avoid — and so that
// `next build` does not have to type-check it, which used to make every
// deployment depend on `prisma generate` having run.
//
// Nothing imports this today: prisma/seed.ts and prisma/data-migration/* each
// construct their own client. It is kept as the shared one for scripts that
// want it.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
