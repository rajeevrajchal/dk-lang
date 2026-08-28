# Feature: Authentication

## Purpose
Identify who's using the app, using Supabase Auth exclusively, with
invite-only access (no self-serve sign-up) and a dev-only shortcut for local
testing.

## User Story
As an enrolled learner, I sign in with my Google account and land on my
dashboard without creating a new password or account.

## User Flow
1. Visit any `(app)` route while signed out → redirected to `/login`.
2. Click "Sign in with Google" → Supabase OAuth flow → `auth/callback`.
3. Session cookie set → redirected to the originally-requested route (or
   `/dashboard` if none).
4. In dev only: a "Test login" button calls a dev-only endpoint that
   signs in as a fixed seeded account, bypassing Google entirely.

## UI Responsibilities
- `(auth)/login/+page.svelte`: Google sign-in button; renders a mapped,
  closed-vocabulary error message if `?error=` is present (never the raw
  Supabase error string).
- Dev-only test-login button, rendered only when a server-provided
  `isDev` flag (computed in `load`, never a client-side `import.meta.env`
  check alone) is true.

## Server Responsibilities
- `hooks.server.ts`: resolve the Supabase session on every request via
  `supabase.auth.getUser()` (revalidates with Supabase, never trusts the
  cookie value directly), attach `locals.user` / `locals.supabase`.
- `(app)/+layout.server.ts`: redirect to `/login?callbackUrl=...` if no
  session.
- `(auth)/auth/callback/+server.ts`: completes the OAuth code exchange.
- `api/dev/test-login` (or SvelteKit equivalent route): creates/finds the
  fixed `dev-test@dklang.local` account via the admin client; 404s if
  `NODE_ENV === 'production'`.

## Database Entities
`auth.users` (Supabase-managed), `profiles` (1:1, created by a signup
trigger — see `docs/database/schema.md`).

## Data Flow
See [docs/architecture/auth-flow.md](../architecture/auth-flow.md).

## API / Server Actions
- `auth/callback` — `+server.ts` (OAuth code exchange, a genuine exception
  to "no API routes" since it's a redirect target from Google, not an
  app-internal call).
- `api/dev/test-login` — `+server.ts`, dev-only.
- No form action needed for Google sign-in itself (it's a redirect, not a
  form submission); logout is a tiny form action calling
  `supabase.auth.signOut()`.

## AI Usage
None.

## State Management
None beyond `event.locals`, set once per request in `hooks.server.ts`. No
client-side auth store.

## Validation
N/A for OAuth (Supabase validates the token exchange). The dev-login route
validates nothing from the client — it takes no input.

## Error Handling
Supabase Auth errors mapped to a closed `AuthErrorCode` union before
reaching the UI (ported from the old app's `lib/auth/errors.ts` pattern) —
prevents an open `?error=` param from rendering arbitrary text.

## Permissions
Everything behind `(app)` requires a session. The dev-login route requires
`NODE_ENV !== 'production'`, checked independently in both the route handler
and the layout guard that would expose its button.

## Metrics
None — authentication has no dashboard-visible metric.

## Dependencies
None (this is the root of the feature dependency graph).

## Feature Graph
`Auth → Profile → Onboarding → Dashboard` — see
[feature-dependencies.md](../architecture/feature-dependencies.md).

## Implementation Steps
1. Supabase project: enable Google OAuth provider.
2. `hooks.server.ts` session resolution.
3. `(auth)/login` page + Google button.
4. `auth/callback` handler.
5. `(app)/+layout.server.ts` guard.
6. Dev test-login route + button, double-gated.
7. Error-code mapping.
8. Tests.

## Testing Strategy
- Session resolution with/without a valid cookie.
- Redirect behavior for unauthenticated access to an `(app)` route.
- Dev-login route returns 404 when `NODE_ENV=production` is simulated.
- Error-code mapping covers every Supabase error this app can actually
  trigger (invalid credentials, rate limited, etc. — even though
  password auth itself may be disabled, the mapping table should still be
  correct for OAuth failure modes).

## Future Improvements
- Re-enable password auth behind the existing kill switch if the product
  ever needs it again (the old app already has this pattern — see the audit
  notes on `passwordAuthEnabled()`).
