# Brandenburg Scorecard Migration Guide

This document provides a comprehensive guide for rebuilding the Brandenburg Scorecard functionality in a new React.js + Supabase + Vercel + ShadCN + Tailwind codebase. The scorecard will become one tool within a larger admin backend application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models & Types](#data-models--types)
4. [ServiceTitan API Integration](#servicetitan-api-integration)
5. [Caching Strategy](#caching-strategy)
6. [Rate Limiting & Queue System](#rate-limiting--queue-system)
7. [UI Components](#ui-components)
8. [API Routes](#api-routes)
9. [Background Jobs](#background-jobs)
10. [Migration Steps](#migration-steps)
11. [Styling Migration](#styling-migration)

---

## Overview

The Brandenburg Scorecard is a technician performance dashboard that displays KPIs from ServiceTitan. It shows:

- **Technician Rankings**: Revenue, close rate, opportunity job average, options per opportunity, memberships sold, membership conversion rate, billable hours
- **Company-wide Metrics**: Leads summary, booking rates, cancelled jobs, gross margin analysis
- **Time Periods**: 7, 30, 90, and 365-day views with previous period comparisons
- **Trends**: Period-over-period percentage changes and rank movements

### Key Features

- Real-time data from ServiceTitan API
- Aggressive caching to minimize API calls
- Background data synchronization via cron jobs
- Rate limit protection with distributed queue system
- Responsive design with kiosk mode support
- Individual technician detail pages

---

## Architecture

### Current Stack (Next.js)
- **Framework**: Next.js 16 (App Router)
- **Database/Cache**: Vercel KV (Redis)
- **Deployment**: Vercel
- **Styling**: Custom CSS variables + Tailwind
- **Charts**: Recharts

### Target Stack
- **Framework**: React.js (likely with Next.js or Vite)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Supabase or Redis (via Upstash/Supabase)
- **Deployment**: Vercel
- **UI Components**: ShadCN + Tailwind
- **Charts**: Recharts (or ShadCN-compatible alternative)

### Architecture Diagram

```
┌─────────────────┐
│   React Client  │
│  (ShadCN UI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │
│  (Next.js API)  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│Supabase │ │ServiceTitan│
│(Cache)  │ │   API    │
└─────────┘ └──────────┘
```

---

## Data Models & Types

### Core TypeScript Interfaces

```typescript
// Technician base data
interface Technician {
  id: number;
  name: string;
  active: boolean;
}

// Technician KPIs (raw data from ServiceTitan)
interface TechnicianKPIs {
  id: string; // slugified name
  name: string;
  opportunityJobAverage: number;
  totalRevenueCompleted: number;
  optionsPerOpportunity: number;
  closeRate: number; // percentage
  membershipsSold: number;
  membershipConversionRate: number; // percentage
  leads: number;
  leadsBooked: number;
  hoursSold: number;
}

// Ranked technician (with trends)
interface RankedTechnician {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  trend: number; // % change from previous period
  rank: number;
  previousValue?: number;
  previousRank?: number;
}

// Company-wide leads summary
interface LeadsSummary {
  totalLeads: number;
  bookedLeads: number;
  bookingRate: number; // percentage
  previousTotalLeads?: number;
  previousBookedLeads?: number;
  previousBookingRate?: number;
}

// Company-wide overall stats
interface OverallStats {
  opportunityJobAverage: number;
  opportunityCloseRate: number;
  totalCloseRate: number;
  optionsPerOpportunity: number;
  totalRevenue: number;
  cancelledJobs: number;
  // Previous period values for trends
  previousOpportunityJobAverage?: number;
  previousOpportunityCloseRate?: number;
  previousTotalCloseRate?: number;
  previousOptionsPerOpportunity?: number;
  previousTotalRevenue?: number;
  previousCancelledJobs?: number;
}

// Full rankings response
interface RankedKPIs {
  opportunityJobAverage: RankedTechnician[];
  totalRevenueCompleted: RankedTechnician[];
  optionsPerOpportunity: RankedTechnician[];
  closeRate: RankedTechnician[];
  membershipsSold: RankedTechnician[];
  membershipConversionRate: RankedTechnician[];
  hoursSold: RankedTechnician[];
  leads: RankedTechnician[];
  leadsBooked: RankedTechnician[];
  leadsSummary?: LeadsSummary;
  overallStats?: OverallStats;
  dateRange: {
    startDate: string; // YYYY-MM-DD
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
  hasPreviousPeriodData: boolean;
}

// Gross margin data
interface GrossMarginData {
  totalRevenue: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  totalCost: number;
  grossMargin: number;
  grossMarginPercent: number;
  laborPercent: number;
  materialPercent: number;
  equipmentPercent: number;
}

// Cancelled jobs
interface CancelledJob {
  id: number;
  number: string;
  customerName: string;
  cancelReason: string;
  cancelledOn: string;
  scheduledDate?: string;
  jobType?: string;
}

interface CancelledJobsSummary {
  total: number;
  jobs: CancelledJob[];
  byReason: Record<string, number>;
}
```

### Supabase Schema

Create the following tables in Supabase:

```sql
-- Cache table for technician period data
CREATE TABLE technician_period_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  is_previous BOOLEAN NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_technician_cache_key ON technician_period_cache(cache_key);
CREATE INDEX idx_technician_cache_expires ON technician_period_cache(expires_at);

-- Cache table for rankings responses
CREATE TABLE rankings_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rankings_cache_key ON rankings_cache(cache_key);
CREATE INDEX idx_rankings_cache_expires ON rankings_cache(expires_at);

-- Cache table for leads data
CREATE TABLE leads_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  is_previous BOOLEAN NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_cache_key ON leads_cache(cache_key);

-- Cache table for gross margin data
CREATE TABLE gross_margin_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gross_margin_cache_key ON gross_margin_cache(cache_key);

-- Cache table for cancelled jobs
CREATE TABLE cancelled_jobs_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  offset_days INTEGER NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cancelled_jobs_cache_key ON cancelled_jobs_cache(cache_key);

-- Distributed lock table (for rate limiting)
CREATE TABLE api_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_key TEXT UNIQUE NOT NULL,
  lock_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_locks_key ON api_locks(lock_key);
CREATE INDEX idx_api_locks_expires ON api_locks(expires_at);

-- API request tracking (for rate limiting)
CREATE TABLE api_request_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_tracking_report ON api_request_tracking(report_id, window_start);
```

---

## ServiceTitan API Integration

### Authentication

ServiceTitan uses OAuth2 client credentials flow:

```typescript
// Environment variables required:
// SERVICETITAN_CLIENT_ID
// SERVICETITAN_CLIENT_SECRET
// SERVICETITAN_TENANT_ID
// SERVICETITAN_APP_KEY

const AUTH_URL = "https://auth.servicetitan.io/connect/token";
const API_BASE_URL = "https://api.servicetitan.io";

async function getAccessToken(): Promise<string> {
  // Check for cached token first
  // If expired or missing, fetch new token
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SERVICETITAN_CLIENT_ID!,
      client_secret: process.env.SERVICETITAN_CLIENT_SECRET!,
    }),
  });
  
  const data = await response.json();
  return data.access_token;
}
```

### Key API Endpoints

#### 1. Technician Performance Report (Report ID: 3017)
- **Category**: `technician-dashboard`
- **Endpoint**: `/reporting/v2/tenant/{tenantId}/report-category/technician-dashboard/reports/3017/data`
- **Method**: POST
- **Parameters**: `From` (date), `To` (date)
- **Returns**: Array of technician KPIs

#### 2. Sold Hours Report (Report ID: 239)
- **Category**: `operations`
- **Endpoint**: `/reporting/v2/tenant/{tenantId}/report-category/operations/reports/239/data`
- **Method**: POST
- **Parameters**: `DateType` (2 = Completion Date), `From`, `To`
- **Returns**: Job-level data with `SoldHours` and `AssignedTechnicians` fields

#### 3. Gross Margin Report (Report ID: 3874)
- **Category**: `operations`
- **Endpoint**: `/reporting/v2/tenant/{tenantId}/report-category/operations/reports/3874/data`
- **Method**: POST
- **Parameters**: `DateType` (2), `From`, `To`
- **Returns**: Cost breakdown data

#### 4. Leads Data (Multiple Sources)
- **Primary**: CRM Leads API (Report ID: 2983, category: `csr-dashboard`)
- **Fallback 1**: Marketing API (`/marketing/v2/tenant/{tenantId}/calls`)
- **Fallback 2**: Telecom API (`/telecom/v2/tenant/{tenantId}/calls`)

#### 5. Cancelled Jobs
- **Endpoint**: `/jpm/v2/tenant/{tenantId}/jobs`
- **Method**: GET
- **Parameters**: `status=Canceled`, `modifiedOnOrAfter`, `modifiedBefore`

### Rate Limits

- **Limit**: 5 requests per minute per report
- **Strategy**: 12-second delays between requests
- **Implementation**: Distributed queue with locks

### API Client Implementation

```typescript
async function serviceTitanFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOptions: { maxRetries?: number; retryDelayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelayMs = 15000 } = retryOptions;
  const token = await getAccessToken();
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "ST-App-Key": process.env.SERVICETITAN_APP_KEY!,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      
      if (response.status === 429) {
        // Rate limit - exponential backoff
        const backoffDelay = retryDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Caching Strategy

### Cache TTLs

```typescript
const CACHE_TTL = {
  CURRENT_PERIOD: 120 * 60,      // 2 hours
  PREVIOUS_PERIOD: 24 * 60 * 60, // 24 hours
  RANKINGS: 120 * 60,            // 2 hours
  TECHNICIAN: 120 * 60,          // 2 hours
};
```

### Cache Keys

```typescript
// Current period: "current-period:v2:{days}"
// Previous period: "previous-period:v2:{days}"
// Rankings: "rankings:v2:{days}"
// Leads: "leads:{days}-{current|previous}"
// Gross margin: "gross-margin:{days}"
// Cancelled jobs: "cancelled-jobs:{days}-offset{offset}"
```

### Supabase Cache Implementation

```typescript
// Using Supabase as cache store
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

async function getCached<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('technician_period_cache') // or appropriate table
    .select('data')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) return null;
  return data.data as T;
}

async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  
  await supabase
    .from('technician_period_cache')
    .upsert({
      cache_key: key,
      data: data,
      expires_at: expiresAt.toISOString(),
    });
}
```

### Alternative: Use Redis (Upstash)

If you prefer Redis over Supabase for caching:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function getCached<T>(key: string): Promise<T | null> {
  return await redis.get<T>(key);
}

async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  await redis.set(key, data, { ex: ttlSeconds });
}
```

---

## Rate Limiting & Queue System

### Distributed Locking

Prevents concurrent API calls across serverless instances:

```typescript
// Using Supabase for locks
async function acquireLock(resourceKey: string, maxWaitMs: number = 60000): Promise<{ acquired: boolean; lockId: string }> {
  const lockKey = `api-lock:${resourceKey}`;
  const lockId = `${Date.now()}-${Math.random().toString(36)}`;
  const expiresAt = new Date(Date.now() + 120000); // 2 min TTL
  
  // Try to insert lock (atomic operation)
  const { error } = await supabase
    .from('api_locks')
    .insert({
      lock_key: lockKey,
      lock_id: lockId,
      expires_at: expiresAt.toISOString(),
    });
  
  if (!error) {
    return { acquired: true, lockId };
  }
  
  // Lock exists, wait and retry
  await delay(1000);
  return { acquired: false, lockId: null };
}

async function releaseLock(resourceKey: string, lockId: string): Promise<void> {
  const lockKey = `api-lock:${resourceKey}`;
  
  await supabase
    .from('api_locks')
    .delete()
    .eq('lock_key', lockKey)
    .eq('lock_id', lockId);
}
```

### Request Queue

```typescript
const DELAY_BETWEEN_REQUESTS_MS = 12000; // 12 seconds

async function executeWithLock<T>(
  resourceKey: string,
  reportId: string,
  fn: () => Promise<T>,
  options: { skipDelay?: boolean; maxWaitMs?: number } = {}
): Promise<T> {
  const lock = await acquireLock(resourceKey, options.maxWaitMs);
  
  if (!lock.acquired) {
    throw new Error(`Failed to acquire lock for ${resourceKey}`);
  }
  
  try {
    // Track request count for rate limiting
    await trackApiRequest(reportId);
    
    // Execute function
    const result = await fn();
    
    // Add delay after request
    if (!options.skipDelay) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
    
    return result;
  } finally {
    await releaseLock(resourceKey, lock.lockId);
  }
}
```

---

## UI Components

### Component Structure

```
components/
  scorecard/
    RankingCard.tsx          # Main ranking list component
    GrossMarginCard.tsx      # Gross margin visualization
    KPICard.tsx              # Individual KPI display
    TechnicianRow.tsx        # Single technician row
    TimeFilter.tsx           # Time period selector
    Header.tsx               # Page header with filters
    LoadingSkeleton.tsx       # Loading states
```

### RankingCard Component (ShadCN + Tailwind)

```typescript
// Using ShadCN Card component
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RankingCardProps {
  title: string;
  technicians: RankedTechnician[];
  trendSuffix?: string;
  showTrends?: boolean;
  goal?: GoalConfig;
  showTotal?: boolean;
}

export function RankingCard({
  title,
  technicians,
  trendSuffix = "%",
  showTrends = true,
  goal,
  showTotal = false,
}: RankingCardProps) {
  // Calculate team average
  const teamAverage = technicians.length > 0
    ? technicians.reduce((sum, t) => sum + t.value, 0) / technicians.length
    : 0;
  
  const goalProgress = goal ? Math.min((teamAverage / goal.value) * 100, 150) : 0;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">
            {title}
          </CardTitle>
          {goal && (
            <Badge variant="outline" className="text-xs">
              Goal: {goal.formatValue(goal.value)}
            </Badge>
          )}
        </div>
        
        {showTotal && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              Total Team Revenue
            </div>
            <div className="text-2xl font-bold">
              {goal?.formatValue(teamTotal) || teamTotal.toLocaleString()}
            </div>
          </div>
        )}
        
        {goal && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">
                Team Avg: <span className="font-semibold">{goal.formatValue(teamAverage)}</span>
              </span>
              <span className="font-semibold">
                {Math.round((teamAverage / goal.value) * 100)}%
              </span>
            </div>
            <Progress value={Math.min(goalProgress, 100)} />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-1">
          {technicians.map((tech) => (
            <Link
              key={tech.id}
              href={`/technician/${tech.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {/* Rank Badge */}
              <Badge
                variant={tech.rank === 1 ? "default" : "outline"}
                className="w-8 h-8 flex items-center justify-center"
              >
                {tech.rank}
              </Badge>
              
              {/* Name */}
              <span className="flex-1 font-medium truncate">
                {tech.name}
              </span>
              
              {/* Value */}
              <span className="font-bold tabular-nums">
                {tech.formattedValue}
              </span>
              
              {/* Trend */}
              {showTrends && tech.trend !== 0 && (
                <Badge
                  variant={tech.trend > 0 ? "default" : "destructive"}
                  className="tabular-nums"
                >
                  {tech.trend > 0 ? "+" : ""}{tech.trend}{trendSuffix}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### TimeFilter Component

```typescript
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";

export function TimeFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const days = searchParams.get("days") || "7";
  
  const periods = [
    { days: 7, label: "7 Days" },
    { days: 30, label: "30 Days" },
    { days: 90, label: "90 Days" },
    { days: 365, label: "1 Year" },
  ];
  
  const handleChange = (newDays: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", newDays.toString());
    router.push(`?${params.toString()}`);
  };
  
  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <Button
          key={period.days}
          variant={days === period.days.toString() ? "default" : "outline"}
          size="sm"
          onClick={() => handleChange(period.days)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
```

---

## API Routes

### Rankings Endpoint

```typescript
// app/api/scorecard/rankings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateRealKPIsFromCache, calculateKPIsWithOffset } from "@/lib/servicetitan";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    
    if (![7, 30, 90, 365].includes(days)) {
      return NextResponse.json(
        { error: "Invalid days parameter" },
        { status: 400 }
      );
    }
    
    // If offset, fetch directly from API
    if (offset > 0) {
      const rankings = await calculateKPIsWithOffset(days, offset);
      return NextResponse.json({
        success: true,
        days,
        offset,
        data: rankings,
        cached: false,
      });
    }
    
    // Try cached rankings first
    const cached = await getCachedRankings(days);
    if (cached) {
      return NextResponse.json({
        success: true,
        days,
        data: cached,
        cached: true,
      });
    }
    
    // Build from cached period data
    const rankings = await calculateRealKPIsFromCache(days);
    if (rankings) {
      return NextResponse.json({
        success: true,
        days,
        data: rankings,
        cached: true,
        builtFromCache: true,
      });
    }
    
    // No cache, fetch fresh (with rate limiting)
    const freshRankings = await fetchAndCachePeriod(days, false);
    return NextResponse.json({
      success: true,
      days,
      data: freshRankings,
      cached: false,
      freshlyFetched: true,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### Gross Margin Endpoint

```typescript
// app/api/scorecard/gross-margin/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "7", 10);
  
  // Try cache first
  const cached = await getCached<GrossMarginData>(`gross-margin:${days}`);
  if (cached) {
    return NextResponse.json({ success: true, data: cached, cached: true });
  }
  
  // Fetch from API
  const dateRange = getDateRange(days);
  const data = await fetchGrossMarginData(dateRange.startDate, dateRange.endDate);
  
  if (data) {
    await setCached(`gross-margin:${days}`, data, CACHE_TTL.CURRENT_PERIOD);
  }
  
  return NextResponse.json({ success: true, data, cached: false });
}
```

---

## Background Jobs

### Cron Job for Data Sync

```typescript
// app/api/cron/sync-scorecard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAndCacheAllPeriods } from "@/lib/servicetitan";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const results = await fetchAndCacheAllPeriods();
    
    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-scorecard",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Sync Function

```typescript
// lib/servicetitan.ts
export async function fetchAndCacheAllPeriods(): Promise<{
  periods: Array<{ days: number; type: 'current' | 'previous'; success: boolean }>;
  totalSuccess: number;
  totalFailed: number;
}> {
  const periods = [
    { days: 7, isPrevious: false },
    { days: 30, isPrevious: false },
    { days: 7, isPrevious: true },
    { days: 30, isPrevious: true },
    { days: 90, isPrevious: false },
    { days: 90, isPrevious: true },
    { days: 365, isPrevious: false },
  ];
  
  const results = [];
  
  for (let i = 0; i < periods.length; i++) {
    const { days, isPrevious } = periods[i];
    
    // Add delay between calls (except first)
    if (i > 0) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
    
    try {
      const result = await fetchAndCachePeriod(days, isPrevious, {
        skipCacheCheck: true, // Force fresh fetch during cron
        useQueue: true,
      });
      
      results.push({
        days,
        type: isPrevious ? 'previous' : 'current',
        ...result,
      });
    } catch (error) {
      results.push({
        days,
        type: isPrevious ? 'previous' : 'current',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
  
  // Also sync leads, gross margin, cancelled jobs...
  
  return {
    periods: results,
    totalSuccess: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
  };
}
```

---

## Migration Steps

### 1. Setup New Repository

```bash
# Initialize Next.js project with TypeScript
npx create-next-app@latest brandenburg-admin --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js @supabase/supabase-js
npm install recharts
npm install @radix-ui/react-* # ShadCN dependencies
npm install lucide-react

# Setup ShadCN
npx shadcn-ui@latest init
npx shadcn-ui@latest add card badge progress button
```

### 2. Environment Variables

```env
# ServiceTitan
SERVICETITAN_CLIENT_ID=your_client_id
SERVICETITAN_CLIENT_SECRET=your_client_secret
SERVICETITAN_TENANT_ID=your_tenant_id
SERVICETITAN_APP_KEY=your_app_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cron
CRON_SECRET=your_random_secret

# Optional: Redis (if not using Supabase for cache)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 3. Create Database Schema

Run the SQL schema from the [Data Models](#data-models--types) section in Supabase SQL Editor.

### 4. Implement Core Libraries

Create these files in `lib/`:

- `servicetitan.ts` - API client (adapt from existing)
- `cache.ts` - Cache layer (Supabase or Redis)
- `api-queue.ts` - Rate limiting and queue system
- `date-utils.ts` - Date range calculations

### 5. Create API Routes

Create API routes in `app/api/scorecard/`:

- `rankings/route.ts`
- `gross-margin/route.ts`
- `cancelled-jobs/route.ts`
- `technician/[id]/route.ts`
- `cron/sync-scorecard/route.ts`

### 6. Build UI Components

Create ShadCN-based components in `components/scorecard/`:

- `RankingCard.tsx`
- `GrossMarginCard.tsx`
- `TimeFilter.tsx`
- `Header.tsx`
- `LoadingSkeleton.tsx`

### 7. Create Pages

- `app/scorecard/page.tsx` - Main rankings view
- `app/scorecard/gm/page.tsx` - GM dashboard
- `app/scorecard/technician/[id]/page.tsx` - Individual technician view

### 8. Setup Cron Job

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-scorecard",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 9. Testing

1. Test API routes locally
2. Verify caching works
3. Test rate limiting
4. Verify cron job runs
5. Test UI components with real data

---

## Styling Migration

### Current CSS Variables → Tailwind + ShadCN

The current app uses CSS variables for theming. Migrate to ShadCN's theming system:

**Current:**
```css
--background: #0a0a0a;
--background-card: #141414;
--foreground: #ffffff;
--brand-primary: #3b82f6;
--brand-success: #10b981;
--brand-danger: #ef4444;
```

**ShadCN (tailwind.config.ts):**
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          // ... other variants
        },
      },
    },
  },
}
```

### Component Styling Examples

**Current:**
```tsx
<div className="bg-[var(--background-card)] border border-[var(--border-color)]">
```

**ShadCN:**
```tsx
<Card className="border-border">
  {/* ShadCN Card handles background automatically */}
</Card>
```

### Color Mapping

| Current Variable | ShadCN/Tailwind |
|-----------------|-----------------|
| `--background` | `bg-background` |
| `--background-card` | `bg-card` (Card component) |
| `--foreground` | `text-foreground` |
| `--brand-primary` | `bg-primary` |
| `--brand-success` | `bg-green-500` or custom success color |
| `--brand-danger` | `bg-destructive` |
| `--foreground-muted` | `text-muted-foreground` |
| `--border-color` | `border-border` |

### Responsive Design

Current app uses:
- `md:` breakpoints for tablet
- `xl:` breakpoints for desktop
- Grid layouts: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`

Keep the same responsive strategy with Tailwind classes.

---

## Key Considerations

### 1. Authentication

The current app uses simple password auth. In the new admin backend:
- Use Supabase Auth
- Add role-based access control
- Protect scorecard routes

### 2. Data Storage

- **Option A**: Use Supabase PostgreSQL for cache (recommended for simplicity)
- **Option B**: Use Upstash Redis for cache (better performance, separate service)

### 3. Error Handling

Implement graceful degradation:
- Show cached data if API fails
- Display helpful error messages
- Retry logic for transient failures

### 4. Performance

- Client-side caching (2-hour TTL)
- Server-side caching (2-hour TTL for current, 24-hour for previous)
- Pre-built rankings responses
- Lazy loading for large lists

### 5. Monitoring

Add logging for:
- API call counts
- Cache hit rates
- Rate limit events
- Cron job execution

---

## Testing Checklist

- [ ] ServiceTitan API authentication works
- [ ] All report endpoints return data correctly
- [ ] Caching layer stores and retrieves data
- [ ] Rate limiting prevents concurrent calls
- [ ] Cron job syncs data successfully
- [ ] Rankings calculations are correct
- [ ] Trend calculations match expected values
- [ ] UI components render correctly
- [ ] Time period filters work
- [ ] Individual technician pages load
- [ ] Gross margin data displays
- [ ] Cancelled jobs list works
- [ ] Responsive design works on mobile/tablet
- [ ] Error states display properly
- [ ] Loading states show during fetches

---

## Additional Resources

- [ServiceTitan API Documentation](https://developer.servicetitan.io/)
- [ShadCN UI Components](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## Notes

- The current app excludes certain technicians (Lucas Brandenburg, Rebekah Sage, etc.). Maintain this exclusion list.
- Annual goals are hardcoded. Consider making these configurable in the admin backend.
- The app supports "kiosk mode" for displays. Preserve this functionality.
- Date ranges use inclusive "Last X Days" logic (e.g., "Last 30 Days" = today - 29 days to today).

---

**Last Updated**: 2024
**Version**: 1.0
