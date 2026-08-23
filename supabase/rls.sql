-- Row Level Security for the Danish learning app.
--
-- READ THIS BEFORE RELYING ON IT.
--
-- The application talks to PostgreSQL through Prisma, which connects as the
-- table owner. Owners bypass RLS, so THESE POLICIES DO NOT CONSTRAIN THE
-- APPLICATION'S OWN QUERIES. The control that actually enforces "you only see
-- your own rows" is the `userId` scoping in lib/repositories/*.
--
-- So what are these for? Containment. Supabase exposes every table over
-- PostgREST to anyone holding the publishable key, which by design ships to
-- the browser. Without RLS, that key would be a read/write handle on every
-- learner's data. With it, the key can reach nothing at all unless a policy
-- allows it.
--
-- In other words: this file is what makes it safe that a Supabase key is
-- public, not what makes the app's own queries safe.
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
    -- FORCE makes the policies apply to the table owner too. Deliberately NOT
    -- set: Prisma connects as the owner and would be locked out of its own
    -- database. Flipping this on is the first step if the app ever moves to
    -- connecting as a restricted role.
    -- execute format('alter table public.%I force row level security', t);
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
-- 6. Never reachable from the browser
--
-- Account, Session and VerificationToken hold credentials and session tokens.
-- RLS is on and no policy is created, so PostgREST can reach none of them.
-- Stated explicitly because "no policy" looks like an oversight otherwise.
-- ---------------------------------------------------------------------------

-- (intentionally empty)

-- ---------------------------------------------------------------------------
-- 7. Check what you ended up with
-- ---------------------------------------------------------------------------

-- select tablename,
--        rowsecurity as rls_enabled,
--        (select count(*) from pg_policies p
--          where p.schemaname = 'public' and p.tablename = t.tablename) as policies
--   from pg_tables t
--  where schemaname = 'public' and tablename not like '\_prisma%'
--  order by tablename;
