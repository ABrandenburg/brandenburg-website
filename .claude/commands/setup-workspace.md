# Setup Workspace

Spin up this project on a new device. Run through each step sequentially, stopping if any step fails.

## Steps

1. **Check prerequisites** — Verify the following are installed and available on PATH. If any are missing, list what's needed and stop:
   - `git`
   - `node` (v18+)
   - `npm`
   - `vercel` CLI (`npm i -g vercel` if missing)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Link to Vercel** — Check if already linked (`.vercel/project.json` exists). If not:
   ```bash
   vercel link
   ```
   The user may need to authenticate with `vercel login` first — prompt them if the link fails due to auth.

4. **Pull environment variables** from Vercel:
   ```bash
   vercel env pull .env.local
   ```
   This writes all Development environment secrets to `.env.local`.

5. **Verify setup** — Run a quick sanity check:
   ```bash
   npx tsc --noEmit
   ```

6. **Report results** — Summarize what was done:
   - Dependencies installed
   - Vercel project linked
   - Environment variables pulled (note: do NOT print secret values)
   - Type check pass/fail
   - Remind the user they can start the dev server with `npm run dev`
