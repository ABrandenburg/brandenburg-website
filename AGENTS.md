# AGENTS.md

## Cursor Cloud specific instructions

Use this file as the default operating guide for coding agents in this repo.

### Codebase overview

This monorepo contains two separate Next.js applications:

| App | Path | Framework | Port | Notes |
|-----|------|-----------|------|-------|
| **Brandenburg Plumbing** (main) | `/workspace` | Next.js 15.5 | 3000 | Primary production site; includes admin dashboard and API routes |
| **Local News Engine** | `/workspace/local-news-engine` | Next.js 16.1 | 3001 (`--port 3001`) | Scaffolded app with a known Turbopack workspace-root issue |

Both apps use `npm` and maintain separate `package-lock.json` and `node_modules` trees.

### Quick agent workflow

1. Determine which app is affected (`/workspace` or `/workspace/local-news-engine`).
2. Run commands from the correct working directory.
3. Make minimal, scoped edits.
4. Run high-signal validation for the change (usually lint + targeted manual/terminal verification).
5. Summarize what changed, what was tested, and any known limitations.

### Running the applications

#### Main app (`/workspace`)
- Dev server: `npm run dev` (clears `.next/cache` first, then starts Next.js)
- Lint: `npm run lint`
- Production build: `npm run build`

#### Local News Engine (`/workspace/local-news-engine`)
- Dev server: `npm run dev -- --port 3001`
- Lint: `npm run lint`
- Production build: `npm run build`

### Testing expectations

- There is currently no automated unit/integration test suite in either app.
- For non-trivial code changes, run at least linting for the affected app.
- For UI changes, also validate manually in the browser for the affected route(s).
- For API/backend logic changes, run lint and exercise the changed path(s) via browser/terminal.
- For docs-only changes, basic file verification is sufficient.

### Environment variables

A root `.env.local` file is expected (copy from `.env.example` if needed). Minimum values to boot the main app and serve static pages:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (placeholder values are acceptable for local boot)
- `DATABASE_URL` (placeholder acceptable unless DB code is executed)
- `RESEND_API_KEY` (required for contact/career form submissions)
- `CRON_SECRET` (required by cron endpoint auth)

Integrations such as ServiceTitan, Google Ads, and Twilio degrade gracefully or fall back to demo behavior when credentials are absent. Admin routes under `/admin/*` require valid Supabase credentials.

### Known gotchas

- Main app `npm run dev` removes `.next/cache`, so first compile is slower (~8-10 seconds).
- Local News Engine has a pre-existing Next.js 16 Turbopack issue: workspace-root inference can incorrectly include root `middleware.ts`, which imports `@/lib/supabase/middleware` unavailable in the sub-app.
- Pages in Local News Engine may still render despite that middleware error.
- Potential fix for Local News Engine: set `turbopack.root` in `local-news-engine/next.config.ts`.
