# Feature: Reading

## Purpose
Exam-format reading practice (via Class's task ladder) plus an extensive
reading library for free reading practice, with word/sentence explanation
support calibrated to minimize AI cost.

## User Story
As a learner, I practice exam-style reading tasks, and separately browse a
library of Danish texts at my level, clicking any word or sentence for an
explanation when I need it.

## User Flow
- **Exam-format**: via Class — `/class/reading/[taskNumber]`, same flow as
  `docs/features/class.md`.
- **Library**: `/class/reading/library` → browse/recommended texts →
  `/class/reading/library/[textId]` → read, highlight, save words, take
  notes, click a word/sentence for an explanation.

## UI Responsibilities
`InteractiveText`-equivalent: click-to-explain word/sentence, highlight
(4-color cycle), save-word action, note-taking anchored to content (not
character offset, so it survives minor text edits).

## Server Responsibilities
Library recommendation (`recommend()`): scores rather than filters —
interest match, proximity to course progress, novelty — deliberately not
gated by official module level ("what you can read follows from what
you've been taught, not from a certified pass"). Explanation lookup follows
the three-tier cost rule (authored glossary → shared cache → model).

## Database Entities
`reading_progress`, `saved_words`, `reading_notes`, `reading_highlights`,
`reading_explanations` (shared cache). Text content itself is code-shipped
(no table), keyed by a stable `text_id`.

## Data Flow
See `docs/architecture/data-flow.md`'s "AI-backed read" section for the
explanation path specifically.

## API / Server Actions
Library browsing and text reading are `load()`s. Explanation-on-click is a
form action (demand-triggered, not render-triggered) — or, if the UX needs
true in-place fetch without a full form submission, a narrowly-scoped
`+server.ts` endpoint is acceptable here specifically because it's triggered
by an arbitrary number of clicks per page view, not a navigation.

## AI Usage
`explainSentence()` / `explainWord()` — cache-checked first, model only on
a double-miss. See `docs/architecture/ai-architecture.md`'s three-tier
rule. A regression test asserts level 1–2 texts gloss at least half their
longer words in the authored tier, since a beginner has no fallback.

## State Management
Highlight/note state is optimistic-UI-then-persisted via form actions; no
global store.

## Validation
Saved words deduplicated via the `(user_id, danish)` unique constraint
(upsert, not insert-and-fail). Notes validated for non-empty content.

## Error Handling
Explanation failure (AI unavailable or model error) shows a retry state;
the text itself is always readable regardless of explanation availability.

## Permissions
Library read requires a session (all authenticated users see the same
library); progress/notes/highlights/saved-words are user-scoped via RLS.

## Metrics
Feeds Dashboard indirectly through `reading_progress` if a reading-specific
metric is ever added; currently the audited old app did not surface a
dashboard metric for library reading specifically, and this blueprint does
not add one speculatively.

## Dependencies
Depends on Progress is not required for the library (it's not graded —
there's no "attempt" to record for free reading); exam-format reading
depends on Class exactly as documented there.

## Feature Graph
`Class → Reading → Progress` (exam-format); library reading is a leaf off
Class with its own small dependency set (`profile_interests` for
recommendations).

## Implementation Steps
See `implementation-roadmap.md` Phase 8.

## Testing Strategy
- Three-tier cost rule: a word present in the authored glossary never
  triggers a model call, even on cache-miss of the shared cache.
- Glossary-coverage assertion for level 1–2 texts.
- Recommendation scoring: interest match contributes independently of
  module-level gating (i.e., a text above the learner's official level can
  still be recommended if it matches an interest and is near their course
  progress).

## Future Improvements
None beyond general library content growth.
