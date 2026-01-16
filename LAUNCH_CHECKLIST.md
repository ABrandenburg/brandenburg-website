# 🚀 Pre-Launch Checklist - Brandenburg Plumbing Website

Use this checklist to ensure everything is ready before going live.

---

## ✅ Pre-Deployment (Complete These First)

### Environment Variables Setup
- [ ] **RESEND_API_KEY** configured in hosting platform (CRITICAL - forms won't work without this)
- [ ] Resend domain `brandenburgplumbing.com` verified at https://resend.com/domains
- [ ] Sender addresses configured: `no-reply@brandenburgplumbing.com` and `service@brandenburgplumbing.com`
- [ ] (Optional) **GOOGLE_PLACES_API_KEY** and **GOOGLE_PLACE_ID** for live reviews

### DNS & Hosting
- [ ] DNS A/CNAME records point to hosting provider
- [ ] www subdomain configured
- [ ] SSL certificate active (should be automatic)

### Repository
- [ ] Latest code pushed to GitHub/Git
- [ ] .env.local exists locally (NOT in git)
- [ ] Build passes locally: `npm run build`

---

## 🔧 Deployment Day

### Deploy to Production
- [ ] Connect repository to Vercel/Netlify
- [ ] Configure environment variables in platform
- [ ] Deploy main/master branch
- [ ] Verify deployment URL loads

### Initial Testing
- [ ] Homepage loads correctly
- [ ] Navigation works across all sections
- [ ] Images display properly
- [ ] Mobile responsive layout works
- [ ] SSL certificate shows as secure

---

## 🧪 Post-Launch Testing (First 30 Minutes)

### Forms Testing
- [ ] Contact form at `/contact` displays
- [ ] Submit test contact form
- [ ] Verify email arrives at `service@brandenburgplumbing.com`
- [ ] Careers form at `/careers` displays
- [ ] Submit test careers application
- [ ] Verify email arrives
- [ ] Test "Book Now" buttons open ServiceTitan scheduler
- [ ] Complete test booking through scheduler

### Navigation & Links
- [ ] Test main navigation menu
- [ ] Test footer links
- [ ] Click through to all service pages
- [ ] Click through to all location pages
- [ ] Test blog post links
- [ ] Verify phone numbers are clickable (mobile)
- [ ] Test back-to-top button

### Mobile Testing
- [ ] Open on phone (iOS)
- [ ] Open on phone (Android)
- [ ] Test on tablet
- [ ] Verify mobile phone CTA button
- [ ] Test mobile menu
- [ ] Submit form on mobile

### Analytics Verification
- [ ] Open Google Tag Manager debug mode
- [ ] Verify GTM container loads (GTM-TMTM3S3)
- [ ] Check ServiceTitan phone insertion works
- [ ] Verify AnyTrack fires

---

## 📊 Post-Launch Setup (First 48 Hours)

### Google Search Console
- [ ] Go to https://search.google.com/search-console
- [ ] Add property for `brandenburgplumbing.com`
- [ ] Get HTML meta tag verification code
- [ ] Add code to `app/layout.tsx` (lines 55-60)
- [ ] Redeploy site
- [ ] Verify ownership in GSC
- [ ] Submit sitemap: `https://brandenburgplumbing.com/sitemap.xml`
- [ ] Submit URL inspection for homepage

### Monitoring
- [ ] Check Resend dashboard for email deliverability
- [ ] Monitor Google Analytics for traffic (via GTM)
- [ ] Check ServiceTitan for bookings
- [ ] Review any error logs in hosting platform
- [ ] Test from different devices/browsers

### Performance Testing
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test page load speed on 3G connection
- [ ] Verify all images load (check Network tab)
- [ ] Test Core Web Vitals

---

## 🔍 SEO & Marketing (First Week)

### Search Engines
- [ ] Submit to Bing Webmaster Tools
- [ ] Verify robots.txt accessible: `/robots.txt`
- [ ] Verify sitemap accessible: `/sitemap.xml`
- [ ] Check Google for old pages (monitor redirects)

### Social Media
- [ ] Share on Facebook (verify Open Graph preview)
- [ ] Update Facebook page link
- [ ] Test share preview on Twitter/X
- [ ] Update any business directory listings

### Local SEO
- [ ] Verify Google Business Profile link works
- [ ] Update website URL in Google Business Profile
- [ ] Check NAP consistency (Name, Address, Phone)
- [ ] Monitor for first Google crawl

---

## 🛠️ Optional Improvements (After Launch Stable)

### Google Reviews API Fix
- [ ] Review options in `GOOGLE_API_FIX.md`
- [ ] Choose implementation approach
- [ ] Configure API key properly
- [ ] Test reviews display
- [ ] Redeploy

### Cleanup
- [ ] After 2 weeks of stable operation, delete `/migration-assets` folder
- [ ] Review any console warnings
- [ ] Check for 404 errors in logs

### Additional Features
- [ ] Consider adding more social media links
- [ ] Review meta descriptions for all pages
- [ ] Consider adding FAQ schema markup
- [ ] Plan content calendar for blog

---

## 🚨 Critical Issues to Watch

### If Contact Forms Don't Work
1. Check RESEND_API_KEY is set correctly
2. Verify domain is verified in Resend
3. Check Resend dashboard for errors
4. Review browser console for errors

### If Scheduler Doesn't Open
1. Verify ServiceTitan scheduler ID: `sched_iznsrydnu074jzax2stfqht5`
2. Check browser console for JavaScript errors
3. Contact ServiceTitan support if needed

### If Pages Don't Load
1. Check DNS propagation (can take 24-48 hours)
2. Clear browser cache
3. Test in incognito mode
4. Check hosting platform status

---

## 📞 Emergency Contacts

- **Hosting Issues**: Vercel/Netlify support
- **Email Issues**: Resend support (support@resend.com)
- **ServiceTitan**: Your account representative
- **DNS/Domain**: Your domain registrar support

---

## ✨ Launch Complete Criteria

Your site is considered successfully launched when:
- [x] All environment variables configured
- [x] Site deployed and accessible via domain
- [x] SSL certificate active
- [x] Forms tested and working
- [x] ServiceTitan scheduler tested
- [x] Analytics firing
- [x] Mobile responsive confirmed
- [x] No critical errors in logs
- [x] Google Search Console verified
- [x] Sitemap submitted

---

**Current Status**: All code complete and tested ✅  
**Next Step**: Deploy to production and work through this checklist

**Estimated Time**: 2-3 hours for complete launch process

---

## 📚 Reference Documents

- `README.md` - Launch readiness summary
- `DEPLOYMENT.md` - Detailed deployment guide
- `GOOGLE_API_FIX.md` - Google Places API solutions
- `migration-assets/README.md` - Cleanup instructions
