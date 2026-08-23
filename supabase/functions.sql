-- Database functions the repositories call through PostgREST's .rpc().
--
-- WHY THESE EXIST
--
-- PostgREST's upsert is `ON CONFLICT DO UPDATE` with a single row: the values
-- written on insert and on update are necessarily the same. Prisma's upsert
-- takes two separate payloads, and several places in this app genuinely depend
-- on the difference:
--
--   * reading progress accumulates seconds on update but sets them on insert,
--     and a finished text must stay finished when it is opened again;
--   * saving a word again refreshes its translation without wiping the note
--     the learner wrote;
--   * opening a lesson must not demote a completed one back to in-progress.
--
-- Doing those with read-then-write from the application would be racy —
-- two tabs open on the same text would lose reading time. Doing them here
-- makes each one a single atomic statement.
--
-- Run after the schema exists, and again after any change:
--     psql "$DIRECT_URL" -f supabase/functions.sql
--
-- Every function is `security invoker` (the default), so Row Level Security
-- still applies to the caller. They are conveniences, not a way around it.

-- ---------------------------------------------------------------------------
-- Reading progress
-- ---------------------------------------------------------------------------

create or replace function public.reading_progress_upsert(
  p_user_id text,
  p_text_id text,
  p_status text default null,
  p_bookmarked boolean default null,
  p_mark text default null,
  p_add_seconds integer default null
)
returns setof public."ReadingProgress"
language sql
as $$
  insert into public."ReadingProgress" as rp
    ("id", "userId", "textId", "status", "bookmarked", "mark", "readSeconds",
     "openedAt", "completedAt", "updatedAt")
  values (
    gen_random_uuid()::text,
    p_user_id,
    p_text_id,
    coalesce(p_status, 'OPENED'),
    coalesce(p_bookmarked, false),
    p_mark,
    coalesce(p_add_seconds, 0),
    now(),
    case when p_status = 'COMPLETED' then now() else null end,
    now()
  )
  on conflict ("userId", "textId") do update set
    -- Only ever promotes. OPENED arrives on every visit, so treating it as an
    -- update would undo the completion each time the learner re-reads.
    "status" = case when p_status = 'COMPLETED' then 'COMPLETED' else rp."status" end,
    "completedAt" = case
                      when p_status = 'COMPLETED' then coalesce(rp."completedAt", now())
                      else rp."completedAt"
                    end,
    -- A null argument means "leave it alone", not "set it to null".
    "bookmarked" = coalesce(p_bookmarked, rp."bookmarked"),
    "mark" = case when p_mark is null then rp."mark" else p_mark end,
    "readSeconds" = rp."readSeconds" + coalesce(p_add_seconds, 0),
    "updatedAt" = now()
  returning *;
$$;

-- ---------------------------------------------------------------------------
-- Saved vocabulary
-- ---------------------------------------------------------------------------

create or replace function public.saved_word_upsert(
  p_user_id text,
  p_kind text,
  p_danish text,
  p_translation text,
  p_lemma text default null,
  p_part_of_speech text default null,
  p_context_sentence text default null,
  p_grammar_note text default null,
  p_source_text_id text default null,
  p_note text default null
)
returns setof public."SavedWord"
language sql
as $$
  insert into public."SavedWord" as sw
    ("id", "userId", "kind", "danish", "lemma", "translation", "partOfSpeech",
     "contextSentence", "grammarNote", "sourceTextId", "note", "learned",
     "vocabItemId", "createdAt", "updatedAt")
  values (
    gen_random_uuid()::text,
    p_user_id, p_kind, p_danish, p_lemma, p_translation, p_part_of_speech,
    p_context_sentence, p_grammar_note, p_source_text_id, p_note, false,
    -- Link to the seeded bank when this word is also in it, so the two stay
    -- one vocabulary rather than drifting apart.
    (select vi."id" from public."VocabItem" vi
      where vi."danish" = coalesce(p_lemma, p_danish) limit 1),
    now(), now()
  )
  on conflict ("userId", "danish") do update set
    -- Saving the same word from another text refreshes what we know about it.
    "translation" = p_translation,
    "lemma" = coalesce(p_lemma, sw."lemma"),
    "partOfSpeech" = coalesce(p_part_of_speech, sw."partOfSpeech"),
    "contextSentence" = coalesce(p_context_sentence, sw."contextSentence"),
    "grammarNote" = coalesce(p_grammar_note, sw."grammarNote"),
    -- But never wipes a note the learner wrote themselves.
    "note" = coalesce(p_note, sw."note"),
    "updatedAt" = now()
  returning *;
$$;

-- ---------------------------------------------------------------------------
-- Lesson visits
-- ---------------------------------------------------------------------------

create or replace function public.lesson_progress_visit(
  p_user_id text,
  p_lesson_slug text,
  p_chapter_id text default null
)
returns setof public."LessonProgress"
language sql
as $$
  insert into public."LessonProgress" as lp
    ("id", "userId", "lessonSlug", "chapterId", "status", "startedAt",
     "lastVisitedAt", "completedAt", "updatedAt")
  values (
    gen_random_uuid()::text, p_user_id, p_lesson_slug, p_chapter_id,
    'IN_PROGRESS', now(), now(), now(), now()
  )
  on conflict ("userId", "lessonSlug") do update set
    "lastVisitedAt" = now(),
    "chapterId" = coalesce(p_chapter_id, lp."chapterId"),
    -- Opening a finished lesson must not demote it back to in-progress.
    "status" = lp."status",
    "updatedAt" = now()
  returning *;
$$;

-- ---------------------------------------------------------------------------
-- Module skill status
--
-- Writes the in-app signal only. `officialPassed` is what an examiner decided
-- and is never touched here — that separation is the point of the model, so it
-- is enforced by this function's shape rather than by remembering.
-- ---------------------------------------------------------------------------

create or replace function public.module_skill_apply_in_app(
  p_user_id text,
  p_module_id integer,
  p_skill text,
  p_score double precision,
  p_passed boolean
)
returns setof public."ModuleSkillStatus"
language sql
as $$
  insert into public."ModuleSkillStatus" as m
    ("id", "userId", "moduleId", "skill", "inAppPassed", "inAppScore",
     "inAppPassedAt", "discrepancy", "updatedAt")
  values (
    gen_random_uuid()::text, p_user_id, p_module_id, p_skill, p_passed, p_score,
    case when p_passed then now() else null end, false, now()
  )
  on conflict ("userId", "moduleId", "skill") do update set
    -- A pass is never taken away by a later weaker attempt.
    "inAppPassed" = m."inAppPassed" or p_passed,
    "inAppScore" = p_score,
    "inAppPassedAt" = case
                        when p_passed then coalesce(m."inAppPassedAt", now())
                        else m."inAppPassedAt"
                      end,
    "updatedAt" = now()
  returning *;
$$;
