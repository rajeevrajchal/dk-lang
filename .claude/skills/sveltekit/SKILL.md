---
name: sveltekit
description: SvelteKit conventions for this project — routing, load functions, actions, runes, when (rarely) to use +server.ts.
---

# SvelteKit

## When to use
Any time you're writing a route (`+page.svelte`, `+page.server.ts`,
`+server.ts`) or a component.

## When NOT to use
Pure business-logic files under `src/lib/features/` that have no SvelteKit
import at all — those are plain TypeScript, reviewed against `backend` or
`ai` conventions instead.

## Rules
- `+page.server.ts` `load()` for reads, form actions for writes. This
  covers the overwhelming majority of routes in this app.
- `+server.ts` only for: async-generation status polling, streaming, or a
  webhook. Anything else is a misuse — see
  `docs/architecture/overview.md#where-server-ts-endpoints-are-legitimate`.
- Route groups: `(auth)` for public, `(app)` for session-gated (enforced
  once in `(app)/+layout.server.ts`, not re-checked per route).
- Svelte 5 runes for component state. No `writable()` stores for data that
  belongs to one route's `load()`.
- `event.locals.supabase` / `event.locals.user`, set once in
  `hooks.server.ts`, used everywhere. Never re-derive session identity
  inside a route.

## Workflow
1. Decide: read or write? → `load()` or action.
2. Does this need client-side polling/streaming? → only then, a `+server.ts`.
3. Validate action input with Zod before calling feature logic.
4. Call the feature function (`src/lib/features/<domain>/`) — don't inline
   query/business logic into the route file.
5. Return typed data / `fail()` results.

## Examples
```ts
// +page.server.ts — the default shape for almost everything
export const load: PageServerLoad = async ({ locals, params }) => {
  const task = await getTask(locals.supabase, params.taskNumber);
  return { task };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const parsed = submitSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return fail(400, { errors: parsed.error.flatten() });
    await recordAttempt(locals.supabaseAdmin, parsed.data);
    return { success: true };
  }
};
```

## Common mistakes
- Adding a `+server.ts` "for the API" when a load/action would do — this is
  the single most common deviation from this project's architecture and
  should be caught in review every time.
- Client-side `fetch()` to your own app for data `load()` could supply.
- A global store created for data that's only ever used on one route.
- Putting grading/validation logic inside the `.svelte` component instead of
  a `src/lib/features/` function called from the server.
