# AGENTS.md

## Cursor Cloud specific instructions

### Codebase overview

This is a monorepo with two Next.js apps:

| App | Path | Framework | Port | Status |
|-----|------|-----------|------|--------|
| **Brandenburg Plumbing** (main) | `/workspace` | Next.js 15.5 | 3000 | Fully functional |
| **Local News Engine** | `/workspace/local-news-engine` | Next.js 16.1 | 3000 | Scaffolded; has pre-existing Turbopack workspace root issue (see below) |

### Running the main app

- **Dev server**: `npm run dev` (clears `.next/cache` first)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- `.env.local` is required at the project root. Copy from `.env.example`. At minimum, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (even placeholder values) — the middleware uses these on every request.
- The ServiceTitan discount calculator falls back to demo mode when credentials are absent.

### Running local-news-engine

- This sub-app has a **pre-existing build/dev issue**: Next.js 16 Turbopack infers the workspace root from the parent `package-lock.json`, causing it to pick up the root `middleware.ts` which references `@/lib/supabase/middleware` — a file that doesn't exist in the sub-app. Both `npm run build` and `npm run dev` produce module-not-found errors for this reason.
- The fix would be to add `turbopack.root` to `local-news-engine/next.config.ts`, but this is a pre-existing repo issue.

### Key gotchas

- The main app's `npm run dev` script runs `rm -rf .next/cache && next dev`, so cold starts take ~8-10 seconds for first compilation.
- Supabase environment variables are required even for public pages because the middleware (`middleware.ts`) creates a Supabase client on every matched request. Placeholder values (e.g. `https://placeholder.supabase.co`) are sufficient to start the dev server; actual Supabase calls will fail gracefully.
- Admin features (`/admin/*`) require real Supabase credentials and Google OAuth configuration.
- Forms (`/contact`, `/careers`) require a valid `RESEND_API_KEY` to actually send emails.
- Standard npm scripts are documented in `package.json`; see also `README.md` and `QUICK_START.md`.
