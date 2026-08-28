# AGENTS.md — dk-lang

This file is the instruction manual for any coding agent (Claude Code or otherwise)
working on this repository. Read this before touching code. If something here
conflicts with a comment in the code, this file wins — the code should be fixed
to match, not the other way around.

> **Migration status**: this repository is being rewritten from Next.js/React
> to SvelteKit. Until the migration is complete, the existing Next.js app keeps
> running under `app/`, `components/`, `lib/`, `types/` (Prisma + Supabase).
> The architecture described below is the **target state** for the rewrite,
> living under `src/` once work begins. Do not mix the two: a feature is either
> being read for reference (old tree) or being built (new tree), never half-ported
> in place. See [docs/architecture/implementation-roadmap.md](docs/architecture/implementation-roadmap.md)
> for the cutover plan.

## What the application does

dk-lang is a Danish-language learning platform focused on PD3 test preparation
(Prøve i Dansk 3) and general module progression (Modul 1–5). Learners work
through a grammar course, practice reading/writing/speaking by category, sit
mock tests that mirror the real exam, and track progress toward both in-app
and officially-confirmed module passes. See [PROJECT.md](PROJECT.md) for the
product view.

## Technology stack

- **SvelteKit** (Svelte 5, runes) — the only application framework. No React.
- **TypeScript** — strict mode, no `any` without a comment explaining why.
- **Supabase** — Postgres, Auth, Storage. The database, not an add-on.
- **Google OAuth** via Supabase Auth — the only sign-in method in production.
- **Vercel** — deployment target. Serverless functions, not a long-running server.
- **Vercel AI SDK** — the only way the app talks to an LLM. Two providers
  (Anthropic, OpenAI) behind one registry — see
  [docs/architecture/ai-architecture.md](docs/architecture/ai-architecture.md).

## Architectural principles, in order of priority

1. **Simplicity over cleverness.** If a junior engineer can't trace a request
   from route to database and back in under five minutes, it's too complex.
2. **AI is not the application engine.** Scoring, progress, unlocking, question
   selection, and dashboard metrics are computed in SQL/TypeScript, never by
   asking an LLM. AI explains and generates language content; it never decides
   application state. See the AI boundary rules below — they are non-negotiable.
3. **Server owns data.** `+page.server.ts` load functions and form actions talk
   to Supabase. Client code never calls Supabase directly for anything
   user-scoped. A `+server.ts` route exists only when a page load/action genuinely
   cannot do the job (async-generation status polling, an endpoint a client
   poller calls outside of a navigation).
4. **Small, domain-organized modules.** `src/lib/features/<domain>/` over a
   generic service/repository layer. Two real use cases before you extract
   a shared utility, not one imagined one.
5. **Normalized schema, enums for closed sets.** No duplicated/derivable columns.
   Real Postgres `enum` types for closed vocabularies (category, exam type,
   education level, etc.) — this is a fresh schema, there is no migration-churn
   excuse to store them as strings. See
   [docs/database/schema.md](docs/database/schema.md).
6. **RLS is the authorization boundary**, not application code. Every
   user-owned table has RLS policies written and tested before the feature
   ships. App code enforces *nothing* that RLS could enforce instead.

## SvelteKit conventions

- Route groups: `(auth)` for public auth screens, `(app)` for everything
  behind a session (enforced once, in `(app)/+layout.server.ts`).
- Prefer `+page.server.ts` `load` for reads and form actions for writes.
  Use `+server.ts` only for: (a) endpoints a client-side poller calls on an
  interval outside normal navigation, (b) webhooks, (c) streaming responses.
- Svelte 5 runes (`$state`, `$derived`, `$effect`) for component-local state.
  No global store for data that belongs to a single route's load function.
- Use `locals.supabase` and `locals.user`, populated once in `hooks.server.ts`,
  everywhere a request needs identity or a DB client. Don't re-derive either
  inside a route.
- Validate all form action input and all AI output with Zod schemas defined
  next to the feature that owns them, not in a shared "schemas" grab-bag.

## Database conventions

- `snake_case` tables and columns, plural table names.
- Every user-owned table has a `user_id uuid references auth.users(id)` and
  an RLS policy scoping reads/writes to `auth.uid() = user_id`.
- Foreign keys are real FKs, not "the app just knows." Cascade deletes only
  where losing the child row on parent delete is actually correct.
- Append-only event tables (e.g. graded-answer history) are never updated in
  place; derived aggregates are written by the same function that writes the
  event, so they cannot drift apart. See `docs/features/progress.md`.
- Content that ships in code (lesson text, reading passages, verb lists) has
  **no table**. Only the user's *relationship* to that content (progress,
  saved words, attempts) lives in the database, keyed by a stable string id.

## Supabase conventions

- Two server-side clients only: a per-request user-JWT client (subject to
  RLS, the default for everything) and an admin/service-role client (bypasses
  RLS, used only for pre-session operations and shared/global content writes).
  Never use the admin client because "it's easier" — justify it in a comment
  every time.
- Generated types (`supabase gen types typescript`) are committed and
  regenerated after every migration, never hand-edited.

## AI boundaries — read this twice

AI is used for exactly five kinds of operation, each its own small function
under `src/lib/ai/`:

- Explaining a sentence, word, or grammar point
- Generating writing/speaking feedback
- Generating additional practice content when the authored pool is exhausted

AI is **never** used for: scoring, checking an answer, deciding whether a
lesson/task is complete, computing any dashboard number, selecting which
question a user sees next (that's a deterministic slot/catalogue lookup),
or anything else that has a correct deterministic answer. If you find
yourself about to call the model to "figure out" something that the database
already knows, stop — that's a bug, not a feature.

Every AI call:
- Goes through the shared registry (`src/lib/ai/registry.ts`) for provider/model/
  effort selection — never hardcode a model id in a feature file.
- Validates output with a Zod schema before it touches application state.
- Has a non-AI fallback path (authored content, a cached prior explanation,
  or a "try again" state) — the app must not hard-fail because a model call
  failed or no API key is configured.
- Is never called from a page `load` function for content that could instead
  be read from the database. Generation happens on submit/demand, deferred off
  the request path when slow (see `docs/architecture/ai-architecture.md` for
  the async-generation pattern on serverless).

## Authentication rules

- Supabase Auth only. No credentials table, no password hashing in this app —
  Supabase owns that. Google OAuth is the production sign-in method.
- Session identity is resolved once per request in `hooks.server.ts` and
  attached to `event.locals`. Routes and components read `locals.user`;
  they never call Supabase Auth directly to ask "who is this."
- A dev-only test-login shortcut may exist behind an environment check that
  is verified in at least two independent places (the route handler and the
  layout guard), exactly as the current Next.js implementation does it — see
  [docs/features/authentication.md](docs/features/authentication.md). It must
  be unreachable in any production build by construction, not by convention.

## Feature development process

Every feature follows [.claude/skills/feature-development/SKILL.md](.claude/skills/feature-development/SKILL.md):
read AGENTS.md → read the relevant architecture doc → read the feature doc →
inspect existing code → plan → implement the smallest useful version → test →
update docs. Never jump from "build the dashboard" straight to writing dozens
of files.

## Naming conventions

- Files: `kebab-case.ts`, Svelte components `PascalCase.svelte`.
- Functions: verbs for actions (`getDashboardMetrics`, `recordAnswer`), nouns
  for pure derivations (`resumePoint`, `nextTaskNumber`).
- Database: `snake_case`, singular concept names pluralized only for the
  table (`task`, table `tasks`).

## TypeScript rules

- `strict: true`. No implicit `any`. Shared types live next to the feature
  that owns them; only types genuinely used by three or more features move
  to `src/lib/types/`.
- Prefer discriminated unions over boolean flags for exercise/content kinds
  (this is the one pattern worth carrying over from the old renderer code
  nearly verbatim).

## Error handling

- AI calls return a typed outcome (`{ ok, value } | { ok: false, reason }`),
  never throw to the caller — this is the one pattern from the old
  `lib/ai/generate.ts` worth keeping exactly.
- Form actions return typed `fail()` results with field-level errors; they
  don't throw for expected validation failures.
- Unexpected errors (DB down, etc.) are allowed to throw and hit SvelteKit's
  error boundary — don't swallow what you can't meaningfully recover from.

## Data fetching rules

- One query per piece of data, on the server, in the `load` function that
  needs it. No client-side `fetch` to your own app for data a `load` function
  could have supplied.
- No duplicated queries across sibling components rendering the same route —
  fetch once in `load`, pass down via props/slots.
- Pagination and date-range limits on every list query before it ships, not
  added later "when it becomes slow."

## Security rules

- RLS on every user-owned table, tested (see `docs/database/rls.md`).
- Never trust a client-supplied `user_id`, `score`, or answer-correctness
  value — always recompute server-side from what the user actually submitted.
- Secrets (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, Supabase service-role key)
  are server-only env vars, never exposed to `+page.ts`/client code.

## Agents MUST NOT

- Introduce an abstraction (service layer, generic repository, new store)
  without a demonstrated need from at least two real call sites.
- Create an API endpoint when a server load function or form action would do.
- Use AI for anything with a deterministic correct answer.
- Fetch data client-side that the server could have loaded.
- Duplicate a database query across components.
- Create a global store for data that belongs to one route.
- Put business logic inside a `.svelte` file — components render; logic lives
  in `src/lib/features/`.
- Add a dependency without writing, in the PR description, why it's needed.
- Denormalize the schema without an ADR explaining why.
- Port code from the old Next.js tree verbatim without checking the relevant
  `docs/features/*.md` for what should change in the rewrite.

## How agents modify existing (new-tree) features

Read the feature's doc in `docs/features/`, check `docs/architecture/feature-dependencies.md`
for what depends on it, make the change, update the feature doc if behavior
changed, run tests.

## How agents add new features

Follow the phase order in
[docs/architecture/implementation-roadmap.md](docs/architecture/implementation-roadmap.md)
unless there's a specific reason to deviate — and if you deviate, say why in
the PR description.
