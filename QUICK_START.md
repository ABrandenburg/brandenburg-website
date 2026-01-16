# Quick Start - Deploy in 10 Minutes

This is the absolute minimum you need to launch the Brandenburg Plumbing website.

---

## Step 1: Get Your Resend API Key (2 minutes)

1. Go to https://resend.com/api-keys
2. Create new API key (or copy existing)
3. Copy the key (starts with `re_`)

---

## Step 2: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Add environment variable:
   - Name: `RESEND_API_KEY`
   - Value: (paste your key from Step 1)
5. Click "Deploy"

---

## Step 3: Configure Your Domain (3 minutes)

1. In Vercel project settings, go to "Domains"
2. Add `brandenburgplumbing.com`
3. Follow DNS instructions from Vercel
4. Add both:
   - `brandenburgplumbing.com`
   - `www.brandenburgplumbing.com`

---

## Step 4: Verify Email Domain (2 minutes)

1. Go to https://resend.com/domains
2. Add `brandenburgplumbing.com`
3. Add DNS records shown by Resend
4. Wait for verification (usually < 5 minutes)

---

## Step 5: Test (1 minute)

1. Visit your new site
2. Fill out contact form at `/contact`
3. Check `service@brandenburgplumbing.com` for email
4. ✅ You're live!

---

## That's It!

Your site is now live with:
- ✅ All 71 pages working
- ✅ Contact forms functional
- ✅ Career applications working
- ✅ ServiceTitan scheduler
- ✅ Mobile responsive
- ✅ SSL secure
- ✅ SEO optimized

---

## Optional (Do Later)

### Add Google Reviews (Optional)
See `GOOGLE_API_FIX.md` for instructions. Site works great without it.

### Add Google Search Console (Recommended)
1. Go to https://search.google.com/search-console
2. Add your domain
3. Get verification code
4. Add to `app/layout.tsx` line 58
5. Redeploy

### Full Checklist
See `LAUNCH_CHECKLIST.md` for comprehensive testing.

---

## Need Help?

- **Forms not working?** Check RESEND_API_KEY is set
- **Domain not loading?** DNS can take 24-48 hours
- **Questions?** See `DEPLOYMENT.md` for detailed guide

---

**Total time: ~10 minutes** (plus DNS propagation wait)

🚀 **Ready to launch!**
