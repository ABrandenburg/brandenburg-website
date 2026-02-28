# AGENTS.md

## Cursor Cloud specific instructions

Use this file as the default operating guide for coding agents in this repo.

### Codebase overview

This repository contains one Next.js application:

| App | Path | Framework | Port | Notes |
|-----|------|-----------|------|-------|
| **Brandenburg Plumbing** | `/workspace` | Next.js 15.5 | 3000 | Production site with static pages, admin dashboard, and API routes |

Package manager: `npm`.

### Quick agent workflow

1. Identify the affected route/component/API area.
2. Run commands from `/workspace`.
3. Make minimal, scoped edits.
4. Run high-signal validation for the change (usually lint + targeted manual/terminal verification).
5. Summarize what changed, what was tested, and any known limitations.

### Running the applications

#### Main app (`/workspace`)
- Dev server: `npm run dev` (clears `.next/cache` first, then starts Next.js)
- Lint: `npm run lint`
- Production build: `npm run build`
- Production start: `npm run start`

### Testing expectations

- There is currently no automated unit/integration test suite.
- For non-trivial code changes, run at least linting.
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
