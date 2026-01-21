# Discount Calculator Migration Guide

This document provides comprehensive documentation for rebuilding the Brandenburg Plumbing Discount Calculator functionality in a new React.js + Supabase + Vercel + ShadCN + Tailwind repository.

## Overview

The Discount Calculator is a two-stage discount authorization tool that helps General Managers determine appropriate discount limits based on real-time business capacity data from ServiceTitan. The tool provides:

1. **Standard Discount** (Frontline Authorization): 50% of max sacrifice, capped at $1,000
2. **Max Discount** (Manager Approval Required): 100% of max sacrifice, capped at $5,000

Discount availability is dynamically calculated based on ServiceTitan capacity data for the next 3 days.

---

## Core Business Logic

### Capacity Status Determination

The system calculates three capacity statuses based on availability percentage:

| Status | Availability Range | Description |
|--------|-------------------|-------------|
| **Hungry** | >40% open | High availability - allows maximum discount flexibility |
| **Normal** | 20-40% open | Moderate availability - standard discount rules apply |
| **Busy** | <20% open | Low availability - no discounts allowed |

### Discount Calculation Rules

#### Max Sacrifice Calculation
The maximum sacrifice amount is calculated as a percentage of the gross margin based on capacity status:

- **Hungry**: 30% of gross margin
- **Normal**: 15% of gross margin  
- **Busy**: 0% (no discounts)

#### Standard Discount (Output A)
- **Formula**: `min(maxSacrificeAmount * 0.5, $1,000)`
- **Purpose**: Frontline authorization limit
- **Usage**: Standard approval workflow

#### Max Discount (Output B)
- **Formula**: `min(maxSacrificeAmount, $5,000)`
- **Purpose**: Manager approval required
- **Usage**: Use only to close the deal

#### Example Calculation
Given a gross margin of $10,000 and "Hungry" status:
1. Max Sacrifice = $10,000 × 30% = $3,000
2. Standard Discount = min($3,000 × 50%, $1,000) = **$1,000**
3. Max Discount = min($3,000, $5,000) = **$3,000**
4. Standard Retained Margin = $10,000 - $1,000 = **$9,000**
5. Max Retained Margin = $10,000 - $3,000 = **$7,000**

---

## Data Structures

### Discount Result Interface

```typescript
interface DiscountResult {
  status: 'hungry' | 'normal' | 'busy';
  availabilityPercent: number;
  grossMargin: number;
  
  // Max sacrifice amount (100% of allowed sacrifice)
  maxSacrificeAmount: number;
  maxSacrificePercent: number;
  
  // Standard Discount (Output A): 50% of max sacrifice, capped at $1,000
  standardDiscount: number;
  standardRetainedMargin: number;
  
  // Max Discount (Output B): 100% of max sacrifice, capped at $5,000
  maxDiscount: number;
  maxRetainedMargin: number;
}
```

### Capacity Data Interface

```typescript
interface CapacityData {
  status: 'hungry' | 'normal' | 'busy';
  availabilityPercent: number;
  totalCapacity: number;
  availableCapacity: number;
}
```

---

## ServiceTitan API Integration

### Authentication Flow

The application uses OAuth 2.0 Client Credentials flow:

1. **Token Endpoint**: 
   - Production: `https://auth.servicetitan.io/connect/token`
   - Integration: `https://auth-integration.servicetitan.io/connect/token`

2. **Request Format**:
   ```typescript
   POST /connect/token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=client_credentials
   client_id={SERVICETITAN_CLIENT_ID}
   client_secret={SERVICETITAN_CLIENT_SECRET}
   ```

3. **Token Response**:
   ```typescript
   {
     access_token: string;
     token_type: string;
     expires_in: number;
   }
   ```

4. **Token Caching**: Tokens should be cached to avoid repeated authentication. Check expiration with a 60-second buffer before expiry.

### Capacity Data Endpoint

**Endpoint**: `GET /dispatch/v2/tenant/{tenantId}/capacity`

**Query Parameters**:
- `startsOnOrAfter`: Start date (YYYY-MM-DD format)
- `endsOnOrBefore`: End date (YYYY-MM-DD format)

**Headers**:
- `Authorization`: `Bearer {access_token}`
- `ST-App-Key`: `{SERVICETITAN_APP_KEY}`
- `Content-Type`: `application/json`

**Response Structure**:
```typescript
{
  data: Array<{
    date: string;
    start: string;
    end: string;
    capacity: number;
    availableCapacity: number;
    openings: number;
    bookedCount: number;
    scheduledHrs: number;
  }>;
  hasMore: boolean;
}
```

**Capacity Calculation**:
1. Sum all `capacity` values across all slots → `totalCapacity`
2. Sum all `availableCapacity` values across all slots → `availableCapacity`
3. Calculate percentage: `(availableCapacity / totalCapacity) * 100`

**Default Lookup Period**: Next 3 days from today

---

## Implementation Details

### Core Calculation Function

```typescript
// lib/discount.ts equivalent

export type CapacityStatus = 'hungry' | 'normal' | 'busy';

interface DiscountConfig {
  maxSacrificePercent: number;  // Percentage of margin that can be sacrificed
  standardDiscountCap: number;   // Hard cap for standard discount ($)
  maxDiscountCap: number;        // Cap for max/manager discount ($)
}

function getDiscountConfig(status: CapacityStatus): DiscountConfig {
  const configs: Record<CapacityStatus, DiscountConfig> = {
    hungry: {
      maxSacrificePercent: 0.30,  // 30% of margin
      standardDiscountCap: 1000,
      maxDiscountCap: 5000,
    },
    normal: {
      maxSacrificePercent: 0.15,  // 15% of margin
      standardDiscountCap: 1000,
      maxDiscountCap: 5000,
    },
    busy: {
      maxSacrificePercent: 0,
      standardDiscountCap: 0,
      maxDiscountCap: 0,
    },
  };
  return configs[status];
}

export function calculateDiscounts(
  grossMargin: number,
  status: CapacityStatus,
  availabilityPercent: number
): DiscountResult {
  const config = getDiscountConfig(status);
  
  // Calculate max sacrifice amount based on margin and status
  const maxSacrificeAmount = grossMargin * config.maxSacrificePercent;
  
  // Standard Discount: 50% of max sacrifice, capped at $1,000
  const standardDiscountRaw = maxSacrificeAmount * 0.5;
  const standardDiscount = Math.min(standardDiscountRaw, config.standardDiscountCap);
  
  // Max Discount: 100% of max sacrifice, capped at $5,000
  const maxDiscount = Math.min(maxSacrificeAmount, config.maxDiscountCap);
  
  // Calculate retained margins
  const standardRetainedMargin = grossMargin - standardDiscount;
  const maxRetainedMargin = grossMargin - maxDiscount;
  
  return {
    status,
    availabilityPercent,
    grossMargin,
    maxSacrificeAmount: Math.round(maxSacrificeAmount * 100) / 100,
    maxSacrificePercent: config.maxSacrificePercent * 100,
    standardDiscount: Math.round(standardDiscount * 100) / 100,
    standardRetainedMargin: Math.round(standardRetainedMargin * 100) / 100,
    maxDiscount: Math.round(maxDiscount * 100) / 100,
    maxRetainedMargin: Math.round(maxRetainedMargin * 100) / 100,
  };
}
```

### ServiceTitan Client Implementation

```typescript
// lib/servicetitan.ts equivalent

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SERVICETITAN_CLIENT_ID,
      client_secret: process.env.SERVICETITAN_CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function getCapacityWithStatus(): Promise<CapacityData> {
  const token = await getAccessToken();
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 3); // Next 3 days

  const params = new URLSearchParams({
    startsOnOrAfter: today.toISOString().split('T')[0],
    endsOnOrBefore: endDate.toISOString().split('T')[0],
  });

  const url = `${baseUrl}/dispatch/v2/tenant/${tenantId}/capacity?${params}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'ST-App-Key': process.env.SERVICETITAN_APP_KEY,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  // Calculate totals
  let totalCapacity = 0;
  let availableCapacity = 0;
  for (const slot of data.data) {
    totalCapacity += slot.capacity;
    availableCapacity += slot.availableCapacity;
  }

  const availabilityPercent = totalCapacity > 0
    ? (availableCapacity / totalCapacity) * 100
    : 0;

  const status = availabilityPercent > 40 ? 'hungry' :
                 availabilityPercent >= 20 ? 'normal' : 'busy';

  return {
    status,
    availabilityPercent: Math.round(availabilityPercent * 10) / 10,
    totalCapacity,
    availableCapacity,
  };
}
```

---

## API Endpoints

### Capacity Endpoint
**GET** `/api/capacity` (or equivalent Supabase Edge Function)

Returns current capacity status:
```json
{
  "success": true,
  "data": {
    "status": "hungry",
    "availabilityPercent": 45.0,
    "totalCapacity": 100,
    "availableCapacity": 45
  }
}
```

### Calculate Endpoint
**POST** `/api/calculate` (or equivalent Supabase Edge Function)

Request body:
```json
{
  "grossMargin": 10000
}
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "hungry",
    "availabilityPercent": 45.0,
    "grossMargin": 10000,
    "maxSacrificeAmount": 3000,
    "maxSacrificePercent": 30,
    "standardDiscount": 1000,
    "standardRetainedMargin": 9000,
    "maxDiscount": 3000,
    "maxRetainedMargin": 7000
  }
}
```

---

## UI Components

### Main Calculator Page

**Key Features**:
1. Header with Brandenburg Plumbing branding
2. Capacity status indicator (shows current status and percentage)
3. Gross margin input field (numeric, currency formatted)
4. Calculate button
5. Results display (shows Standard Discount by default, Max Discount on toggle)

**User Flow**:
1. Page loads → fetches capacity status from API
2. User enters gross margin amount
3. User clicks "Calculate Discount"
4. Results display Standard Discount card
5. User can toggle "Show Max Authorization" to reveal Max Discount
6. Max Discount card has warning styling and manager approval notice

### Discount Card Component

**Structure**:
- **Standard Discount Card** (always visible):
  - Badge: "Standard Discount"
  - Subtitle: "Frontline Authorization Limit"
  - Large display: Discount amount
  - Details: Original Margin → Retained Margin
  
- **Toggle Button**: "Show Max Authorization" / "Hide Max Authorization"
  
- **Max Discount Card** (collapsible):
  - Warning banner: "Manager Approval Required"
  - Badge: "Maximum Discount"
  - Subtitle: "Absolute Floor — Use Only to Close the Deal"
  - Large display: Max discount amount
  - Details: Original Margin → Retained Margin
  - Warning styling (distinctive background/border)

- **Busy Status Warning** (shown when status is "busy"):
  - Alert explaining no discounts available
  - Guidance to maintain full pricing

### Status Indicators

Three status badges with distinct styling:
- **Hungry**: Green/green-adjacent color scheme
- **Normal**: Yellow/amber color scheme
- **Busy**: Red color scheme

Each status badge shows:
- Status name (capitalized)
- Availability percentage

---

## Authentication

### Current Implementation
The app uses cookie-based authentication with a password-protected login page.

**Flow**:
1. Unauthenticated users are redirected to `/login`
2. Login page prompts for password
3. Password sent to `/api/auth` endpoint
4. If correct, sets `brandenburg-auth` cookie (httpOnly, 7-day expiry)
5. Middleware checks cookie on protected routes

### Migration to New Stack

**Option 1: Supabase Auth**
- Use Supabase authentication with email/password or magic links
- Store user sessions in Supabase
- Implement Row Level Security (RLS) policies

**Option 2: Simple Password (Similar to Current)**
- Store password hash in Supabase database
- Use Supabase Edge Function for auth validation
- Store session token in Supabase or use cookies

**Recommendation**: Since this is an internal tool, simple password auth similar to current implementation is sufficient unless multi-user features are needed.

---

## Styling Migration to ShadCN + Tailwind

### Current Styling Approach

The current app uses a dark theme with:
- Custom CSS variables for colors
- Glass morphism effects
- Gradient backgrounds
- Status-based color schemes
- Custom animations

### ShadCN + Tailwind Approach

**Recommended ShadCN Components**:
- `Card` - For discount cards and calculator container
- `Button` - For calculate and toggle actions
- `Input` - For gross margin input
- `Badge` - For status indicators
- `Alert` - For warnings and error messages
- `Label` - For form labels

**Color System Migration**:
- Use Tailwind's color palette or define custom colors in `tailwind.config.js`
- Map status colors:
  - Hungry → `green-500` / `emerald-500`
  - Normal → `yellow-500` / `amber-500`
  - Busy → `red-500` / `rose-500`
- Standard Discount → `cyan-500` / `sky-500`
- Max Discount → `orange-500` / `amber-500`

**Glass Morphism Effect**:
```tsx
// Using Tailwind classes
className="backdrop-blur-xl bg-white/10 border border-white/20"
```

**Suggested Layout**:
- Use ShadCN's layout components
- Maintain similar visual hierarchy
- Adapt dark theme to match admin backend styling
- Ensure consistency with other tools in the new repo

---

## Environment Variables

Required environment variables:

```env
# ServiceTitan OAuth
SERVICETITAN_CLIENT_ID=your-client-id
SERVICETITAN_CLIENT_SECRET=your-client-secret
SERVICETITAN_TENANT_ID=your-tenant-id
SERVICETITAN_APP_KEY=your-app-key
SERVICETITAN_ENV=production  # or "integration" for testing

# Authentication (if using simple password)
AUTH_PASSWORD=your-secure-password

# Supabase (if applicable)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: In Vercel, add these as environment variables in Project Settings.

---

## Error Handling

### ServiceTitan API Errors

**Configuration Errors**:
- Missing credentials → Return 503 with helpful message
- Invalid credentials → Return 401 with error details

**API Errors**:
- Network failures → Return 500 with error message
- Invalid responses → Log error, return 500

**Fallback Behavior**:
- If ServiceTitan API fails, can use demo mode with default capacity (Hungry status, 45% availability)
- Frontend should handle errors gracefully and show appropriate messages

### Input Validation

- Gross margin must be a positive number
- Non-numeric input should be filtered
- Empty values should show validation error

---

## Performance Considerations

1. **Token Caching**: ServiceTitan tokens are cached in memory to reduce auth requests
2. **Capacity Caching**: Consider caching capacity data for 5-10 minutes to reduce API calls
3. **Client-Side Calculation**: Calculation logic can run client-side as fallback if API fails

---

## Testing Scenarios

### Test Cases

1. **Hungry Status** (>40% availability):
   - Enter $10,000 gross margin
   - Verify: Standard = $1,000, Max = $3,000

2. **Normal Status** (20-40% availability):
   - Enter $10,000 gross margin
   - Verify: Standard = $750, Max = $1,500

3. **Busy Status** (<20% availability):
   - Enter any gross margin
   - Verify: Both discounts = $0, warning shown

4. **Caps Applied**:
   - Enter $50,000 gross margin (Hungry status)
   - Verify: Standard = $1,000 (cap), Max = $5,000 (cap)

5. **Edge Cases**:
   - $0 gross margin
   - Very large numbers
   - Invalid input (letters, negative numbers)

---

## Migration Checklist

- [ ] Set up React.js project with Vite or Next.js
- [ ] Install ShadCN UI and Tailwind CSS
- [ ] Configure Supabase client
- [ ] Create ServiceTitan API client functions
- [ ] Implement discount calculation logic
- [ ] Create Supabase Edge Functions for capacity and calculate endpoints (or use API routes)
- [ ] Build main calculator page component
- [ ] Create DiscountCard component with toggle functionality
- [ ] Implement capacity status fetching
- [ ] Add authentication (Supabase or simple password)
- [ ] Style components to match admin backend design system
- [ ] Add error handling and loading states
- [ ] Configure environment variables in Vercel
- [ ] Test all calculation scenarios
- [ ] Test ServiceTitan API integration
- [ ] Deploy to Vercel

---

## Additional Notes

### Future Enhancements (Optional)

1. **History/Logging**: Store calculation history in Supabase
2. **Multi-User Support**: If moving to Supabase Auth, add user tracking
3. **Configurable Rules**: Allow admin to adjust discount percentages and caps
4. **Analytics**: Track usage patterns and common discount amounts
5. **Notifications**: Alert when capacity status changes significantly
6. **Mobile Optimization**: Ensure responsive design for tablet/mobile use

### Integration Considerations

- This tool will be one of multiple tools in the admin backend
- Maintain consistent navigation and layout patterns
- Share common components (header, footer, auth) across tools
- Use shared design system/tokens for consistency

---

## Support & Questions

For questions about:
- **Business Logic**: Refer to "Core Business Logic" section
- **ServiceTitan API**: Check ServiceTitan API documentation
- **Implementation**: Follow patterns in "Implementation Details" section
- **Styling**: Adapt to ShadCN + Tailwind patterns in "Styling Migration" section

---

**Last Updated**: Based on current implementation in brandenburg-discount-1 repository