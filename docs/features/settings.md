# Feature: Settings

## Purpose
Let a learner manage their profile, override their self-assessed level, and
enter/confirm official results — the one place account-level state lives,
deliberately not a dumping ground for unrelated application state.

## User Story
As a learner, I can update my level if my self-assessment was wrong, upload
a report card to confirm an official result, and manage basic account info.

## User Flow
1. `/settings` → profile section (name, education track, interests),
   level-override section, official-results section (list + upload new).
2. Uploading a report card: Storage upload → OCR extraction (async, similar
   "preparing" pattern to task generation if extraction is slow) → learner
   reviews/confirms extracted results → `official_test_results` +
   `module_skill_status` updated.

## UI Responsibilities
Three sections as above; upload progress UI (uses the browser-side Supabase
client for the Storage upload itself — the one legitimate client-side
Supabase use in the app, per
`docs/architecture/database-architecture.md#browser-client`).

## Server Responsibilities
Profile/interest updates: same validation as Onboarding (it's the same
underlying data). Report-card OCR: server-side extraction call (not
necessarily AI — could be a dedicated OCR service; if it is AI-backed, it
still follows the registry/validation pattern), then a confirm action that
writes `official_test_results` and reconciles `module_skill_status`
(official result always wins for `official_passed`; a mismatch with
`in_app_passed` sets `discrepancy = true` rather than editing
`in_app_passed`).

## Database Entities
`profiles`, `profile_interests`, `report_cards`, `official_test_results`,
`module_skill_status`.

## Data Flow
Upload → Storage → OCR → learner confirms → writes. See
`docs/architecture/application-flow.md`'s "report card reconciliation"
section.

## API / Server Actions
Form actions for profile updates and result confirmation; a `+server.ts` or
direct Storage client call for the upload itself (file upload progress UX
benefits from direct-to-Storage, not proxying the file through a form
action).

## AI Usage
OCR extraction may use a model (image → structured result) — if so, it's a
small `src/lib/ai/report-extraction.ts` function following the same
contract table as every other AI operation (input, output, validation,
fallback: if extraction fails or confidence is low, the learner enters
results manually instead).

## State Management
Upload progress is local component state; everything else is load/action
data.

## Validation
Extracted results require learner confirmation before being written as
authoritative — never trust OCR output directly, same principle as never
trusting raw AI output elsewhere.

## Error Handling
Low-confidence extraction surfaces a manual-entry fallback rather than
silently accepting a possibly-wrong result.

## Permissions
All of this is strictly user-scoped via RLS; report-card file objects in
Storage use a Storage policy scoped the same way.

## Metrics
Feeds `module_skill_status.official_passed` → Unlock → Dashboard's level
display indirectly.

## Dependencies
Depends on Authentication (session) and feeds Unlock (via
`module_skill_status`).

## Feature Graph
`Settings → Profile`; `Settings → official_test_results → module_skill_status → Unlock`.

## Implementation Steps
See `implementation-roadmap.md` Phase 16 (grouped with other hardening
work, since it's not on the critical path to a usable v1 — a learner can
use the app fully via self-assessed level alone).

## Testing Strategy
- Upload → extraction → confirm flow with a seeded low-confidence case
  (manual fallback triggers).
- Reconciliation: official result disagreeing with an existing
  `in_app_passed = true` sets `discrepancy` without altering
  `in_app_passed`.

## Future Improvements
None identified beyond general account-management additions (e.g. account
deletion flow), to be added when actually requested.
