// The data access layer.
//
// Everything that touches the database goes through a repository, so that no
// page or route holds a query of its own. Two reasons, and the second is the
// one that pays off:
//
//   1. A server component reaching for the ORM mixes rendering with data
//      access, and there is nowhere to put the "only this learner's rows"
//      rule except in every caller.
//   2. Row Level Security does not apply to these queries — Prisma connects as
//      the table owner (see docs/supabase-migration.md). The `userId` scoping
//      in these functions IS the authorization boundary, so it needs to live
//      somewhere small enough to audit, not spread across thirty files.
//
// Every function here that reads or writes learner data takes `userId` as its
// first argument. That is not a style choice: it makes an unscoped query
// visibly wrong.

export * as users from "./users";
export * as progress from "./progress";
export * as reading from "./reading";
export * as vocabulary from "./vocabulary";
export * as lessons from "./lessons";
export * as exercises from "./exercises";
