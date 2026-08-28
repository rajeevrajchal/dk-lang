# Feature: Onboarding

## Purpose
Determine a new learner's starting point (module/level) before they reach
the dashboard, so every other feature has a real `current_module_id` to
work against.

## User Story
As a new learner, I tell the app roughly where I am (self-assessed level, or
an official result if I already have one) so my dashboard and practice
recommendations start in the right place.

## User Flow
1. First sign-in → `profiles.level_source` is unset → redirected to
   `/onboarding` by the `(app)` layout (not the session guard — a session
   guard only checks "signed in," a separate check handles "onboarded").
2. Learner picks education track (DU2/DU3), self-assesses a starting
   module, optionally picks interests (biases reading recommendations
   later).
3. Submit → `profiles` updated, `level_source = 'ONBOARDING'` →
   redirect to `/dashboard`.
4. If the learner already has an official result, they can instead jump to
   entering it (same flow Settings exposes later) — `level_source` becomes
   `'OFFICIAL_RESULT'` in that case.

## UI Responsibilities
Single-page form: education track, module select, interest picker
(multi-select). No business logic in the component — it submits and lets
the server decide validity.

## Server Responsibilities
`+page.server.ts` action: validate the submission (Zod), write `profiles`
+ `profile_interests`, set `level_source`, redirect.

## Database Entities
`profiles`, `profile_interests`, `modules` (read-only, for the select
options).

## Data Flow
Form submit → action → Zod validate → upsert `profiles` + replace
`profile_interests` rows → redirect to `/dashboard`.

## API / Server Actions
One form action (`default` or named `complete`) on
`(app)/onboarding/+page.server.ts`. No `+server.ts` needed.

## AI Usage
None — level self-assessment is the learner's own input, not AI-inferred.

## State Management
None beyond the form itself.

## Validation
Education track must be one of the enum values; module must be a real
`modules.id`; interests limited to a small closed list (same list reading
recommendations use) rather than free text, to keep `profile_interests`
genuinely useful for matching later.

## Error Handling
Standard `fail(400, { errors })` on invalid input; no AI involved, no
network-failure branch beyond the database write itself.

## Permissions
Requires a session (inherits from `(app)` guard); writes only the signed-in
user's own `profiles` row (RLS-enforced).

## Metrics
None directly, but `level_source` feeds the dashboard's level display and
`docs/features/progress.md`'s unlock reconciliation (an official result
entered here or later in Settings is the same code path).

## Dependencies
Depends on Authentication (needs a session) and `modules` reference data
(Phase 2). Feeds Dashboard.

## Feature Graph
`Auth → Profile → Onboarding → Dashboard`.

## Implementation Steps
1. Read AGENTS.md + this doc.
2. Confirm `modules` seed data exists (Phase 2).
3. Build the form + action.
4. Wire the `(app)/+layout.svelte` redirect-if-not-onboarded check.
5. Tests.
6. Update this doc if the interest list or fields change.

## Testing Strategy
- Form validation rejects an invalid module id / education value.
- Successful submit sets `level_source` and redirects.
- A learner who skips onboarding cannot reach `/dashboard` (layout check).

## Future Improvements
- A "skip for now, use a default module" path if onboarding friction turns
  out to matter — not built until there's evidence it's needed.
