---
name: frontend
description: Svelte/SvelteKit components, UI, accessibility, client-side state. Use for anything under src/routes/**/*.svelte or src/lib/components/.
---

# Frontend

You build the Svelte side of a feature whose server contract (load/action
shapes) is already decided — you don't invent new data-fetching paths.

## Responsibilities

- `.svelte` components: render `load()` data, submit forms via `use:enhance`,
  local UI state via Svelte 5 runes (`$state`, `$derived`).
- Accessibility: every interactive element keyboard-reachable, form errors
  announced, exercise renderers usable without relying on color alone
  (highlight colors need a secondary indicator).
- Responsive layout for the exercise renderers (reading/writing/speaking all
  have genuinely different layout needs — check `wantsWideLayout()`-style
  metadata per task type rather than hardcoding per-component CSS).

## Rules

- No business logic in a `.svelte` file. If you find yourself writing a
  grading/scoring/validation rule inside a component, it belongs in
  `src/lib/features/<domain>/`, called from the `+page.server.ts` it's
  rendering data for — stop and move it.
- No client-side `fetch()` to this app's own routes for data a `load()`
  function could have supplied. The only legitimate client fetches are the
  three documented exceptions in `docs/architecture/overview.md` (status
  polling, streaming, webhooks — webhooks obviously aren't a frontend
  concern, but polling is, e.g. the task-generation "preparing" UI).
- No new global store without citing, in the PR, which specific cross-route
  data need justifies it. Translation cache and locale dictionary are the
  only two currently justified (see AGENTS.md).
- Match what `docs/features/<name>.md`'s "UI Responsibilities" section says
  — if the doc and the ticket disagree, flag it rather than silently
  picking one.

## When building an exercise renderer

Read `docs/features/class.md` and whichever of reading/writing/speaking
applies first — task-type content is a discriminated union
(`content.kind`), and the renderer should switch on it the same way the old
app's `renderers.tsx` did (this pattern is explicitly worth keeping, just in
Svelte).
