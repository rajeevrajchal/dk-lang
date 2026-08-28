# Feature: Writing

## Purpose
Exam-format writing practice (via Class's task ladder) with AI-generated
feedback — explicitly **not** auto-scored in v1, by product decision.

## User Story
As a learner, I write a response to a prompt (sometimes replying to an
incoming email) and get feedback on grammar, structure, and vocabulary,
even though I don't get an automatic numeric score.

## User Flow
1. `/class/writing/[taskNumber]` (or a mock-test writing part).
2. Prompt shown (requirements: minimum word count, a checklist of things
   that must be included, optionally an incoming email to reply to).
3. Learner writes and submits.
4. AI feedback generated and shown; `exercise_attempts.score`/`total` are
   left `null` — the result screen says "not scored," not "0."

## UI Responsibilities
Prompt display with checklist/word-count requirements, a text area, and a
distinct "feedback" panel that only appears after submission and AI
generation completes (with a loading/retry state for the AI call).

## Server Responsibilities
Validate the submission meets the *structural* requirements deterministically
(word count, required checklist items present — simple string/keyword
checks, not AI) before generating feedback. Feedback generation itself
(`src/lib/ai/writing-feedback.ts`) happens only on submit, never
speculatively.

## Database Entities
`exercise_attempts` (`feedback_json` set, `score`/`total` left null for
writing specifically).

## Data Flow
Submit → deterministic requirement check → AI feedback call → store
`feedback_json` → record attempt via Progress (with null score — Progress
must accept this, not treat it as a failure).

## API / Server Actions
A single submit action; no `+server.ts`.

## AI Usage
`generateWritingFeedback()` — one call per submission, never re-triggered
automatically. Output includes grammar/structure/vocabulary feedback
sections, validated against a Zod schema.

## State Management
None beyond the form/text-area's own local state.

## Validation
Structural requirements (word count, checklist) are deterministic and
checked before the AI call — a submission that doesn't meet them is
rejected with a clear message, saving an AI call on something that would
fail review anyway.

## Error Handling
AI feedback failure → attempt is still recorded (the writing happened), but
`feedback_json` is null and the UI offers a retry specifically for
generating feedback, without requiring resubmission of the writing itself.

## Permissions
Same as Class — session required, RLS-scoped attempts.

## Metrics
Writing attempts contribute to "category progress" and "lessons/tasks
attempted" counts the same as any other category, but never to an average
*score* metric (since there is no score) — the dashboard metric function
must exclude null-score attempts from any average, not treat them as zero.

## Dependencies
Depends on Class (shares slot/renderer infrastructure) and the AI registry.

## Feature Graph
Same as Class's graph, specialized: `Class → Writing → Progress`.

## Implementation Steps
See `implementation-roadmap.md` Phase 9.

## Testing Strategy
- Structural requirement checks (word count, checklist) independent of AI.
- Null-score attempts are recorded correctly and excluded from average-score
  dashboard metrics.
- AI feedback failure leaves the attempt recorded with retry available.

## Future Improvements
Rubric-based auto-scoring is a deliberate, designed-fresh v2 feature (see
`PROJECT.md` and `architecture-review.md`) — not a port of anything, since
nothing in the old app does this either.
