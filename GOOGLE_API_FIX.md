# Google Places API Configuration Fix

## Problem

The Google Places API key is configured with HTTP referrer restrictions, which blocks server-side requests during the build process. This causes errors like:

```
Failed to fetch reviews from Google API: {
  error: {
    code: 403,
    message: 'Requests from referer <empty> are blocked.',
    status: 'PERMISSION_DENIED'
  }
}
```

The site **still works** (it gracefully degrades without reviews), but you won't have live Google reviews displayed.

## Solutions

Choose one of the following options:

### Option 1: Create Separate Server-Side API Key (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a **new API key** specifically for server-side use
3. Click "Edit API key"
4. Under "API restrictions":
   - Select "Restrict key"
   - Enable only "Places API (New)"
5. Under "Application restrictions":
   - Select "IP addresses"
   - Add your server's IP address (or Vercel/Netlify IP range)
   - For development, you can temporarily leave unrestricted
6. Save and use this key as `GOOGLE_PLACES_API_KEY` in production

**Pros**: Most secure, separates client vs server concerns
**Cons**: Requires knowing your server IPs

### Option 2: Modify Existing Key to Allow Server Requests

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your existing API key
3. Click "Edit API key"
4. Under "Application restrictions":
   - Change from "HTTP referrers" to "None" (least secure) OR
   - Change to "IP addresses" and add your server IPs
5. Save changes

**Pros**: Quick fix, uses existing key
**Cons**: Less secure if you choose "None"

### Option 3: Remove Google Reviews Integration

If you don't need live reviews, you can:

1. Remove these environment variables:
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID`
2. The site will gracefully hide the reviews section

**Pros**: No API configuration needed
**Cons**: Loses social proof from Google reviews

### Option 4: Use Static Fallback Reviews

Create a static list of reviews in your code:

1. Copy your best Google reviews manually
2. Add them to `lib/google-reviews.ts` as a fallback
3. Return the static reviews when API fails

**Pros**: Always shows reviews, no API dependency
**Cons**: Reviews won't be automatically updated

## Vercel IP Addresses

If deploying to Vercel, note that they use dynamic IP addresses. Instead:
- Use Option 1 with no restrictions for Vercel deployments
- Consider enabling the "Places API (New)" only for security

## Testing the Fix

After implementing a solution:

```bash
npm run build
```

You should no longer see the "referer <empty> are blocked" errors during the build.

## Current Behavior Without Fix

The site **works fine** without the API configured:
- Build completes successfully
- Reviews section gracefully hides when API fails
- No impact on user experience
- Only missing live Google reviews feature

## Recommendation

For launch, I recommend **Option 3** (remove for now) or **Option 1** (separate server key). This ensures a clean build and you can add reviews later once properly configured.
