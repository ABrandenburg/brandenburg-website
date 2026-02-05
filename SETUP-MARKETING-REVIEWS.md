# Marketing Dashboard & Reviews System - Setup Guide

## ✅ What's Been Completed

All code has been written and dependencies installed:
- ✅ 3 SQL migrations created
- ✅ ServiceTitan Jobs API integration
- ✅ Twilio SMS review request handler
- ✅ 2 cron jobs (review requests + analytics refresh)
- ✅ Marketing Dashboard UI
- ✅ Reviews Dashboard UI
- ✅ Navigation updated
- ✅ Dependencies installed (twilio)

## 🚀 Next Steps

### 1. Set Up Environment Variables

Add these to your `.env.local` file (and Vercel environment variables):

```bash
# Twilio (Required for SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Base URL (Required)
NEXT_PUBLIC_BASE_URL=https://brandenburgplumbing.com

# Already configured - verify these exist:
GOOGLE_PLACE_ID=your-google-place-id
CRON_SECRET=your-cron-secret
```

**Get Twilio Credentials:**
1. Sign up at https://www.twilio.com/try-twilio
2. Get a phone number
3. Copy Account SID, Auth Token, and Phone Number

### 2. Run Database Migrations

**Option A: Using Supabase CLI (Local Development)**
```bash
supabase db reset
```

**Option B: Via Supabase Dashboard**
1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy and paste each migration file content
3. Run in order:
   - `20260126000000_create_marketing_tables.sql`
   - `20260126100000_create_reviews_tables.sql`
   - `20260126200000_create_analytics_views.sql`

**Option C: Direct SQL Connection**
```bash
# Connect to your database
psql $DATABASE_URL

# Run each migration
\i supabase/migrations/20260126000000_create_marketing_tables.sql
\i supabase/migrations/20260126100000_create_reviews_tables.sql
\i supabase/migrations/20260126200000_create_analytics_views.sql
```

### 3. Test Cron Jobs Locally

**Test Review Requests Cron:**
```bash
curl -X GET "http://localhost:3000/api/cron/review-requests" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "summary": {
    "jobsFetched": 0,
    "jobsSynced": 0,
    "jobsEligible": 0,
    "jobsWithPhone": 0,
    "reviewsSent": 0,
    "reviewsFailed": 0,
    "reviewsSkipped": 0
  },
  "errors": [],
  "duration": "1s",
  "timestamp": "2026-01-26T..."
}
```

**Test Analytics Refresh Cron:**
```bash
curl -X GET "http://localhost:3000/api/cron/refresh-analytics" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "message": "Analytics refreshed successfully",
  "duration": "500ms",
  "timestamp": "2026-01-26T..."
}
```

### 4. Test Dashboards Locally

```bash
npm run dev
```

Visit:
- http://localhost:3000/admin/tools/marketing
- http://localhost:3000/admin/tools/reviews

**Note:** Dashboards will be empty until:
- Jobs are synced from ServiceTitan (via cron)
- Ad spend is imported (via Portable/Airbyte)

### 5. Deploy to Production

```bash
git add .
git commit -m "Add Marketing Dashboard and Reviews system

- Add SQL migrations for marketing, reviews, and analytics
- Implement ServiceTitan Jobs API integration
- Add Twilio SMS review request handler
- Create cron jobs for review requests and analytics refresh
- Build Marketing and Reviews admin dashboards
- Update navigation with new tools

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

**After Deploy:**
1. Add environment variables in Vercel:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `NEXT_PUBLIC_BASE_URL`
   - Redeploy to apply new env vars

2. Run migrations in production Supabase:
   - Use Supabase Dashboard SQL editor
   - Or use Supabase CLI: `supabase db push`

3. Verify cron jobs are running:
   - Vercel Dashboard → Project → Cron Jobs
   - Should see 3 cron jobs:
     - `/api/cron/sync-scorecard` (hourly)
     - `/api/cron/review-requests` (hourly)
     - `/api/cron/refresh-analytics` (every 30 min)

### 6. Set Up Ad Spend Sync (Third-Party)

**Recommended: Portable** (https://portable.io)

1. Sign up for Portable account
2. Connect data sources:
   - Google Ads
   - Meta Ads
   - Other ad platforms
3. Configure destination:
   - Platform: Supabase
   - Table: `raw_ad_spend`
   - Connection details: Your Supabase credentials
4. Map fields:
   - `platform` → Source name (e.g., "google", "facebook")
   - `date` → Ad date
   - `spend` → Cost/spend
   - `impressions` → Impressions
   - `clicks` → Clicks
   - `conversions` → Conversions
   - `metadata` → Full raw data (JSON)
5. Set schedule: Daily at 2 AM

**Alternative: Airbyte** (https://airbyte.com)
- Free self-hosted option
- More technical setup required
- Native Supabase connector available

### 7. Manual Testing Checklist

**Database:**
- [ ] All 3 migrations run successfully
- [ ] Tables exist: `raw_ad_spend`, `raw_servicetitan_jobs`, `technicians`, `review_requests`, `reviews_received`
- [ ] Materialized view exists: `tech_performance_card`
- [ ] Function exists: `refresh_tech_performance_card()`

**API Endpoints:**
- [ ] `/api/cron/review-requests` returns 200 with Bearer token
- [ ] `/api/cron/refresh-analytics` returns 200 with Bearer token
- [ ] Both cron jobs return 401 without token

**Admin UI:**
- [ ] `/admin/tools` shows Marketing and Reviews cards
- [ ] `/admin/tools/marketing` loads without errors
- [ ] `/admin/tools/reviews` loads without errors
- [ ] Sidebar shows Marketing and Reviews navigation items
- [ ] Clicking nav items navigates correctly

**Review Request Flow (End-to-End):**
1. [ ] Complete a job in ServiceTitan
2. [ ] Wait for hourly cron to run (or trigger manually)
3. [ ] Check `raw_servicetitan_jobs` - job should appear
4. [ ] Check `review_requests` - request should be created
5. [ ] Customer receives SMS (if Twilio configured)
6. [ ] SMS contains Google review link

**Analytics Flow:**
1. [ ] Add some test data to `technicians`, `review_requests`, `reviews_received`
2. [ ] Run analytics refresh cron
3. [ ] Check `tech_performance_card` view has data
4. [ ] Visit `/admin/tools/reviews` - leaderboard should display

## 🎯 Expected Behavior

### Marketing Dashboard
- **Empty State**: Shows "No ad spend data available" until Portable/Airbyte syncs
- **With Data**: Displays summary cards (Spend, Revenue, ROAS, Avg Job Value) and tables

### Reviews Dashboard
- **Empty State**: Shows "No performance data available" until jobs sync and analytics refresh
- **With Data**: Shows technician leaderboard sorted by avg rating, revenue bar chart
- **Badge Colors**:
  - Red (destructive): Rating < 4.0
  - Black (default): Rating >= 4.0

### Review Requests Cron
- **Runs**: Every hour at :00
- **Actions**:
  1. Fetches jobs completed in last hour from ServiceTitan
  2. Syncs to `raw_servicetitan_jobs`
  3. Filters eligible jobs (not warranty/recall/refund, no existing request)
  4. Sends SMS via Twilio
  5. Creates record in `review_requests`
- **Logs**: Check Vercel logs for execution details

### Analytics Refresh Cron
- **Runs**: Every 30 minutes
- **Actions**: Refreshes `tech_performance_card` materialized view
- **Duration**: < 5 seconds typically

## 📊 Data Flow Diagram

```
ServiceTitan → Hourly Cron → raw_servicetitan_jobs → Review Request Logic → Twilio SMS
                                      ↓
                              Eligible Jobs Filter
                                      ↓
                              review_requests table
                                      ↓
                    Analytics Refresh (every 30 min) → tech_performance_card view
                                      ↓
                              Reviews Dashboard UI
```

## 🔧 Troubleshooting

### Issue: "No jobs data available"
- Check ServiceTitan credentials are configured
- Trigger cron manually to test
- Check Vercel logs for errors
- Verify jobs exist in ServiceTitan (completed in last hour)

### Issue: "Twilio not configured"
- Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` are set
- Check Vercel environment variables
- Redeploy after adding env vars

### Issue: "Analytics view empty"
- Run analytics refresh cron manually
- Check if technicians exist in database
- Check if jobs are synced to `raw_servicetitan_jobs`
- Verify materialized view was created (run migration)

### Issue: Cron jobs not running in production
- Check Vercel cron jobs page - should show scheduled jobs
- Verify `vercel.json` is committed and deployed
- Check if CRON_SECRET is set in Vercel env vars
- View logs in Vercel dashboard

### Issue: SMS not sending
- Check Twilio account has credits
- Verify phone number is verified in Twilio
- Check customer phone number format (must be E.164: +1XXXXXXXXXX)
- View Twilio logs at https://console.twilio.com/monitor/logs/messages

## 📚 Useful Resources

- **Twilio Console**: https://console.twilio.com/
- **Portable Dashboard**: https://portable.io/dashboard
- **Supabase Dashboard**: https://app.supabase.com/
- **Vercel Cron Jobs**: https://vercel.com/docs/cron-jobs
- **ServiceTitan API Docs**: https://developer.servicetitan.io/

## 🎉 Success Criteria

You'll know everything is working when:
1. ✅ Cron jobs run hourly without errors
2. ✅ Jobs appear in Marketing Dashboard after sync
3. ✅ Review requests are sent via SMS
4. ✅ Technician leaderboard shows performance data
5. ✅ Ad spend data syncs daily from Portable/Airbyte
6. ✅ ROAS calculations are accurate

---

**Questions or Issues?**
Refer to the implementation plan: `/Users/adambrandenburg/.claude/plans/zesty-rolling-owl.md`
