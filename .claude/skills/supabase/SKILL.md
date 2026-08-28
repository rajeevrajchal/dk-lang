---
name: supabase
description: How this project talks to Supabase — client split, auth, storage, generated types.
---

# Supabase

## When to use
Any time code needs to read or write Supabase data, handle auth, or touch
Storage.

## When NOT to use
For anything that's pure in-memory logic once data is already fetched —
that's just TypeScript, not a Supabase concern.

## Rules
- Two server clients only: `event.locals.supabase` (user-JWT, RLS-scoped —
  the default) and `event.locals.supabaseAdmin` (service-role, bypasses
  RLS — only for the documented exceptions in `docs/database/rls.md`).
- A browser-side Supabase client exists only for Storage direct-upload
  (report-card images) — never for querying user data directly.
- Identity: `hooks.server.ts` resolves the session once; routes read
  `locals.user`, never call Supabase Auth directly to ask "who is this."
- Regenerate `src/lib/types/database.ts` after every migration, same PR.

## Workflow
1. Need to read/write user data? Use `locals.supabase` by default.
2. Need a service-role write (derived/authoritative state)? Check
   `docs/database/rls.md`'s table first — is this one of the listed
   exceptions? If not, it probably shouldn't be a service-role write.
3. Multi-table atomic write? Use a Postgres function via `.rpc()`, not
   sequential inserts.
4. After any schema change, regenerate types before writing code against
   the new shape.

## Examples
```ts
// src/lib/server/db.ts
export function createSupabaseServerClient(event: RequestEvent) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => event.cookies.getAll(), setAll: (c) => c.forEach(...) }
  });
}
```

## Common mistakes
- Reaching for `supabaseAdmin` "because it's easier" instead of fixing the
  RLS policy that's actually blocking a legitimate user-scoped write.
- Querying Supabase directly from a `.svelte` component instead of through
  `load()`.
- Hand-editing generated types instead of regenerating them from a
  migration.
- Forgetting that RLS controls rows, not columns — a public-facing query
  must still select an explicit column list excluding answer-key fields
  (see `docs/database/rls.md`'s column-level note).
