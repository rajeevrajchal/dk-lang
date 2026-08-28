# ADR-002: Database — Supabase-native schema, no Prisma, real enums

## Status
Accepted.

## Context
The old app used Prisma as its ORM/migration tool against a Supabase
Postgres database, with a schema shaped partly around a since-removed
NextAuth integration (`User`/`Account`/`Session`/`VerificationToken` tables
kept "because it costs nothing" after auth fully moved to Supabase Auth).
Enum-shaped fields were deliberately stored as plain validated strings to
avoid migration churn on a live database, per the old schema's own header
comment.

## Decision
1. **Drop Prisma.** Use Supabase CLI migrations (plain SQL) and
   `supabase gen types typescript` for generated types. Supabase is already
   the database; an ORM on top of it added a second schema-description
   mechanism (Prisma schema file vs. actual Postgres state) with no access
   pattern in this app that needed Prisma's relational query builder over
   plain PostgREST/SQL.
2. **Drop the NextAuth-shaped tables entirely.** `auth.users` is the only
   identity table; `profiles.id` is `auth.users.id` directly — no separate
   app-generated id to reconcile.
3. **Use real Postgres enums** for closed vocabularies (category, exam type,
   education level, task source, etc.). The old schema's reason for avoiding
   them — migration churn on a live system — does not apply to a schema
   being created fresh.
4. **Do not port the legacy adaptive/SRS tables** (`Item`, `Construct`,
   `Tier`, `ItemConstruct`, `Attempt`, `ConstructAccuracy`, `SrsState`,
   `VocabSrsState`). See `docs/architecture/architecture-review.md` §1.

## Consequences
- One less dependency (Prisma), one less schema-description mechanism to
  keep in sync with reality.
- A genuine simplification of the auth-to-data link: no identity-resolution/
  linking function is needed, because there's only one identity table.
- Enum changes (adding a new category, for instance) now require a
  migration (`alter type ... add value`) instead of just shipping new
  application code that validates a wider string set. This is an accepted
  cost — the benefit is the database itself enforcing the closed set, which
  the string-based approach could not.
- Losing the legacy SRS/construct-accuracy capability is a real, named
  feature gap, not an oversight — tracked in `architecture-review.md` as a
  deliberate v1 trade-off, open to revisiting with real usage data.

## Alternatives considered
- **Keep Prisma for its relational convenience**: rejected — no feature in
  this app's plan needs a relational query builder beyond what Supabase's
  generated types + plain SQL/PostgREST already provide, and removing it
  removes a class of "Prisma schema says X, Postgres says Y" drift bugs
  entirely.
- **Keep strings instead of enums, matching the old schema**: rejected — the
  specific reason the old app chose strings (avoiding migration churn on a
  live database) doesn't exist for a schema with no rows yet.
