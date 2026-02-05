# Ad Spend Sync Setup Guide

This guide explains how to configure the automated ad spend sync for Google Ads and Meta (Facebook) Ads.

## Overview

The ad spend sync system:
- ✅ Runs daily at 2 AM via Vercel cron
- ✅ Fetches yesterday's ad spend data automatically
- ✅ Includes retry logic with exponential backoff
- ✅ Syncs to `raw_ad_spend` table in Supabase
- ✅ Works with either or both platforms (configure what you need)

## Cost Comparison

**Custom Cron (What You Have Now):**
- Cost: $0/month (runs on your existing Vercel infrastructure)
- Setup time: ~30 minutes per platform
- Maintenance: Minimal (APIs are stable)

**Portable/Airbyte:**
- Cost: $200-400/month
- Setup time: 10 minutes
- Maintenance: Zero

---

## Google Ads Setup

### 1. Enable Google Ads API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Ads API" in APIs & Services
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Application type: **Web application**
6. Add authorized redirect URI: `http://localhost`

You'll get:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxxx`

### 2. Get Developer Token

1. Go to [Google Ads](https://ads.google.com/)
2. Tools & Settings → API Center
3. Apply for developer token
   - **Note**: For testing, you can use a test account immediately
   - For production, approval takes 1-2 business days

You'll get:
- **Developer Token**: `xxxxxxxxxx`

### 3. Get Refresh Token

This is the tricky part. You need to do a one-time OAuth flow to get a refresh token.

**Option A: Use Google's OAuth Playground**

1. Go to [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Click gear icon → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In "Step 1", find "Google Ads API v18" → Select `https://www.googleapis.com/auth/adwords`
5. Click "Authorize APIs" → Sign in with your Google Ads account
6. In "Step 2", click "Exchange authorization code for tokens"
7. Copy the **Refresh Token**

**Option B: Use google-ads-api CLI**

```bash
npx google-ads-api generate-refresh-token \
  --client-id=YOUR_CLIENT_ID \
  --client-secret=YOUR_CLIENT_SECRET
```

Follow the prompts to get your refresh token.

### 4. Get Customer ID

1. Go to [Google Ads](https://ads.google.com/)
2. Look at the top right corner
3. Customer ID is displayed as `XXX-XXX-XXXX`
4. Remove the dashes: Use `XXXXXXXXXX`

### 5. Add to Environment Variables

```bash
GOOGLE_ADS_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxxxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxx
GOOGLE_ADS_REFRESH_TOKEN=xxxxx
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

---

## Meta (Facebook) Ads Setup

### 1. Create Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. My Apps → Create App
3. App Type: **Business**
4. Add "Marketing API" product

### 2. Get Access Token

**For Testing (60 days):**

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Add permissions:
   - `ads_read`
   - `ads_management`
4. Click "Generate Access Token"
5. Copy the short-lived token

**Convert to Long-Lived Token (60 days):**

```bash
curl -i -X GET "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

**For Production (Never expires):**

1. Go to Business Settings → Users → System Users
2. Create a system user
3. Assign "Admin" access to your ad account
4. Generate token with `ads_read` permission
5. **Important**: This token never expires!

### 3. Get Ad Account ID

1. Go to [Ads Manager](https://business.facebook.com/adsmanager/)
2. Look at the URL: `act=XXXXXXXXXX`
3. Use just the numbers: `XXXXXXXXXX` (without "act_")

### 4. Add to Environment Variables

```bash
META_ADS_ACCESS_TOKEN=your-long-lived-access-token
META_ADS_ACCOUNT_ID=1234567890
```

---

## Testing Locally

### Test the Sync Manually

```bash
curl -X GET "http://localhost:3004/api/cron/sync-ad-spend" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "summary": {
    "platforms": {
      "google": {
        "platform": "google",
        "success": true,
        "recordsSynced": 1
      },
      "meta": {
        "platform": "meta",
        "success": true,
        "recordsSynced": 1
      }
    },
    "totalRecordsSynced": 2,
    "successCount": 2,
    "failureCount": 0
  },
  "errors": [],
  "duration": "3.2s",
  "timestamp": "2026-01-27T..."
}
```

### Backfill Historical Data

To sync the last 30 days:

```bash
curl -X POST "http://localhost:3004/api/admin/backfill-ad-spend" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-01-01",
    "endDate": "2026-01-27",
    "platforms": ["google", "meta"]
  }'
```

### Verify Data in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Open `raw_ad_spend` table
3. You should see records with:
   - `platform`: "google" or "meta"
   - `date`: YYYY-MM-DD
   - `spend`, `impressions`, `clicks`, `conversions`

---

## Production Deployment

### 1. Add Environment Variables to Vercel

```bash
vercel env add GOOGLE_ADS_CLIENT_ID
vercel env add GOOGLE_ADS_CLIENT_SECRET
vercel env add GOOGLE_ADS_DEVELOPER_TOKEN
vercel env add GOOGLE_ADS_REFRESH_TOKEN
vercel env add GOOGLE_ADS_CUSTOMER_ID

vercel env add META_ADS_ACCESS_TOKEN
vercel env add META_ADS_ACCOUNT_ID
```

Or via Vercel Dashboard:
- Project → Settings → Environment Variables
- Add each variable for Production environment

### 2. Deploy

```bash
git add .
git commit -m "Add custom ad spend sync with Google Ads and Meta Ads

- Install google-ads-api and facebook-nodejs-business-sdk
- Create Google Ads integration with retry logic
- Create Meta Ads integration with retry logic
- Add daily cron job at 2 AM
- Add manual backfill endpoint
- Include exponential backoff and error handling

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

### 3. Verify Cron is Running

1. Go to Vercel Dashboard → Project → Cron Jobs
2. You should see 4 cron jobs:
   - `/api/cron/sync-scorecard` (hourly)
   - `/api/cron/review-requests` (hourly)
   - `/api/cron/refresh-analytics` (every 30 min)
   - `/api/cron/sync-ad-spend` (daily at 2 AM) ← **NEW**

### 4. Monitor First Run

Check logs in Vercel Dashboard after 2 AM:
- Functions → Logs → Filter by "sync-ad-spend"
- Look for successful execution with records synced

---

## Troubleshooting

### Google Ads Errors

**"DEVELOPER_TOKEN_NOT_APPROVED"**
- Your developer token is still in test mode
- You can still use it with test accounts
- For production accounts, wait for approval

**"CUSTOMER_NOT_ENABLED"**
- Customer ID is incorrect
- Make sure to use the 10-digit number without dashes

**"INVALID_CUSTOMER_ID"**
- Customer ID format is wrong
- Should be 10 digits: `1234567890`

**"PERMISSION_DENIED"**
- Your OAuth account doesn't have access to this customer
- Make sure you signed in with the correct Google account

### Meta Ads Errors

**"Invalid OAuth 2.0 Access Token"**
- Access token expired (60 days for long-lived tokens)
- Generate a new token or use system user for never-expiring token

**"Unsupported get request"**
- Ad Account ID is incorrect
- Should be just the numbers, without "act_" prefix

**"Permissions error"**
- Access token doesn't have `ads_read` permission
- Regenerate token with correct permissions

### General Debugging

**Check if platforms are configured:**
```bash
# In your code, check the logs:
console.log('Google Ads configured:', isGoogleAdsConfigured());
console.log('Meta Ads configured:', isMetaAdsConfigured());
```

**Test individual platform:**
```bash
# Edit sync-ad-spend/route.ts temporarily to only sync one platform
const [googleResult] = await Promise.all([
  syncPlatform('google', fetchYesterdayGoogleAdsData, isGoogleAdsConfigured()),
  // Comment out Meta temporarily
]);
```

**Check Supabase logs:**
- Supabase Dashboard → Logs → View recent errors

---

## Monitoring & Alerts

### Daily Verification

Add a simple check to your morning routine:

1. Visit Marketing Dashboard: `/admin/tools/marketing`
2. Check that yesterday's data is present
3. Verify spend numbers look reasonable

### Optional: Email Alerts

You can add email notifications when sync fails:

```typescript
// In sync-ad-spend/route.ts, after the sync
if (failureCount > 0) {
  await fetch('/api/admin/send-alert', {
    method: 'POST',
    body: JSON.stringify({
      subject: 'Ad Spend Sync Failed',
      errors,
    }),
  });
}
```

### Optional: Slack Alerts

Similar to email, but posts to Slack:

```bash
# Add to .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## API Rate Limits

**Google Ads:**
- 15,000 operations per day per developer token
- Daily sync uses ~10 operations
- **Plenty of headroom**

**Meta Ads:**
- 200 calls per hour per user
- Daily sync uses ~1-2 calls
- **No concerns**

---

## Cost Analysis

### Running Costs

**Infrastructure:**
- Vercel cron: Free (included in Pro plan)
- API calls: Free (under limits)
- **Total: $0/month**

**Your Time:**
- Initial setup: 30 min per platform = 1 hour
- Monthly maintenance: ~5 min (checking logs)
- **Annual time: ~2 hours**

### vs. Portable

**Portable Costs:**
- Service: $200-400/month = $2,400-4,800/year
- Setup: 10 minutes
- Maintenance: 0 hours

**Break-even:**
If your time is worth $1,200+/hour, use Portable.
Otherwise, custom cron is the clear winner.

---

## Next Steps

1. ✅ Choose which platform(s) you want to sync (Google, Meta, or both)
2. ✅ Follow setup instructions above to get API credentials
3. ✅ Add environment variables to `.env.local`
4. ✅ Test locally with the curl commands
5. ✅ Backfill historical data (last 30-90 days)
6. ✅ Deploy to production
7. ✅ Verify cron runs successfully
8. ✅ Check Marketing Dashboard has data

---

## Support

If you run into issues:

1. Check the troubleshooting section above
2. Review Vercel function logs
3. Check Supabase logs for database errors
4. Test the API credentials in the official playgrounds:
   - [Google Ads API Explorer](https://developers.google.com/google-ads/api/rest/reference)
   - [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)

The error messages from both platforms are usually pretty clear about what's wrong.
