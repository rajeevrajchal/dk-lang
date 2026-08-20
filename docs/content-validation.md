# Content validation

## What "validated" means here

Every practice item is:

1. **Tagged, not just leveled.** An item carries `module`, `skill`, `tier`,
   and one or more construct codes (`lib/content-gen/constructs.ts`) — e.g.
   `["subordinate-clause:fordi"]`. The tier a construct belongs to is fixed
   once in the construct catalogue, not re-decided per item, so "Tier 2"
   means the same thing everywhere it's used.
2. **Isolated to 1–2 target constructs per passage.** A Modul 2 Tier 2
   reading passage about a job change deliberately uses *fordi* and past
   tense as its only "new" grammar, not every construct the learner has seen
   — so a wrong answer on that passage's gap-fill is attributable to a
   specific construct, not "reading is hard today." This is what makes the
   weak-area recommendation ("you drop to 40% on 'selvom'") possible in the
   first place: it's only as precise as the tagging discipline behind it.
3. **Written to the tier definition, not to a vibe.** `lib/curriculum/tiers.ts`
   defines each tier's grammar ceiling in one sentence (e.g. Tier 3:
   "multiple subordinate clauses, passive voice, wider connectors"). Every
   passage at that tier is checked against that sentence before it's
   committed — if a Tier 2 passage accidentally uses passive voice, that's a
   tagging bug, not a stylistic choice.
4. **Never modeled on a real exam text.** No passage, question, or rubric in
   this repo is copied, adapted, or paraphrased from an actual SIRI
   modultest or PD3 paper, or from any commercial exam-prep bank. Topics
   (arbejde, uddannelse, hverdagsliv, medborgerskab) and task types
   (multiple choice, true/false, gap-fill, matching) mirror the *publicly
   known shape* of the real test — that's a description of a format, not a
   reproduction of content.
5. **Always flagged `generated: true`** at the schema level (`Item.generated`
   in `prisma/schema.prisma`), so nothing generated can silently pass itself
   off as sourced material, and a future admin view can filter on it.

## How this scales without drifting off-level

Today's Modul 2 reading bank (38 items) was hand-authored against the tier
ladder above and reviewed by re-reading each passage against its tier's
one-sentence definition. That doesn't scale to five modules × four skills on
its own. The intended path for the remaining content:

- **Offline generation, human-gated.** `lib/content-gen/` is where
  generation happens — by hand or LLM-assisted — but nothing in
  `app/` ever calls a generation step at request time (see the stack
  rationale in the README: "Content generation as a batch/offline step, not
  live LLM calls per request"). A generation pass produces candidate items
  as the same typed `GeneratedReadingItem[]` shape used today; a human
  reviews and edits before `prisma/seed.ts` loads them.
- **A construct/tier checklist, not a global "does this feel B1?" read.**
  Because every item declares its target construct(s), review is a
  checklist: does this passage's grammar match its tier's ceiling *and* stay
  at or below the module's ceiling tier (`tiersSpanned` in
  `lib/curriculum/modules.ts`)? That's a much smaller judgment call than
  rating a whole passage's CEFR level from scratch.
- **A second-pass sanity check worth adding before scaling up:** compare a
  sample of generated passages' sentence length, subordinate-clause count,
  and vocabulary frequency band against known CEFR benchmarks (e.g. the
  Common European Framework's own descriptors, or a Danish frequency
  wordlist) as an automated lint, not a replacement for human review — a
  useful next step, not yet built.
