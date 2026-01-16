# Brandenburg Plumbing - Deployment Guide

## Environment Variables Required

Before deploying to production, ensure the following environment variables are configured in your hosting platform:

### Email Service (Resend)
```bash
RESEND_API_KEY=your_resend_api_key_here
```
- Used for contact form and careers application emails
- Get from: https://resend.com/api-keys
- Ensure domain `brandenburgplumbing.com` is verified in Resend

### Google Reviews Integration (Optional)
```bash
GOOGLE_PLACES_API_KEY=your_google_api_key_here
GOOGLE_PLACE_ID=your_google_place_id_here
```
- Used to fetch live Google reviews
- Get API key from: https://console.cloud.google.com/
- Site works without these (gracefully degrades), but reviews improve credibility

**IMPORTANT**: The Google Places API key must be configured to allow:
- Server-side requests (no HTTP referrer restriction), OR
- Use IP restrictions instead of HTTP referrer restrictions

Currently the API key is restricted to HTTP referrers which blocks server-side builds.

## DNS Configuration

Point your domain to your hosting provider:
- **Primary**: `brandenburgplumbing.com` → hosting provider
- **WWW**: `www.brandenburgplumbing.com` → hosting provider
- **SSL**: Ensure SSL certificate is configured (automatic on Vercel/Netlify)

## Third-Party Services Already Configured

These are already integrated in the codebase:
- **Google Tag Manager**: GTM-TMTM3S3
- **ServiceTitan DNI**: Account 1709012758
- **ServiceTitan Scheduler**: sched_iznsrydnu074jzax2stfqht5
- **AnyTrack**: Tracking code present
- **Font Awesome**: Kit 9598769622
- **Adobe Fonts**: Freight Text Pro & Neue Haas Grotesk

## Google Search Console

After deploying, add your verification meta tag:

1. Go to https://search.google.com/search-console
2. Add property for `brandenburgplumbing.com`
3. Get verification code
4. Add it to `app/layout.tsx` at line 57:

```typescript
verification: {
  google: 'your-verification-code-here',
},
```

## Pre-Launch Testing Checklist

### Forms
- [ ] Test contact form submission at `/contact`
- [ ] Verify emails arrive at `service@brandenburgplumbing.com`
- [ ] Test careers form at `/careers`
- [ ] Test ServiceTitan scheduler booking button (all pages)

### Analytics & Tracking
- [ ] Verify Google Tag Manager fires
- [ ] Test ServiceTitan phone number insertion
- [ ] Check AnyTrack events

### Mobile
- [ ] Test responsive layouts on phone/tablet
- [ ] Verify mobile phone CTA button works
- [ ] Check navigation menu on mobile

### SEO
- [ ] Submit sitemap to Google Search Console: `https://brandenburgplumbing.com/sitemap.xml`
- [ ] Verify robots.txt: `https://brandenburgplumbing.com/robots.txt`
- [ ] Check all meta descriptions and Open Graph tags

### Performance
- [ ] Run Lighthouse audit
- [ ] Test page load speeds
- [ ] Verify images load correctly

## Build Command

```bash
npm run build
```

The build generates **71 static pages** for optimal performance.

## Deployment Platforms

### Recommended: Vercel (Optimized for Next.js)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push to main

### Alternative: Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Configure environment variables

## Post-Launch

1. Monitor email deliverability (Resend dashboard)
2. Check Google Analytics/Tag Manager for traffic
3. Verify all forms are working
4. Monitor ServiceTitan for bookings
5. Consider adding Google Search Console verification
6. Remove `/migration-assets` folder after confirming site is stable

## Support

For technical issues or questions about this deployment, refer to:
- Next.js docs: https://nextjs.org/docs
- Resend docs: https://resend.com/docs
- Vercel deployment: https://vercel.com/docs
