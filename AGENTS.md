# AGENTS.md

## Cursor Cloud specific instructions

### Codebase overview

This is a monorepo with two Next.js apps:

| App | Path | Framework | Port | Notes |
|-----|------|-----------|------|-------|
| **Brandenburg Plumbing** (main) | `/workspace` | Next.js 15.5 | 3000 | Fully functional; 71+ static pages, admin dashboard, API routes |
| **Local News Engine** | `/workspace/local-news-engine` | Next.js 16.1 | 3001 (use `--port 3001`) | Scaffolded; has pre-existing middleware issue (see Gotchas) |

Both use `npm` as the package manager (`package-lock.json` present).

### Running the applications

- **Main site dev**: `npm run dev` (from root) — clears `.next/cache` before starting
- **Main site lint**: `npm run lint` (root) — uses `next lint` with ESLint 8 + `next/core-web-vitals`
- **Main site build**: `npm run build` (root) — generates ~100 static + dynamic pages
- **Local News Engine dev**: `npm run dev` (from `local-news-engine/`) — use `--port 3001` to avoid port conflict
- **Local News Engine lint**: `npm run lint` (from `local-news-engine/`) — uses ESLint 9
- No automated test suite exists in either project.
- Standard npm scripts are documented in `package.json`; see also `README.md` and `QUICK_START.md`.

### Environment variables

A `.env.local` file is required at the project root. Copy from `.env.example`. The minimum for the dev server to start and serve static pages:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required by middleware on every request; placeholder values (e.g. `https://placeholder.supabase.co`) are sufficient to start the dev server
- `DATABASE_URL` — can be a placeholder; only needed when DB code runs
- `RESEND_API_KEY` — required for contact/career form submission API routes
- `CRON_SECRET` — required for cron endpoint auth

All external integrations (ServiceTitan, Google Ads, Twilio, etc.) degrade gracefully or operate in demo mode when credentials are absent. The ServiceTitan discount calculator falls back to demo mode. Admin features (`/admin/*`) require real Supabase credentials.

### Gotchas

- The main app's `npm run dev` script runs `rm -rf .next/cache && next dev`, so first compilation takes ~8-10 seconds.
- The Local News Engine has a **pre-existing build/dev issue**: Next.js 16 Turbopack infers the workspace root from the parent `package-lock.json`, causing it to pick up the root `middleware.ts` which references `@/lib/supabase/middleware` — a file that doesn't exist in the sub-app. Pages still serve despite the error. The fix would be to add `turbopack.root` to `local-news-engine/next.config.ts`.
- The main site uses Next.js 15.5 while Local News Engine uses Next.js 16.1 — they have separate `node_modules` and separate lockfiles.
