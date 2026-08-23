import { PrismaClient } from "@prisma/client";

// Prisma, for schema work only.
//
// The application does NOT query through this any more — every read and write
// goes through lib/repositories/*, which uses supabase-js so that Row Level
// Security applies. Prisma is kept because it is still the best tool for the
// job it does here: owning the schema (prisma/schema.prisma), generating
// migrations, and driving the data-migration scripts.
//
// This client is used by prisma/seed.ts and prisma/data-migration/*, which run
// from the command line with a direct database connection. Importing it from a
// route or a component would reintroduce the ORM-bypasses-RLS problem the
// repositories exist to avoid.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
