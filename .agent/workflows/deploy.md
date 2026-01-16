---
description: Deploy Brandenburg Plumbing website to Vercel
---

# Deploy to Vercel

This workflow will deploy the Brandenburg Plumbing website to Vercel and configure it for brandenburgplumbing.com.

## Prerequisites

Before starting, ensure you have:
- A Vercel account (sign up at https://vercel.com)
- Access to your domain DNS settings
- All environment variables ready (they're in `.env.local`)

## Steps

### 1. Commit and Push Current Changes

First, we need to commit all pending changes and push them to GitHub:

```bash
git add .
git commit -m "Pre-deployment: Latest website updates"
git push origin main
```

### 2. Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### 3. Deploy to Vercel

You have two options:

#### Option A: Deploy via Vercel Dashboard (Recommended for first-time)
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository: `ABrandenburg/brandenburg-website`
4. Configure project settings:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Option B: Deploy via CLI
```bash
vercel
```
Follow the prompts to link your project.

### 4. Configure Environment Variables in Vercel

In the Vercel dashboard for your project, go to **Settings > Environment Variables** and add:

- `RESEND_API_KEY` = `re_GogFhKaR_HeM89Z2WPXXdmYhYSeFnt1MC`
- `GOOGLE_PLACES_API_KEY` = `AIzaSyBTg4MEjc-T8LWa1bn02v_o_ZwgI8CsAwc`
- `GOOGLE_PLACE_ID` = `ChIJW8IGEJXmWoYRCUcEeYYxSXg`

> **Important**: Add these for **Production**, **Preview**, and **Development** environments.

### 5. Configure Custom Domain in Vercel

1. In your Vercel project dashboard, go to **Settings > Domains**
2. Add your custom domain: `brandenburgplumbing.com`
3. Also add: `www.brandenburgplumbing.com`
4. Vercel will provide DNS configuration instructions

### 6. Update DNS Settings

In your domain registrar (GoDaddy, Namecheap, etc.), update DNS records as instructed by Vercel:

**Typical configuration:**
- `A Record` for `@` (root domain) → Points to Vercel's IP: `76.76.21.21`
- `CNAME Record` for `www` → Points to `cname.vercel-dns.com`

**Or if using nameservers:**
- Update nameservers to Vercel's (they'll provide these)

> **Note**: DNS propagation can take 24-48 hours, but often completes within minutes.

### 7. Verify Deployment

Once deployed:
1. Visit your Vercel deployment URL (e.g., `brandenburg-website.vercel.app`)
2. Test all forms and functionality
3. Check that the ServiceTitan scheduler works
4. Verify emails are being sent via Resend

### 8. Post-Launch Tasks

After the site is live on brandenburgplumbing.com:

- [ ] Add Google Search Console verification code to `app/layout.tsx`
- [ ] Submit sitemap: `https://brandenburgplumbing.com/sitemap.xml`
- [ ] Monitor Resend dashboard for email deliverability
- [ ] Check Google Tag Manager is firing correctly
- [ ] Test on mobile devices
- [ ] Run Lighthouse performance audit

## Automatic Deployments

Once connected, Vercel will automatically:
- Deploy every push to `main` branch to production
- Create preview deployments for pull requests
- Provide deployment previews for testing

## Troubleshooting

**Build fails:**
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Try running `npm run build` locally first

**Domain not working:**
- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Check SSL certificate is active in Vercel

**Forms not working:**
- Verify `RESEND_API_KEY` is set in Vercel environment variables
- Check that `brandenburgplumbing.com` is verified in Resend dashboard

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Support: https://vercel.com/support
