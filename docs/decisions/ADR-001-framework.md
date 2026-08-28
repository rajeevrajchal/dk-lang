# ADR-001: Framework — SvelteKit over Next.js

## Status
Accepted.

## Context
The existing application is built on Next.js 16 (App Router) + React 19 +
Prisma + Supabase. It works, but the product requirement for this rewrite is
specifically a move to SvelteKit, independent of any specific defect in the
Next.js implementation — this is a deliberate technology change, not a
reaction to a framework limitation.

## Decision
Rebuild on SvelteKit (Svelte 5, runes), TypeScript strict, deployed to
Vercel, dropping Prisma in favor of Supabase's generated types and direct
Supabase-js/PostgREST access (see ADR-002).

## Consequences
- Every Next.js-specific mechanism needs a SvelteKit equivalent:
  `proxy.ts` middleware → `hooks.server.ts`; Server Components/Route Handlers
  → `+page.server.ts` load/actions and `+server.ts`; `after()` → `waitUntil`
  from `@vercel/functions` (framework-agnostic, still works under SvelteKit
  on Vercel).
- React Context usage in the old app was already minimal (two providers) —
  this does not need to become Svelte stores wholesale; most of it maps to
  `load` data and component-local runes state instead.
- No code is ported verbatim. Each subsystem is re-evaluated against the
  audit's KEEP/REBUILD/REMOVE/RECONSIDER findings (see
  `docs/architecture/architecture-review.md`) before being rebuilt in the
  new framework — the migration is also the opportunity the product
  requirement explicitly asked for to simplify, not just a mechanical port.

## Alternatives considered
- **Port Next.js app as-is, fix complexity in place**: rejected — this was
  the state before the decision to rewrite; the product requirement is
  explicitly a framework change, and keeping Next.js while "simplifying"
  would not satisfy it.
