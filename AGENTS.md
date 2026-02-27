## Cursor Cloud specific instructions

### Overview

This repository contains two Next.js applications:

1. **Brandenburg Plumbing Website** (root `/`) — Next.js 15.5, the main business site with 71+ static pages, admin dashboard, and API routes.
2. **Local News Engine** (`/local-news-engine/`) — Next.js 16.1.4, a separate newsletter/news platform.

Both use `npm` as the package manager (`package-lock.json` present).

### Running the applications

| App | Dev command | Port | Notes |
|---|---|---|---|
| Main site | `npm run dev` (from root) | 3000 | Clears `.next/cache` before starting |
| Local News Engine | `npm run dev` (from `local-news-engine/`) | 3001 (use `--port 3001`) | Has a pre-existing middleware compilation warning for missing `lib/supabase/middleware.ts`; pages still serve |

### Lint / Build / Test

- **Main site lint**: `npm run lint` (root) — uses `next lint` with ESLint 8 + `next/core-web-vitals`
- **Local News Engine lint**: `npm run lint` (from `local-news-engine/`) — uses ESLint 9
- **Main site build**: `npm run build` (root) — generates ~100 static + dynamic pages
- No automated test suite exists in either project.

### Environment variables

A `.env.local` file is needed at the root for the main site. See `.env.example` for the full list. The minimum for the dev server to start and serve static pages:

- `DATABASE_URL` — can be a placeholder; only needed when DB code runs
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required by Supabase client libs (placeholder OK for static pages)
- `RESEND_API_KEY` — required for contact/career form submission API routes
- `CRON_SECRET` — required for cron endpoint auth

All external integrations (ServiceTitan, Google Ads, Twilio, etc.) degrade gracefully or operate in demo mode when credentials are absent.

### Gotchas

- The main site `npm run dev` script runs `rm -rf .next/cache` before `next dev`, so first compilation takes longer than usual.
- The Local News Engine references a `middleware.ts` importing `@/lib/supabase/middleware` which does not exist in that sub-project; this is a pre-existing issue. The app still compiles and serves pages despite the error.
- The main site uses Next.js 15.5 while Local News Engine uses Next.js 16.1.4 — they have separate `node_modules` and separate lockfiles.
