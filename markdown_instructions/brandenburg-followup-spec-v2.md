# Brandenburg Plumbing, Heating & Air — Automated Follow-Up System

## Claude Code Implementation Prompt

Paste this prompt at the top when giving Claude Code this spec:

---

**PROMPT FOR CLAUDE CODE:**

You are building an automated lead response and follow-up system for Brandenburg Plumbing, Heating & Air, a home services company in Marble Falls, Texas expanding into Austin and HVAC services.

The system integrates into an EXISTING React + Vercel + Supabase (Postgres) project that already has an admin dashboard with a discount calculator and technician dashboard.

**CRITICAL: Build this in phases. Do NOT attempt to build everything at once.** Follow the phased implementation plan in Section 12 of this spec. Complete each phase fully — including tests and verification — before moving to the next. Each phase is designed to be independently functional.

**Phase order:**
1. Database schema + seed data
2. ServiceTitan webhook receiver
3. Twilio RCS messaging layer
4. Angi lead webhook receiver + speed-to-lead response
5. Thumbtack lead webhook receiver + speed-to-lead response
6. Google LSA lead webhook receiver + speed-to-lead response
7. Estimate follow-up sequences + pg_cron scheduler
8. Review request automation
9. Membership/maintenance reminders
10. Dashboard UI (lead inbox, message logs, sequence manager)
11. Monitoring, alerts, and daily digest
12. Testing suite

When starting a new phase, re-read this spec for that phase's section. Ask me if anything is ambiguous before writing code.

**Tech constraints:**
- Supabase Edge Functions (Deno/TypeScript)
- Supabase Postgres with pg_cron extension
- React frontend deployed on Vercel
- Twilio for RCS/SMS messaging
- Direct webhook integrations with Thumbtack, Angi, and Google LSA (NO email parsing)
- All secrets stored in Supabase Vault / Edge Function secrets

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Database Schema](#3-database-schema)
4. [ServiceTitan Integration](#4-servicetitan-integration)
5. [Twilio RCS + SMS Messaging Layer](#5-twilio-rcs--sms-messaging-layer)
6. [Lead Source Integrations](#6-lead-source-integrations)
7. [Speed-to-Lead Auto-Responder](#7-speed-to-lead-auto-responder)
8. [Estimate Follow-Up Sequences](#8-estimate-follow-up-sequences)
9. [Review Request Automation](#9-review-request-automation)
10. [Membership & Maintenance Reminders](#10-membership--maintenance-reminders)
11. [Dashboard UI](#11-dashboard-ui)
12. [Monitoring, Alerts & Daily Digest](#12-monitoring-alerts--daily-digest)
13. [Phased Implementation Plan](#13-phased-implementation-plan)
14. [Testing Strategy](#14-testing-strategy)
15. [Environment Variables & Secrets](#15-environment-variables--secrets)
16. [Error Handling Conventions](#16-error-handling-conventions)

---

## 1. System Overview

### What This System Does

1. **Speed-to-lead:** When a lead comes in from Thumbtack, Angi, or Google LSA (via direct API webhooks), the system receives structured lead data and sends an automated text within 60 seconds. No email parsing — all three platforms push structured JSON directly to our endpoints.

2. **Estimate follow-up:** When ServiceTitan creates an estimate, the system starts a timed drip sequence: 2 hours → 1 day → 3 days → 7 days. The sequence stops automatically if the job gets booked.

3. **Review requests:** When a job is marked complete in ServiceTitan, the system waits 2 hours then sends a review request text with a direct Google review link.

4. **Membership/maintenance reminders:** Seasonal outreach to existing customers for maintenance visits, tied to ServiceTitan membership data.

5. **Dashboard:** Admin UI showing lead inbox, message logs, active sequences, and system health metrics.

6. **Monitoring:** Daily digest, error alerts, and delivery tracking to ensure nothing falls through the cracks.

### Business Rules (Non-Negotiable)

- **TCPA compliance:** Never text a customer who has replied STOP. Maintain a suppression list. Include opt-out language in first message of any sequence.
- **Business hours awareness:** Speed-to-lead texts can go 24/7. Follow-up sequence messages should only send between 8am-7pm CT. If a scheduled message falls outside this window, delay to the next eligible window.
- **One sequence at a time:** A customer should never be in multiple active sequences simultaneously. If a new event triggers a higher-priority sequence, cancel the current one and start the new one.
- **Sequence priority (highest to lowest):** Speed-to-lead → Estimate follow-up → Review request → Membership reminder
- **Deduplication:** If the same phone number comes in from multiple lead sources within 24 hours, only trigger one speed-to-lead response.
- **Rate limiting:** Maximum 1 outbound message per customer per 4-hour window (excluding speed-to-lead which is always immediate).

---

## 2. Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INBOUND TRIGGERS                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Thumbtack   │    Angi      │  Google LSA  │  ServiceTitan  │
│  (webhook)   │  (webhook)   │  (webhook)   │  (webhook)     │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE EDGE FUNCTIONS                      │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ lead-tt  │ lead-angi│ lead-lsa │st-webhook│ send-message    │
│(Thumbtck)│ (Angi)   │ (Google) │(ST evts) │ (Twilio API)    │
├──────────┴──────────┴──────────┼──────────┼─────────────────┤
│ process-queue │ daily-digest   │twilio-in │ twilio-status   │
└───────┬───────┴───────┬────────┴──────┬───┴────────┬────────┘
        │               │              │             │
        ▼               ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE POSTGRES                            │
├─────────────────────────────────────────────────────────────┤
│  leads │ customers │ sequences │ messages │ delivery_logs    │
│  jobs  │ estimates │ suppression_list │ system_metrics       │
├─────────────────────────────────────────────────────────────┤
│  pg_cron: runs every 60 seconds                              │
│  → checks pending_messages where send_at <= now()            │
│  → calls send-message Edge Function                          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              OUTBOUND MESSAGING                               │
├─────────────────────────────────────────────────────────────┤
│  Twilio (RCS preferred, SMS fallback)                        │
│  → Delivery status callbacks → Edge Function → delivery_logs │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT DASHBOARD (Vercel)                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Lead Inbox  │ Message Log  │  Sequences   │ System Health  │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Runtime |
|-----------|---------------|---------|
| `lead-thumbtack` Edge Function | Receives Thumbtack lead webhooks (OAuth 2.0 authenticated), extracts structured lead data, writes to `leads` table, triggers speed-to-lead | Supabase Edge Functions |
| `lead-angi` Edge Function | Receives Angi JSON lead posts, extracts structured lead data, writes to `leads` table, triggers speed-to-lead | Supabase Edge Functions |
| `lead-lsa` Edge Function | Receives Google LSA lead form webhooks, extracts structured lead data, writes to `leads` table, triggers speed-to-lead | Supabase Edge Functions |
| `thumbtack-oauth` Edge Function | Handles Thumbtack OAuth 2.0 authorization flow (redirect, token exchange, token refresh) | Supabase Edge Functions |
| `st-webhook` Edge Function | Receives ServiceTitan V2 webhook events (job created, updated, completed), writes to `jobs`/`estimates` tables, triggers sequences | Supabase Edge Functions |
| `send-message` Edge Function | Sends messages via Twilio RCS/SMS, logs to `messages` table | Supabase Edge Functions |
| `twilio-status` Edge Function | Receives Twilio delivery status callbacks, updates `delivery_logs` | Supabase Edge Functions |
| `twilio-inbound` Edge Function | Receives inbound SMS/RCS replies from customers, checks for STOP, logs to messages | Supabase Edge Functions |
| `process-queue` Edge Function | Called by pg_cron every 60s, finds pending messages ready to send, calls `send-message` for each | Supabase Edge Functions |
| `daily-digest` Edge Function | Called by pg_cron at 8am CT daily, compiles stats, sends digest via Twilio/email | Supabase Edge Functions |
| React Dashboard | Admin UI for viewing leads, messages, sequences, system health | Vercel |

---

## 3. Database Schema

### Tables

```sql
-- ============================================================
-- CUSTOMERS: Central customer record, synced from ServiceTitan
-- ============================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicetitan_id BIGINT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL, -- E.164 format: +15125551234
    email TEXT,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    source TEXT, -- 'servicetitan', 'thumbtack', 'angi', 'lsa', 'manual'
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone_normalized);
CREATE INDEX idx_customers_st_id ON customers(servicetitan_id);

-- ============================================================
-- LEADS: Inbound leads from all sources before customer match
-- ============================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    source TEXT NOT NULL, -- 'thumbtack', 'angi', 'lsa', 'servicetitan', 'website', 'manual'
    source_lead_id TEXT, -- external ID from lead source (Thumbtack leadID, Angi leadID, Google lead_id)
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    phone_normalized TEXT,
    email TEXT,
    job_type TEXT, -- 'water_heater', 'drain_cleaning', 'hvac_install', etc.
    job_description TEXT, -- description from the lead
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    raw_payload JSONB, -- original webhook payload for debugging
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'booked', 'lost', 'duplicate'
    auto_response_sent BOOLEAN DEFAULT false,
    auto_response_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_phone ON leads(phone_normalized);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_source_lead ON leads(source, source_lead_id);

-- ============================================================
-- JOBS: Synced from ServiceTitan via webhooks
-- ============================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicetitan_id BIGINT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    job_number TEXT,
    job_type TEXT, -- maps to ST job type
    business_unit TEXT, -- 'plumbing', 'hvac_service', 'hvac_install'
    status TEXT NOT NULL, -- 'scheduled', 'in_progress', 'completed', 'canceled'
    technician_name TEXT,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_amount DECIMAL(10,2),
    has_estimate BOOLEAN DEFAULT false,
    estimate_amount DECIMAL(10,2),
    estimate_created_at TIMESTAMPTZ,
    servicetitan_raw JSONB, -- full webhook payload for debugging
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_jobs_st_id ON jobs(servicetitan_id);
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ============================================================
-- SEQUENCES: Defines follow-up sequence templates
-- ============================================================
CREATE TABLE sequence_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'estimate_followup', 'review_request', 'maintenance_reminder'
    description TEXT,
    trigger_event TEXT NOT NULL, -- 'estimate_created', 'job_completed', 'membership_due', 'lead_received'
    priority INT NOT NULL DEFAULT 5, -- lower number = higher priority. 1=speed-to-lead, 2=estimate, 3=review, 4=membership
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEQUENCE STEPS: Individual messages within a sequence
-- ============================================================
CREATE TABLE sequence_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_template_id UUID REFERENCES sequence_templates(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    delay_minutes INT NOT NULL, -- minutes after sequence start (0 = immediate)
    message_template TEXT NOT NULL, -- supports {{first_name}}, {{job_type}}, {{technician_name}}, {{estimate_amount}}, {{review_link}}
    channel TEXT DEFAULT 'sms', -- 'sms' (Twilio handles RCS upgrade automatically)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(sequence_template_id, step_number)
);

-- ============================================================
-- ACTIVE SEQUENCES: Currently running sequences per customer
-- ============================================================
CREATE TABLE active_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    sequence_template_id UUID NOT NULL REFERENCES sequence_templates(id),
    job_id UUID REFERENCES jobs(id),
    lead_id UUID REFERENCES leads(id),
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'canceled', 'paused'
    current_step INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    canceled_at TIMESTAMPTZ,
    cancel_reason TEXT, -- 'job_booked', 'customer_opted_out', 'higher_priority_sequence', 'manual'
    completed_at TIMESTAMPTZ,
    template_vars JSONB DEFAULT '{}', -- populated at sequence start: {"first_name": "John", "job_type": "water heater", ...}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_active_seq_customer ON active_sequences(customer_id);
CREATE INDEX idx_active_seq_status ON active_sequences(status);

-- ============================================================
-- PENDING MESSAGES: Queue of messages waiting to be sent
-- ============================================================
CREATE TABLE pending_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_sequence_id UUID REFERENCES active_sequences(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    phone_normalized TEXT NOT NULL,
    message_body TEXT NOT NULL, -- fully rendered (template vars replaced)
    channel TEXT DEFAULT 'sms',
    send_at TIMESTAMPTZ NOT NULL, -- when this message should go out
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'canceled', 'skipped_business_hours'
    attempt_count INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pending_send_at ON pending_messages(send_at) WHERE status = 'pending';
CREATE INDEX idx_pending_status ON pending_messages(status);

-- ============================================================
-- MESSAGES: Log of all sent/received messages
-- ============================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    active_sequence_id UUID REFERENCES active_sequences(id),
    direction TEXT NOT NULL, -- 'outbound', 'inbound'
    channel TEXT, -- 'rcs', 'sms', 'mms', 'email'
    phone_from TEXT,
    phone_to TEXT,
    message_body TEXT,
    media_url TEXT,
    twilio_sid TEXT, -- Twilio message SID for tracking
    status TEXT, -- 'queued', 'sent', 'delivered', 'read', 'failed', 'received'
    error_code TEXT,
    error_message TEXT,
    source TEXT, -- 'speed_to_lead', 'estimate_followup', 'review_request', 'membership_reminder', 'manual'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_customer ON messages(customer_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_twilio_sid ON messages(twilio_sid);

-- ============================================================
-- SUPPRESSION LIST: Customers who have opted out (STOP)
-- ============================================================
CREATE TABLE suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_normalized TEXT NOT NULL UNIQUE,
    reason TEXT DEFAULT 'customer_opted_out', -- 'customer_opted_out', 'manual', 'complaint'
    suppressed_at TIMESTAMPTZ DEFAULT now(),
    source_message_id UUID REFERENCES messages(id)
);

CREATE INDEX idx_suppression_phone ON suppression_list(phone_normalized);

-- ============================================================
-- OAUTH TOKENS: Store OAuth tokens for Thumbtack and Google
-- ============================================================
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'thumbtack', 'google_lsa'
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ NOT NULL,
    scopes TEXT[], -- e.g., ['leads', 'messages'] for Thumbtack
    provider_account_id TEXT, -- Thumbtack business ID, Google customer ID
    raw_token_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_provider ON oauth_tokens(provider);

-- ============================================================
-- SYSTEM METRICS: Daily rollup for monitoring/digest
-- ============================================================
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    leads_received INT DEFAULT 0,
    leads_by_source JSONB DEFAULT '{}', -- {"thumbtack": 3, "angi": 2, "lsa": 1}
    auto_responses_sent INT DEFAULT 0,
    followups_sent INT DEFAULT 0,
    review_requests_sent INT DEFAULT 0,
    membership_reminders_sent INT DEFAULT 0,
    messages_delivered INT DEFAULT 0,
    messages_failed INT DEFAULT 0,
    messages_read INT DEFAULT 0, -- RCS read receipts
    sequences_started INT DEFAULT 0,
    sequences_completed INT DEFAULT 0,
    sequences_canceled_booked INT DEFAULT 0, -- canceled because job was booked (good!)
    opt_outs INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(metric_date)
);

-- ============================================================
-- WEBHOOK LOG: Raw log of all incoming webhooks for debugging
-- ============================================================
CREATE TABLE webhook_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- 'servicetitan', 'thumbtack', 'angi', 'google_lsa', 'twilio_status', 'twilio_inbound'
    event_type TEXT,
    payload JSONB NOT NULL,
    processing_status TEXT DEFAULT 'received', -- 'received', 'processed', 'failed'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_webhook_source ON webhook_log(source);
CREATE INDEX idx_webhook_created ON webhook_log(created_at);

-- ============================================================
-- pg_cron SETUP
-- ============================================================
-- Enable the extension (run once)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Process message queue every 60 seconds
-- SELECT cron.schedule(
--   'process-pending-messages',
--   '* * * * *',
--   $$SELECT net.http_post(
--     url := 'https://<your-project>.supabase.co/functions/v1/process-queue',
--     headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
--   )$$
-- );

-- Daily digest at 8:00 AM CT (14:00 UTC during CST, 13:00 UTC during CDT)
-- SELECT cron.schedule(
--   'daily-digest',
--   '0 14 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<your-project>.supabase.co/functions/v1/daily-digest',
--     headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
--   )$$
-- );

-- Daily metrics rollup at 11:59 PM CT
-- SELECT cron.schedule(
--   'metrics-rollup',
--   '59 5 * * *',
--   $$SELECT net.http_post(
--     url := 'https://<your-project>.supabase.co/functions/v1/metrics-rollup',
--     headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
--   )$$
-- );

-- Thumbtack token refresh — every 30 minutes to keep tokens valid
-- SELECT cron.schedule(
--   'refresh-thumbtack-token',
--   '*/30 * * * *',
--   $$SELECT net.http_post(
--     url := 'https://<your-project>.supabase.co/functions/v1/thumbtack-oauth',
--     body := '{"action": "refresh"}'::jsonb,
--     headers := '{"Authorization": "Bearer <service-role-key>", "Content-Type": "application/json"}'::jsonb
--   )$$
-- );
```

---

## 4. ServiceTitan Integration

### Authentication

ServiceTitan uses OAuth 2.0. The app needs:
- **App Key** (generated in ST Developer Portal under "My Apps")
- **Client ID** (generated by ST admin in Settings → Integrations → API Application Access)
- **Client Secret** (generated alongside Client ID — only shown once, store securely)
- **Tenant ID** (your Brandenburg tenant ID)

Token flow:
1. POST to `https://auth.servicetitan.io/connect/token` with Client ID + Secret
2. Receive access token (valid 15 minutes)
3. Cache token, refresh before expiry
4. All API calls include `Authorization: Bearer {token}` and `ST-App-Key: {app_key}`

### Webhook Events to Subscribe To

Configure these in the ServiceTitan Developer Portal when creating your app:

| Event | Use Case |
|-------|----------|
| `Job.Created` | Detect new jobs, match to customers |
| `Job.Updated` | Detect status changes (scheduled → completed, estimate added) |
| `Job.Completed` | Trigger review request sequence |
| `Job.Canceled` | Cancel any active sequences for this job |
| `Customer.Created` | Sync new customer to local DB |
| `Customer.Updated` | Keep customer info current |

### Webhook Receiver: `st-webhook` Edge Function

```
POST /functions/v1/st-webhook
```

**Processing logic:**

1. **Verify HMAC signature** using the key configured in ST Developer Portal
2. **Log raw payload** to `webhook_log` table (always, before any processing)
3. **Parse event type** from payload
4. **Route to handler:**

   **On `Job.Created` or `Job.Updated`:**
   - Upsert customer in `customers` table (match on `servicetitan_id`)
   - Upsert job in `jobs` table
   - If job now has an estimate AND no active estimate_followup sequence exists for this customer → start estimate follow-up sequence
   - If job status changed to `scheduled` (booked) → cancel any active `estimate_followup` sequences for this customer with reason `job_booked`

   **On `Job.Completed`:**
   - Update job status and `completed_at`
   - Cancel any active sequences for this customer
   - Start review request sequence (2-hour delay before first message)

   **On `Job.Canceled`:**
   - Update job status
   - Cancel any active sequences for this job with reason `job_canceled`

### ServiceTitan API Calls (Outbound)

The system may need to pull additional data from ST. Key endpoints:

- `GET /crm/v2/customers/{id}` — full customer details
- `GET /jpm/v2/jobs/{id}` — full job details including estimates
- `GET /memberships/v2/customers/{customerId}/memberships` — membership status for maintenance reminders

Rate limit: 60 calls/second/tenant. Cache aggressively.

---

## 5. Twilio RCS + SMS Messaging Layer

### Setup

- Register for Twilio account
- Purchase a phone number (local 830 or 512 area code preferred for Hill Country / Austin)
- Register as RCS sender in Twilio Console:
  - Business name: "Brandenburg Plumbing, Heating & Air"
  - Upload logo
  - Complete brand verification with Google
- Twilio automatically upgrades SMS to RCS on capable devices and falls back to SMS when RCS is unavailable. No code changes needed.

### Send Message: `send-message` Edge Function

```
POST /functions/v1/send-message
Body: {
    customer_id: UUID,
    phone: string (E.164),
    body: string,
    source: string,
    active_sequence_id?: UUID,
    pending_message_id?: UUID
}
```

**Processing logic:**

1. **Check suppression list.** If phone is suppressed, skip and log as `skipped_opted_out`.
2. **Check business hours** (for non-speed-to-lead messages). If outside 8am-7pm CT, update `pending_message` send_at to next eligible window.
3. **Check rate limit.** Query `messages` table for outbound messages to this phone in last 4 hours. If found (and source is not `speed_to_lead`), delay.
4. **Send via Twilio:**
   ```typescript
   const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
   const message = await client.messages.create({
       to: phone,
       from: TWILIO_PHONE_NUMBER,
       body: body,
       statusCallback: `https://<project>.supabase.co/functions/v1/twilio-status`
   });
   ```
5. **Log to `messages` table** with Twilio SID, status, source.
6. **Update `pending_messages`** status to `sent` if applicable.
7. **Update `system_metrics`** increment for the day.

### Twilio Status Callback: `twilio-status` Edge Function

```
POST /functions/v1/twilio-status
```

Twilio POSTs delivery status updates. Handle:

| Twilio Status | Action |
|---------------|--------|
| `delivered` | Update message status, increment `messages_delivered` metric |
| `read` | Update message status, increment `messages_read` metric (RCS only) |
| `failed` | Update message status, log error code, increment `messages_failed` metric |
| `undelivered` | Same as failed |

### Twilio Inbound: `twilio-inbound` Edge Function

```
POST /functions/v1/twilio-inbound
```

Handles incoming texts from customers.

**Processing logic:**

1. Log to `messages` table with direction `inbound`
2. Normalize the sender's phone number
3. **Check for STOP/UNSUBSCRIBE/CANCEL/QUIT:**
   - If found → add to `suppression_list`, cancel all active sequences for this customer, reply with "You've been unsubscribed from Brandenburg messages. Reply START to re-subscribe."
4. **Check for START/SUBSCRIBE:**
   - If found and phone is on suppression list → remove from suppression list, reply with "You've been re-subscribed to Brandenburg messages."
5. **Check for active sequence:**
   - If customer has an active sequence and they replied with something (not STOP) → update lead/sequence status to indicate engagement. This is valuable data for the dashboard.
6. Match to customer record if possible.

---

## 6. Lead Source Integrations

All three lead sources push structured JSON to dedicated webhook endpoints. No email parsing or AI needed — the data arrives pre-structured.

### 6.1 Angi Integration (Simplest — Do This First)

**Setup:**
1. Email `crmintegrations@angi.com` with:
   - Your company name: Brandenburg Plumbing, Heating & Air
   - Your Angi account Company ID (SPID)
   - Your webhook endpoint: `https://<project>.supabase.co/functions/v1/lead-angi`
2. Angi configures their side to POST JSON to your endpoint. Typically activated same day.

**Authentication:** Angi uses basic auth or an API key header. They'll provide credentials during setup. Store in environment variables.

**Webhook Receiver: `lead-angi` Edge Function**

```
POST /functions/v1/lead-angi
```

**Expected Angi JSON payload structure:**
```json
{
    "leadID": "12345678",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "5125551234",
    "email": "john@example.com",
    "address": {
        "street": "123 Main St",
        "city": "Marble Falls",
        "state": "TX",
        "zip": "78654"
    },
    "taskName": "Plumbing - Water Heater",
    "comments": "Need new water heater installed, current one is leaking",
    "spID": "your_angi_sp_id"
}
```

**Processing logic:**

1. **Authenticate request** — validate API key or basic auth header
2. **Log raw payload** to `webhook_log` with source `angi`
3. **Extract fields** directly from JSON (no parsing needed):
   - `first_name` ← `firstName`
   - `last_name` ← `lastName`
   - `phone` ← `phone` → normalize to E.164
   - `email` ← `email`
   - `job_type` ← map `taskName` to internal job type (see Job Type Mapping below)
   - `job_description` ← `comments`
   - `source_lead_id` ← `leadID`
4. **Deduplicate** — check `leads` table for same `phone_normalized` in last 24 hours
5. **Check suppression list**
6. **Create or match customer** by `phone_normalized`
7. **Write to `leads` table**
8. **Trigger speed-to-lead text** (see Section 7)
9. **Return 200** with success response to Angi

---

### 6.2 Thumbtack Integration (OAuth Required)

**Setup:**
1. Contact Thumbtack via the "Request Access" button on `developers.thumbtack.com` to get developer credentials (client_id, client_secret) for both staging and production
2. Implement OAuth 2.0 authorization code flow
3. Once authorized, register webhooks for your Thumbtack business to receive leads

**OAuth 2.0 Flow: `thumbtack-oauth` Edge Function**

This function handles three operations:

**A) Initiate Authorization (GET /functions/v1/thumbtack-oauth?action=authorize)**
```
Redirect user to:
https://auth.thumbtack.com/oauth2/auth
  ?client_id=<TT_CLIENT_ID>
  &redirect_uri=<YOUR_REDIRECT_URL>
  &response_type=code
  &scope=leads messages
```
Adam clicks this once to authorize your app to access Brandenburg's Thumbtack account.

**B) Handle Callback (GET /functions/v1/thumbtack-oauth?code=<AUTH_CODE>)**
```
POST https://auth.thumbtack.com/oauth2/token
Body: {
    grant_type: "authorization_code",
    code: <AUTH_CODE>,
    redirect_uri: <YOUR_REDIRECT_URL>,
    client_id: <TT_CLIENT_ID>,
    client_secret: <TT_CLIENT_SECRET>
}
Response: { access_token, refresh_token, expires_in, token_type }
```
Store tokens in `oauth_tokens` table.

**C) Refresh Token (POST /functions/v1/thumbtack-oauth with body {"action": "refresh"})**
```
POST https://auth.thumbtack.com/oauth2/token
Body: {
    grant_type: "refresh_token",
    refresh_token: <stored_refresh_token>,
    client_id: <TT_CLIENT_ID>,
    client_secret: <TT_CLIENT_SECRET>
}
```
Update tokens in `oauth_tokens` table. Called by pg_cron every 30 minutes.

**After OAuth, register webhooks via Thumbtack API:**
```
POST https://api.thumbtack.com/v2/webhooks
Headers: { Authorization: Bearer <access_token> }
Body: {
    url: "https://<project>.supabase.co/functions/v1/lead-thumbtack",
    events: ["negotiation.created", "message.created"]
}
```

**Webhook Receiver: `lead-thumbtack` Edge Function**

```
POST /functions/v1/lead-thumbtack
```

**Expected Thumbtack webhook payload structure:**
```json
{
    "leadID": "380497493950742534",
    "createTimestamp": "1747102856",
    "leadType": "ESTIMATION",
    "price": "$258/hour",
    "customer": {
        "customerID": "380497492389642246",
        "name": "John Smith"
    },
    "request": {
        "requestID": "380497493950742534",
        "category": "Plumbing",
        "title": "Water Heater Installation",
        "description": "Need new 50 gal water heater installed",
        "location": {
            "city": "Marble Falls",
            "state": "TX",
            "zipCode": "78654"
        },
        "details": [
            { "question": "What type of project?", "answer": "Install" },
            { "question": "Type of water heater?", "answer": "Tank" }
        ]
    },
    "business": {
        "businessID": "your_business_id",
        "name": "Brandenburg Plumbing, Heating & Air"
    }
}
```

**Processing logic:**

1. **Verify request** — validate the webhook signature or bearer token from Thumbtack
2. **Log raw payload** to `webhook_log` with source `thumbtack`
3. **Extract fields** from JSON:
   - `first_name` / `last_name` ← split `customer.name`
   - `phone` ← may require fetching from Thumbtack API using `customerID` (not always in webhook payload)
   - `job_type` ← map `request.category` + `request.title` to internal job type
   - `job_description` ← combine `request.description` + `request.details`
   - `source_lead_id` ← `leadID`
   - Address fields ← `request.location`
4. **If phone not in payload** → call Thumbtack API: `GET /v2/business/{businessID}/lead/{leadID}` to get full contact details
5. **Deduplicate** — check `leads` table for same `phone_normalized` in last 24 hours
6. **Check suppression list**
7. **Create or match customer** by `phone_normalized`
8. **Write to `leads` table**
9. **Trigger speed-to-lead text** (see Section 7)
10. **Return 200** to Thumbtack

**Thumbtack Two-Way Messaging (Bonus):**

After sending a speed-to-lead text via Twilio, also reply through Thumbtack's platform so the customer sees a response there too:
```
POST https://api.thumbtack.com/v2/business/{businessID}/lead/{leadID}/message
Headers: { Authorization: Bearer <access_token> }
Body: { "text": "Hi John, thanks for reaching out! We'll be in touch shortly." }
```
This keeps the Thumbtack conversation active and improves your response time metrics on Thumbtack.

---

### 6.3 Google LSA Integration

**Setup:**
1. Go to Google API Console → create project → enable Local Services API
2. Set up OAuth 2.0 credentials (similar flow to Thumbtack)
3. Configure lead form webhook URL in Google Ads → Local Services → Settings
4. Set webhook URL to: `https://<project>.supabase.co/functions/v1/lead-lsa`
5. Google provides a `google_key` for webhook verification

**Webhook Receiver: `lead-lsa` Edge Function**

```
POST /functions/v1/lead-lsa
```

**Expected Google LSA webhook payload structure:**
```json
{
    "lead_id": "abc123def456",
    "api_version": "1.0",
    "form_id": 12345,
    "campaign_id": 67890,
    "google_key": "your_verification_key",
    "is_test": false,
    "gcl_id": "click_id_123",
    "user_column_data": [
        { "column_id": "FULL_NAME", "string_value": "John Smith", "column_name": "Full Name" },
        { "column_id": "PHONE_NUMBER", "string_value": "+15125551234", "column_name": "Phone Number" },
        { "column_id": "EMAIL", "string_value": "john@example.com", "column_name": "Email" },
        { "column_id": "POSTAL_CODE", "string_value": "78654", "column_name": "Zip Code" },
        { "column_id": "STREET_ADDRESS", "string_value": "123 Main St", "column_name": "Street Address" }
    ],
    "lead_submit_time": "2026-02-26T12:30:00Z"
}
```

**Processing logic:**

1. **Verify request** — validate `google_key` matches your stored verification key
2. **Log raw payload** to `webhook_log` with source `google_lsa`
3. **Extract fields** from `user_column_data` array:
   ```typescript
   const getField = (columnId: string): string | null => {
       const field = payload.user_column_data.find(d => d.column_id === columnId);
       return field ? field.string_value : null;
   };

   const fullName = getField("FULL_NAME"); // split into first/last
   const phone = getField("PHONE_NUMBER");
   const email = getField("EMAIL");
   const zip = getField("POSTAL_CODE");
   const address = getField("STREET_ADDRESS");
   ```
4. **Ignore test leads** — if `is_test === true`, log but don't process
5. **Deduplicate** by `lead_id` (Google recommends using `lead_id` for dedup)
6. **Check suppression list**
7. **Create or match customer** by `phone_normalized`
8. **Write to `leads` table**
9. **Trigger speed-to-lead text** (see Section 7)
10. **Return 200** to Google (or 204 for success, 400/500 for errors per Google's spec)

**Important:** Google webhook payloads may not always contain both phone and email. If a lead arrives without a phone number, log it with `status: 'no_phone'` and skip the auto-response. It will appear in the dashboard for manual follow-up.

---

### 6.4 Job Type Mapping

All three lead sources use different naming for services. Map them to internal job types:

```typescript
const JOB_TYPE_MAP: Record<string, string> = {
    // Thumbtack categories
    "Plumbing": "general_plumbing",
    "Water Heater Installation": "water_heater",
    "Water Heater Repair": "water_heater",
    "Drain Cleaning": "drain_cleaning",
    "Faucet Repair": "faucet_repair",
    "Toilet Repair": "toilet_repair",
    "Garbage Disposal": "garbage_disposal",
    "Gas Line": "gas_line",
    "Sewer Line": "sewer_line",
    "HVAC Repair": "hvac_service",
    "AC Repair": "ac_repair",
    "Furnace Repair": "furnace_repair",
    "HVAC Installation": "hvac_install",

    // Angi task names
    "Plumbing - Water Heater": "water_heater",
    "Plumbing - Drain Cleaning": "drain_cleaning",
    "Plumbing - Faucet": "faucet_repair",
    "Plumbing - Toilet": "toilet_repair",
    "Plumbing - General": "general_plumbing",
    "HVAC - Repair": "hvac_service",
    "HVAC - Install": "hvac_install",
    "HVAC - Maintenance": "hvac_service",

    // Google LSA — category may come from campaign/service type
    // These may need to be refined once you see real payloads
};

function mapJobType(rawType: string): string {
    // Try exact match first
    if (JOB_TYPE_MAP[rawType]) return JOB_TYPE_MAP[rawType];

    // Try case-insensitive partial match
    const lower = rawType.toLowerCase();
    if (lower.includes("water heater")) return "water_heater";
    if (lower.includes("drain")) return "drain_cleaning";
    if (lower.includes("sewer")) return "sewer_line";
    if (lower.includes("faucet")) return "faucet_repair";
    if (lower.includes("toilet")) return "toilet_repair";
    if (lower.includes("garbage") || lower.includes("disposal")) return "garbage_disposal";
    if (lower.includes("gas line")) return "gas_line";
    if (lower.includes("hvac") && lower.includes("install")) return "hvac_install";
    if (lower.includes("ac ") || lower.includes("air condition")) return "ac_repair";
    if (lower.includes("furnace") || lower.includes("heating")) return "furnace_repair";
    if (lower.includes("hvac")) return "hvac_service";
    if (lower.includes("plumb")) return "general_plumbing";

    return "other";
}
```

Store the mapping in a separate utility file so it's easy to update as you see real lead data come in.

---

## 7. Speed-to-Lead Auto-Responder

### Shared Logic: `triggerSpeedToLead()`

This is called by all three lead webhook handlers after they've parsed and stored the lead. It's a shared utility function, NOT a separate Edge Function.

```typescript
async function triggerSpeedToLead(lead: Lead, customer: Customer): Promise<void> {
    // 1. Verify not a duplicate (already checked by caller, but double-check)
    // 2. Verify not suppressed (already checked by caller, but double-check)

    // 3. Select message template based on source
    const template = SPEED_TO_LEAD_TEMPLATES[lead.source];

    // 4. Render template
    const body = renderTemplate(template, {
        first_name: customer.first_name,
        job_type: formatJobType(lead.job_type), // "water heater" not "water_heater"
    });

    // 5. Send immediately via send-message function
    await sendMessage({
        customer_id: customer.id,
        phone: customer.phone_normalized,
        body: body,
        source: 'speed_to_lead',
    });

    // 6. Update lead record
    await supabase.from('leads').update({
        auto_response_sent: true,
        auto_response_sent_at: new Date().toISOString(),
        status: 'contacted'
    }).eq('id', lead.id);
}
```

### Speed-to-Lead Message Templates

```typescript
const SPEED_TO_LEAD_TEMPLATES: Record<string, string> = {

    thumbtack: `Hi {{first_name}}, this is Brandenburg Plumbing, Heating & Air! We just received your Thumbtack request for {{job_type}}. We've been serving the Hill Country for over 109 years and we'd love to help. Can we call you today to discuss? Reply STOP to opt out.`,

    angi: `Hi {{first_name}}, thanks for reaching out through Angi! This is Brandenburg Plumbing, Heating & Air. We saw your request for {{job_type}} and have availability this week. When would be a good time to call? Reply STOP to opt out.`,

    lsa: `Hi {{first_name}}, this is Brandenburg Plumbing, Heating & Air. We received your request through Google for {{job_type}}. As a Google Guaranteed provider, we'd love to take care of this for you. When works best for a call? Reply STOP to opt out.`,

};
```

### Human-Readable Job Type Formatting

```typescript
const JOB_TYPE_DISPLAY: Record<string, string> = {
    "water_heater": "water heater service",
    "drain_cleaning": "drain cleaning",
    "sewer_line": "sewer line service",
    "faucet_repair": "faucet repair",
    "toilet_repair": "toilet repair",
    "garbage_disposal": "garbage disposal service",
    "gas_line": "gas line service",
    "hvac_service": "HVAC service",
    "hvac_install": "HVAC installation",
    "ac_repair": "AC repair",
    "furnace_repair": "furnace repair",
    "general_plumbing": "plumbing service",
    "general_hvac": "HVAC service",
    "other": "service request",
};

function formatJobType(jobType: string): string {
    return JOB_TYPE_DISPLAY[jobType] || "service request";
}
```

---

## 8. Estimate Follow-Up Sequences

### Trigger

ServiceTitan webhook: job updated with estimate present, OR job has `has_estimate = true` on creation.

### Sequence Template: `estimate_followup`

| Step | Delay | Message |
|------|-------|---------|
| 1 | 2 hours | `Hi {{first_name}}, this is {{technician_name}} from Brandenburg. Just following up on the {{job_type}} estimate I put together for you. Do you have any questions I can answer?` |
| 2 | 1 day | `Hi {{first_name}}, just checking in on your {{job_type}} estimate from Brandenburg. We have availability this week if you'd like to get it scheduled. Any questions?` |
| 3 | 3 days | `Hi {{first_name}}, wanted to make sure your {{job_type}} estimate didn't slip through the cracks. We're happy to walk through the details anytime. Just reply here or call us at (830) 693-5868.` |
| 4 | 7 days | `Hi {{first_name}}, this is Brandenburg Plumbing, Heating & Air. Your {{job_type}} estimate is still available. If your needs have changed or you'd like an updated quote, just let us know. We're here to help!` |

### Cancellation Triggers

Stop the sequence immediately if:
- Job status changes to `scheduled` (booked) → cancel reason: `job_booked`
- Job status changes to `canceled` → cancel reason: `job_canceled`
- Customer replies STOP → cancel reason: `customer_opted_out`
- A higher-priority sequence starts for same customer → cancel reason: `higher_priority_sequence`

### Starting a Sequence (Reusable Logic)

This logic is shared by all sequence types:

```
function startSequence(customerId, templateName, jobId?, leadId?, templateVars?) {
    1. Check if customer has an active sequence
       - If yes and new sequence has HIGHER priority (lower number) → cancel existing sequence
       - If yes and new sequence has LOWER priority → do not start, return early
       - If yes and SAME priority → do not start (already in this sequence type)

    2. Create active_sequence record with status 'active'

    3. For each step in sequence_template:
       - Render message body by replacing {{vars}} with templateVars
       - Calculate send_at = sequence start time + step.delay_minutes
       - Adjust for business hours (8am-7pm CT):
         - If send_at falls before 8am → move to 8am same day
         - If send_at falls after 7pm → move to 8am next day
       - Insert into pending_messages

    4. Return active_sequence.id
}
```

---

## 9. Review Request Automation

### Trigger

ServiceTitan webhook: `Job.Completed`

### Sequence Template: `review_request`

| Step | Delay | Message |
|------|-------|---------|
| 1 | 2 hours | `Hi {{first_name}}, thanks for choosing Brandenburg! We hope {{technician_name}} took great care of you today. Would you mind taking 30 seconds to leave us a review? It really helps our family business. {{review_link}}` |
| 2 | 3 days | `Hi {{first_name}}, just a quick reminder — if you have a moment, we'd really appreciate a review of your recent {{job_type}} service. Thank you! {{review_link}}` |

### Template Variables

- `{{review_link}}` — Direct Google review link. Format: `https://search.google.com/local/writereview?placeid=<YOUR_GOOGLE_PLACE_ID>`
- Get the Place ID from Google Business Profile

### Rules

- Do NOT send review request if job total was $0 (warranty/callback work)
- Do NOT send review request if job was canceled
- Do NOT send if customer already has an active review_request sequence in the last 90 days
- Cancel if customer replies (any response = engagement, don't pester)

---

## 10. Membership & Maintenance Reminders

### Trigger

pg_cron job runs weekly (Monday 9am CT). Queries ServiceTitan API for:
- Customers with active memberships whose last service was 6+ months ago
- Seasonal relevance: HVAC maintenance in spring (March-April) and fall (September-October)

### Sequence Template: `maintenance_reminder`

| Step | Delay | Message |
|------|-------|---------|
| 1 | 0 (immediate) | `Hi {{first_name}}, this is Brandenburg Plumbing, Heating & Air. As a valued membership customer, you're due for your {{service_type}} maintenance visit. Want us to get you on the schedule? Just reply YES or call us at (830) 693-5868.` |
| 2 | 3 days | `Hi {{first_name}}, just following up on your maintenance reminder. We have availability this week and next. Reply YES to schedule or call (830) 693-5868.` |

### Rules

- Maximum 1 maintenance reminder per customer per 90 days
- Only send during relevant season for the service type
- Do NOT send to customers with an open/active job

---

## 11. Dashboard UI

### New Pages to Add to Existing React Dashboard

All pages read from Supabase using the existing Supabase client. Use Supabase Realtime subscriptions where live updates are valuable.

### 11.1 Lead Inbox (`/leads`)

**Purpose:** See all incoming leads, their source, status, and whether auto-response was sent.

**Layout:**
- Filterable table with columns: Date, Name, Phone, Source (Thumbtack/Angi/LSA), Job Type, Status, Auto-Response
- Source icons/badges to quickly identify where the lead came from
- Status badges: New (blue), Contacted (yellow), Booked (green), Lost (gray), Duplicate (gray strikethrough), No Phone (orange)
- Click row to expand: full job description, raw webhook payload, linked messages
- Filter by: source, status, date range
- Sort by: newest first (default)

**Real-time:** Subscribe to `leads` table inserts for live updates when new leads come in.

### 11.2 Message Log (`/messages`)

**Purpose:** See every message sent and received, with delivery status.

**Layout:**
- Chronological feed grouped by customer
- Each message shows: timestamp, direction (→ outbound / ← inbound), body, channel (RCS/SMS), delivery status
- Status indicators: Sent (gray), Delivered (blue), Read (green), Failed (red)
- Filter by: direction, source (speed-to-lead, estimate followup, review request, membership), status, date range
- Search by customer name or phone

### 11.3 Sequence Manager (`/sequences`)

**Purpose:** View active sequences, edit templates, see performance.

**Two tabs:**

**Active Sequences tab:**
- Table: Customer Name, Sequence Type, Current Step, Started, Next Message Due
- Actions: Pause, Cancel, View Details
- Status filters: Active, Completed, Canceled

**Templates tab:**
- List of sequence templates with steps
- Edit message templates inline
- Toggle templates active/inactive
- Preview rendered message with sample data

### 11.4 System Health (`/system`)

**Purpose:** The daily coffee dashboard — glance and know everything's working.

**Metrics cards (today):**
- Leads Received (with breakdown by source)
- Auto-Responses Sent
- Follow-Ups Sent
- Review Requests Sent
- Delivery Rate (delivered / sent as percentage)
- Opt-Outs

**Alert banner:** Shows at top if any critical condition is met:
- 🔴 "Leads received but no auto-responses sent in last 2 hours" (outbound is broken)
- 🔴 "Message failure rate above 10% today" (Twilio issue)
- 🟡 "No leads received today" (weekday only — may indicate webhook is disconnected)
- 🟡 "ServiceTitan webhook not received in 24 hours" (webhook may be disconnected)
- 🟡 "Thumbtack OAuth token expiring soon" (refresh may have failed)

**Chart:** 7-day trend of leads received, messages sent, delivery rate (use Recharts)

### 11.5 OAuth Management (`/settings/integrations`)

**Purpose:** Manage OAuth connections for Thumbtack and Google LSA.

**Layout:**
- Card per integration: Thumbtack, Angi, Google LSA, ServiceTitan
- Status: Connected (green) / Disconnected (red) / Token Expiring (yellow)
- "Connect" button for Thumbtack/Google that initiates OAuth flow
- "Disconnect" button to revoke tokens
- Last webhook received timestamp per source
- Angi shows static "Connected" status with instructions to email Angi support if changes needed

---

## 12. Monitoring, Alerts & Daily Digest

### Sentry Integration

Install `@sentry/deno` in Edge Functions. Initialize in each function:

```typescript
import * as Sentry from "@sentry/deno";
Sentry.init({ dsn: SENTRY_DSN });
```

Wrap all Edge Function handlers in try/catch that reports to Sentry.

### UptimeRobot

Set up HTTP monitors for each Edge Function endpoint. Ping every 5 minutes:
- `GET /functions/v1/lead-angi` (health check)
- `GET /functions/v1/lead-thumbtack` (health check)
- `GET /functions/v1/lead-lsa` (health check)
- `GET /functions/v1/st-webhook` (health check)
- `GET /functions/v1/process-queue` (health check)

Each function should respond to GET with `200 OK` and `{"status": "healthy"}`.

### Daily Digest: `daily-digest` Edge Function

Runs at 8:00 AM CT via pg_cron.

**Compiles yesterday's metrics from `system_metrics` table and sends via SMS to Adam's phone:**

```
📊 Brandenburg Daily Digest — {{date}}

Leads: {{leads_received}} (TT: {{thumbtack}}, Angi: {{angi}}, LSA: {{lsa}})
Auto-Responses: {{auto_responses_sent}}
Follow-Ups: {{followups_sent}}
Review Requests: {{review_requests_sent}}
Delivered: {{messages_delivered}}/{{messages_sent}} ({{delivery_rate}}%)
Opt-Outs: {{opt_outs}}
Sequences: {{sequences_started}} started, {{sequences_canceled_booked}} booked ✅

{{#if alerts}}
⚠️ ALERTS:
{{alerts}}
{{/if}}
```

### Critical Alerts (Immediate, Not Just Daily)

These fire as soon as detected (checked by `process-queue` every 60 seconds):

| Condition | Alert |
|-----------|-------|
| Lead received but auto-response failed to send | SMS to Adam: "⚠️ Speed-to-lead failed for {{name}} ({{phone}}). Check lead-{{source}} function." |
| Message failure rate > 20% in last hour | SMS to Adam: "🔴 High message failure rate. {{failed}}/{{sent}} failed in last hour. Check Twilio." |
| No ServiceTitan webhook received in 24 hours (weekday) | SMS to Adam: "🟡 No ST webhooks in 24h. Check ServiceTitan integration." |
| Thumbtack token refresh failed | SMS to Adam: "🔴 Thumbtack OAuth refresh failed. Re-authorize at /settings/integrations." |
| Edge Function error in Sentry | Sentry sends its own notification (configure in Sentry dashboard) |

---

## 13. Phased Implementation Plan

### Phase 1: Database Schema + Seed Data
- Run all CREATE TABLE statements
- Enable pg_cron extension
- Insert seed data for `sequence_templates` and `sequence_steps` (use the message templates from sections 7-10)
- Verify tables exist and relationships work

### Phase 2: ServiceTitan Webhook Receiver
- Build `st-webhook` Edge Function
- Implement HMAC signature verification
- Handle Job.Created, Job.Updated, Job.Completed, Job.Canceled events
- Write to `webhook_log`, `customers`, `jobs` tables
- Test with sample payloads manually

### Phase 3: Twilio Messaging Layer
- Build `send-message` Edge Function
- Build `twilio-status` Edge Function (delivery callbacks)
- Build `twilio-inbound` Edge Function (incoming texts + STOP handling)
- Implement suppression list check
- Implement business hours check
- Test by sending a message to Adam's phone

### Phase 4: Angi Lead Webhook + Speed-to-Lead
- Build `lead-angi` Edge Function
- Implement authentication (API key/basic auth from Angi)
- Implement job type mapping
- Implement deduplication logic
- Wire up: Angi POST → parse JSON → create lead → create/match customer → send instant text
- Email `crmintegrations@angi.com` to set up the webhook
- Test with real Angi lead once configured

### Phase 5: Thumbtack Lead Webhook + Speed-to-Lead
- Build `thumbtack-oauth` Edge Function (authorize, callback, refresh)
- Build `lead-thumbtack` Edge Function
- Implement OAuth 2.0 authorization code flow
- Register webhooks with Thumbtack API
- Implement lead parsing from Thumbtack payload
- Implement optional two-way Thumbtack messaging
- Set up pg_cron token refresh
- Test end-to-end with staging credentials first, then production

### Phase 6: Google LSA Lead Webhook + Speed-to-Lead
- Set up Google API Console project + OAuth credentials
- Build `lead-lsa` Edge Function
- Implement `google_key` verification
- Implement `user_column_data` parsing
- Configure webhook URL in Google Ads console
- Handle edge cases (no phone, test leads)
- Test with Google's test lead feature

### Phase 7: Sequence Engine
- Build `startSequence()` shared logic
- Build `process-queue` Edge Function
- Configure pg_cron to call process-queue every 60 seconds
- Implement business hours delay logic
- Implement sequence cancellation on job status change
- Wire up estimate follow-up: ST webhook → new estimate → start sequence
- Test full flow: estimate created → messages sent on schedule → job booked → sequence canceled

### Phase 8: Review Request Automation
- Wire up: Job.Completed → start review_request sequence
- Add 90-day check (don't re-request)
- Add $0 job check
- Test full flow

### Phase 9: Membership Reminders
- Build weekly membership check (pg_cron → query ST API)
- Wire up maintenance_reminder sequence
- Test with sample membership data

### Phase 10: Dashboard UI
- Build Lead Inbox page
- Build Message Log page
- Build Sequence Manager page
- Build System Health page
- Build OAuth/Integrations settings page
- Connect all to Supabase with real-time subscriptions

### Phase 11: Monitoring & Alerts
- Integrate Sentry in all Edge Functions
- Set up UptimeRobot monitors
- Build `daily-digest` Edge Function
- Build critical alert logic in process-queue
- Configure pg_cron for daily digest

### Phase 12: Testing Suite
- Write tests for Angi payload parsing
- Write tests for Thumbtack payload parsing
- Write tests for Google LSA payload parsing
- Write tests for job type mapping
- Write tests for sequence logic (start, cancel, priority, business hours)
- Write tests for suppression list (STOP/START)
- Write tests for deduplication
- Write tests for rate limiting
- Write tests for OAuth token refresh

---

## 14. Testing Strategy

### Test Framework

Use Deno's built-in test runner for Edge Functions, and Vitest for React components.

### Critical Test Cases

**Lead Webhook Parsing (save real payloads as fixtures once you have them):**
- `test_angi_standard.ts` — standard Angi lead JSON
- `test_angi_missing_phone.ts` — Angi lead without phone (should log warning)
- `test_angi_missing_email.ts` — Angi lead without email (should still process)
- `test_angi_auth_failure.ts` — invalid API key (should return 401)
- `test_thumbtack_standard.ts` — standard Thumbtack negotiation webhook
- `test_thumbtack_name_split.ts` — handles single-word names, hyphenated names
- `test_thumbtack_no_phone_in_payload.ts` — triggers API call to fetch phone
- `test_lsa_standard.ts` — standard Google LSA lead form webhook
- `test_lsa_test_lead.ts` — `is_test: true` lead gets logged but not processed
- `test_lsa_no_phone.ts` — lead without PHONE_NUMBER column (marked no_phone)
- `test_lsa_invalid_google_key.ts` — invalid key returns 403

**Job Type Mapping:**
- `test_job_type_exact_match.ts` — exact Angi task name maps correctly
- `test_job_type_partial_match.ts` — partial string match works
- `test_job_type_unknown.ts` — unknown type maps to "other"

**Sequence Logic:**
- `test_start_sequence_no_existing.ts` — starts normally
- `test_start_sequence_same_priority.ts` — does NOT start if same type already active
- `test_start_sequence_higher_priority.ts` — cancels existing, starts new
- `test_start_sequence_lower_priority.ts` — does NOT start
- `test_cancel_on_booking.ts` — sequence cancels when job status → scheduled
- `test_business_hours_delay.ts` — message at 10pm CT gets delayed to 8am
- `test_business_hours_pass.ts` — message at 2pm CT sends immediately

**Suppression:**
- `test_stop_keyword.ts` — STOP, Stop, stop, UNSUBSCRIBE all trigger suppression
- `test_start_keyword.ts` — START re-subscribes
- `test_suppressed_no_send.ts` — message to suppressed number is skipped

**Deduplication:**
- `test_duplicate_lead_24h.ts` — same phone within 24h → marked duplicate
- `test_duplicate_lead_25h.ts` — same phone after 24h → treated as new lead
- `test_duplicate_cross_source.ts` — same phone from Angi then Thumbtack within 24h → second is duplicate

**Rate Limiting:**
- `test_rate_limit_blocks.ts` — second non-STL message within 4h is delayed
- `test_rate_limit_allows_stl.ts` — speed-to-lead bypasses rate limit

**OAuth:**
- `test_thumbtack_token_refresh.ts` — refresh token flow works
- `test_thumbtack_token_expired.ts` — expired token triggers refresh before API call
- `test_thumbtack_refresh_failure.ts` — failed refresh triggers alert

---

## 15. Environment Variables & Secrets

Store all secrets in Supabase Edge Function secrets (`supabase secrets set`).

```
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
TWILIO_PHONE_NUMBER=+18305551234

# ServiceTitan
ST_APP_KEY=xxxxxxxxxx
ST_CLIENT_ID=xxxxxxxxxx
ST_CLIENT_SECRET=xxxxxxxxxx
ST_TENANT_ID=xxxxxxxxxx
ST_WEBHOOK_HMAC_KEY=xxxxxxxxxx

# Thumbtack
TT_CLIENT_ID=xxxxxxxxxx
TT_CLIENT_SECRET=xxxxxxxxxx
TT_REDIRECT_URI=https://<project>.supabase.co/functions/v1/thumbtack-oauth
TT_WEBHOOK_SECRET=xxxxxxxxxx  # if Thumbtack provides webhook signing

# Angi
ANGI_API_KEY=xxxxxxxxxx  # or basic auth credentials provided by Angi
ANGI_SPID=xxxxxxxxxx  # your Angi Company ID

# Google LSA
GOOGLE_LSA_WEBHOOK_KEY=xxxxxxxxxx  # google_key for webhook verification
GOOGLE_CLIENT_ID=xxxxxxxxxx  # for OAuth if using Google Ads API
GOOGLE_CLIENT_SECRET=xxxxxxxxxx

# Sentry
SENTRY_DSN=https://xxxxxxxxxx@sentry.io/xxxxxxxxxx

# App Config
ADMIN_PHONE=+1xxxxxxxxxx  # Adam's phone for alerts/digest
GOOGLE_PLACE_ID=xxxxxxxxxx  # For review request links
BUSINESS_PHONE=(830) 693-5868
TIMEZONE=America/Chicago

# Supabase (auto-available in Edge Functions)
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically available
```

---

## 16. Error Handling Conventions

### Every Edge Function follows this pattern:

```typescript
import { serve } from "https://deno.land/std/http/server.ts";
import * as Sentry from "@sentry/deno";

Sentry.init({ dsn: Deno.env.get("SENTRY_DSN") });

serve(async (req: Request) => {
    // Health check
    if (req.method === "GET") {
        return new Response(JSON.stringify({ status: "healthy" }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // 1. Log incoming webhook/request to webhook_log
        // 2. Validate/authenticate request
        // 3. Process
        // 4. Return 200

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        Sentry.captureException(error);

        // Log error to webhook_log
        await supabase.from("webhook_log").insert({
            source: "function_name",
            event_type: "error",
            payload: { error: error.message, stack: error.stack },
            processing_status: "failed",
            error_message: error.message
        });

        // Still return 200 to prevent webhook retries for unrecoverable errors
        // Return 500 only if the error is transient and retry would help
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
```

### Retry Philosophy

- **ServiceTitan webhooks:** Return 200 after logging even if processing fails. Process from webhook_log on retry. ST retries at 10, 30, 60, 300s — you don't want duplicate processing.
- **Thumbtack webhooks:** Same approach — log and acknowledge immediately.
- **Angi webhooks:** Return 200 on success. Angi may not have robust retry logic, so log everything.
- **Google LSA webhooks:** Return appropriate HTTP codes per Google's spec (200/204 success, 4xx for client errors, 5xx for transient errors that should be retried).
- **Twilio sends:** If Twilio API call fails, update pending_message with `attempt_count + 1` and `error_message`. The next pg_cron cycle will retry up to 3 times. After 3 failures, mark as `failed` and fire a critical alert.
- **OAuth token refresh:** If refresh fails, fire an immediate alert. Do NOT delete the existing tokens — they may still be valid. Retry on next pg_cron cycle.

---

## Appendix A: Phone Number Normalization

Use this everywhere a phone number is stored or compared:

```typescript
function normalizePhone(phone: string): string | null {
    if (!phone) return null;

    // Strip everything except digits
    const digits = phone.replace(/\D/g, '');

    // Handle US numbers
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }

    // Already in E.164 format
    if (phone.startsWith('+1') && digits.length === 11) {
        return `+${digits}`;
    }

    // Return null if not a valid US number
    return null;
}
```

Always store `phone_normalized` in E.164 format (`+15125551234`). Always compare on `phone_normalized`, never on raw phone input.

---

## Appendix B: Advantages of Direct Webhooks Over Email Parsing

This system uses direct API/webhook integrations with all three lead sources instead of email forwarding + AI parsing. Here's why:

| Factor | Email Parsing (Old Approach) | Direct Webhooks (This Approach) |
|--------|------------------------------|----------------------------------|
| Speed | 30-120 seconds (email delivery + parse) | < 5 seconds (direct POST) |
| Reliability | Fragile — platforms change email formats | Stable — structured JSON contracts |
| Data quality | AI parsing can misread names/phones | Exact fields, no ambiguity |
| Maintenance | Must update parser when email format changes | Only update if API version changes (rare, versioned) |
| Cost | Claude API cost per lead (~$0.01-0.05) | Free (no AI needed) |
| Dependencies | SendGrid Inbound Parse + Claude API | None beyond the webhook itself |
| Debugging | Raw email bodies, hard to trace issues | Raw JSON payloads, easy to inspect |
