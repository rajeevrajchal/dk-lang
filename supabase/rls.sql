-- Row Level Security for the Danish learning app.
--
-- THIS IS THE AUTHORIZATION BOUNDARY.
--
-- Every application query goes through lib/repositories/*, which uses
-- supabase-js carrying the signed-in learner's JWT. So these policies are
-- evaluated on every read and write the app makes: the database itself refuses
-- to return another learner's rows, rather than relying on the application
-- remembering to add a WHERE clause.
--
-- (An earlier iteration queried through Prisma, which connects as the table
-- owner and bypasses RLS entirely. That is why the repositories still filter
-- by userId as well — belt and braces, and it keeps the intent visible — but
-- the policies below are what actually enforces it now.)
--
-- The service-role key still bypasses all of this. It is used in exactly two
-- places: sign-in, before a session exists, and shared content that belongs to
-- nobody. See lib/supabase/db.ts.
--
-- Run once, after `prisma migrate deploy`:
--     psql "$DIRECT_URL" -f supabase/rls.sql
--
-- Re-runnable: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- 1. Turn RLS on everywhere
--
-- Enabled on every table, including the seeded content ones. A table with RLS
-- on and no policy denies everything, which is the right default: content is
-- served by the application, not fetched from the browser.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename not like '\_prisma%'
  loop
    execute format('alter table public.%I enable row level security', t);
    -- FORCE applies the policies to the table owner as well. Now safe, and
    -- worth having: the application no longer connects as the owner, so the
    -- only thing this locks down is a direct psql session or a stray script.
    -- The service role still bypasses it, which is what migrations and seeding
    -- rely on.
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Who is the current user?
--
-- Supabase puts the authenticated user's UUID in auth.uid(). The application's
-- own key is a cuid on "User", linked by "supabaseUserId" — so a policy has to
-- go through that mapping rather than comparing auth.uid() to "userId"
-- directly. See lib/auth/identity.ts for why the two ids differ.
-- ---------------------------------------------------------------------------

create or replace function public.app_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public."User" where "supabaseUserId" = auth.uid()::text
$$;

comment on function public.app_user_id() is
  'The application User.id (cuid) for the current Supabase session, or NULL.';

-- ---------------------------------------------------------------------------
-- 3. Learner-owned tables
--
-- Every table with a "userId" column: you may touch a row only if it is yours.
-- Generated rather than written out so a table added later cannot be forgotten
-- — the failure mode of hand-written policies is always the table nobody
-- remembered.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid
    where n.nspname = 'public'
      and c.relkind = 'r'
      and a.attname = 'userId'
      and not a.attisdropped
  loop
    execute format('drop policy if exists %I on public.%I', t || '_own_rows', t);
    execute format(
      'create policy %I on public.%I
         for all
         to authenticated
         using ("userId" = public.app_user_id())
         with check ("userId" = public.app_user_id())',
      t || '_own_rows', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. The User row itself
--
-- Keyed by "id", not "userId", so it needs its own policy. Read and update
-- only: creating and deleting accounts is the application's job, through the
-- service role.
-- ---------------------------------------------------------------------------

drop policy if exists "User_self_select" on public."User";
create policy "User_self_select" on public."User"
  for select to authenticated
  using ("supabaseUserId" = auth.uid()::text);

drop policy if exists "User_self_update" on public."User";
create policy "User_self_update" on public."User"
  for update to authenticated
  using ("supabaseUserId" = auth.uid()::text)
  with check ("supabaseUserId" = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 5. Shared content
--
-- Curriculum content belongs to nobody and is the same for every learner.
-- Readable by any signed-in user; writable only by the service role, which
-- bypasses RLS anyway.
--
-- "ReadingExplanation" is here rather than in section 3 on purpose: an
-- explanation is a fact about a sentence, not about a learner, so it is cached
-- once and shared. It has no "userId" column for exactly that reason.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'Module', 'Tier', 'Construct', 'Item', 'ItemConstruct', 'VocabItem',
    'ReadingExplanation'
  ]
  loop
    if to_regclass('public.' || quote_ident(t)) is not null then
      execute format('drop policy if exists %I on public.%I', t || '_read', t);
      execute format(
        'create policy %I on public.%I for select to authenticated using (true)',
        t || '_read', t
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Never reachable with a user token
--
-- User, Account, Session and VerificationToken hold credentials and session
-- tokens. RLS is on and — apart from the two self-scoped policies in §4 — no
-- policy is created, so a learner's own token can reach none of them. The
-- sign-in path reads them through the service role instead, which is correct:
-- there is no session yet at that point for a policy to check.
--
-- Stated explicitly because "no policy" looks like an oversight otherwise.
-- ---------------------------------------------------------------------------

-- (intentionally empty)

-- ---------------------------------------------------------------------------
-- 7. Storage
--
-- Report cards live in a private bucket and are read back only through
-- app/api/reports/[id]/file, which checks the row belongs to the caller and
-- then downloads with the service role. No storage policy grants a user token
-- direct access, so an object key alone is not enough to fetch a document.
--
-- Create the bucket once (private), if it does not exist:
--
--   insert into storage.buckets (id, name, public)
--   values ('"'"'report-cards'"'"', '"'"'report-cards'"'"', false)
--   on conflict (id) do nothing;
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 8. Check what you ended up with
-- ---------------------------------------------------------------------------

-- select tablename,
--        rowsecurity as rls_enabled,
--        (select count(*) from pg_policies p
--          where p.schemaname = 'public' and p.tablename = t.tablename) as policies
--   from pg_tables t
--  where schemaname = 'public' and tablename not like '\_prisma%'
--  order by tablename;
