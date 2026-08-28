# Feature: Speaking

## Purpose
Exam-format speaking practice across four real opgave formats (mindmap,
information-gap, prepared-topic, picture-preference), with an AI "examiner"
driving one conversational turn at a time and AI-generated feedback at the
end.

## User Story
As a learner, I practice speaking tasks as a back-and-forth with an AI
examiner that responds appropriately to what I actually said, then get
feedback on my performance.

## User Flow
1. `/class/speaking/[taskNumber]` (or a mock-test speaking part).
2. Task-type-specific setup (e.g. information-gap shows two different
   "cards" and asks the learner to find the difference through dialogue).
3. Learner responds (text input, or transcribed audio if/when that's
   added — out of scope for v1, text-based turns only to start).
4. Examiner AI responds with the next turn, informed by conversation state
   so far (not a full history replay each time).
5. After the task's turn budget, AI-generated feedback is shown.

## UI Responsibilities
Conversation UI (turn history, current prompt, input), per-task-type setup
screen (the four formats have genuinely different setup needs).

## Server Responsibilities
`src/lib/features/speaking/state.ts` persists conversation state
(`exercise_attempts.speaking_state_json`) so each turn's prompt only needs
"where the conversation is," not the full history — same design as the old
app, worth keeping exactly. Layered prompt composition: a core
examiner-behavior prompt + per-module demands + per-task-type stage
guidance (`demandsForModule()`, `stagesForTaskType()` equivalents).

## Database Entities
`exercise_attempts` (`speaking_state_json`, `feedback_json`).

## Data Flow
Each turn: form action → load state → AI turn call → update state → return
next prompt to UI. Final turn additionally triggers feedback generation.

## API / Server Actions
One action for "submit a turn," one for "end and get feedback." No
`+server.ts` needed — turns are discrete submissions, not a stream (unless
a future version wants token-level streaming, which would then use a
`+server.ts` per the documented exception).

## AI Usage
`speakingTurn()` (one conversational turn, informed by persisted state) and
`generateSpeakingFeedback()` (end-of-task). Both validated against Zod
schemas; examiner behavior never determines pass/fail — that's computed
separately if/when speaking gets scored (see Future Improvements).

## State Management
Server-persisted (`speaking_state_json`), not client state — a page reload
mid-conversation should not lose progress.

## Validation
Turn input validated for basic shape (non-empty, within a reasonable length)
before the AI call.

## Error Handling
A failed turn generation should not lose the learner's submitted turn —
their input is still recorded, with a retry option for the examiner's
response specifically.

## Permissions
Same as Class.

## Metrics
Contributes to category progress/attempt counts the same as Writing
(speaking is also unscored numerically in the audited old app — confirm
against current product scope before Phase 10; if scoring is added, it
follows the same null-score handling pattern as Writing).

## Dependencies
Depends on Class and the AI registry.

## Feature Graph
`Class → Speaking → Progress`.

## Implementation Steps
See `implementation-roadmap.md` Phase 10.

## Testing Strategy
- State persistence across turns (reload mid-conversation resumes
  correctly).
- Each of the four task-type setups renders its distinct requirements.
- Turn failure doesn't lose the learner's already-submitted input.

## Future Improvements
- Audio input/transcription — explicitly out of scope for the initial
  rewrite; text-based turns only until there's a concrete need.
- Numeric scoring, if the product ever wants it — same deliberate-design
  caveat as Writing's auto-grading.
