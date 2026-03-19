-- Speed-to-Lead Follow-Up System
-- Creates all tables for the unified inbox, AI engine, drip sequences, and webhook processing

-- ============================================================
-- CUSTOMERS — Central customer record, dedup anchor by phone_e164
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    source TEXT, -- angi, thumbtack, lsa, website, inbound_sms, email
    servicetitan_customer_id TEXT,
    tags TEXT[] DEFAULT '{}',
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_customers_phone ON customers (phone_e164);
CREATE INDEX idx_customers_last_message ON customers (last_message_at DESC);
CREATE INDEX idx_customers_source ON customers (source);

-- ============================================================
-- CONVERSATIONS — Each lead/interaction thread
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'new',
        -- new, ai_active, qualifying, booking, booked, closed_won, closed_lost
    source TEXT, -- angi, thumbtack, lsa, website, inbound_sms, email
    source_lead_id TEXT, -- external lead ID from the source platform
    service_type TEXT,
    ai_enabled BOOLEAN DEFAULT TRUE,
    ai_turn_count INTEGER DEFAULT 0,
    assigned_to TEXT, -- staff email if manually assigned
    servicetitan_job_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_customer ON conversations (customer_id);
CREATE INDEX idx_conversations_status ON conversations (status);
CREATE INDEX idx_conversations_source ON conversations (source);
CREATE INDEX idx_conversations_created ON conversations (created_at DESC);

-- ============================================================
-- MESSAGES — Every SMS sent/received
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    direction TEXT NOT NULL, -- inbound, outbound
    sender TEXT NOT NULL, -- ai_chris, customer, staff, drip_system, system
    channel TEXT NOT NULL DEFAULT 'sms', -- sms, rcs, email, angi_lead, thumbtack_lead, lsa_lead, website_form
    body TEXT NOT NULL,
    twilio_sid TEXT,
    delivery_status TEXT DEFAULT 'queued', -- queued, sent, delivered, failed, undelivered
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX idx_messages_customer ON messages (customer_id, created_at);
CREATE UNIQUE INDEX idx_messages_twilio_sid ON messages (twilio_sid) WHERE twilio_sid IS NOT NULL;

-- ============================================================
-- DRIP_SEQUENCES — Template definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS drip_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 5, -- lower = higher priority
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DRIP_STEPS — Steps within sequences
-- ============================================================
CREATE TABLE IF NOT EXISTS drip_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES drip_sequences(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    delay_minutes INTEGER NOT NULL, -- delay from enrollment or previous step
    message_template TEXT NOT NULL, -- supports {{merge_fields}}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drip_steps_sequence ON drip_steps (sequence_id, step_number);

-- ============================================================
-- DRIP_ENROLLMENTS — Active customer enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS drip_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sequence_id UUID NOT NULL REFERENCES drip_sequences(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    current_step INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed, cancelled
    merge_data JSONB DEFAULT '{}', -- {{first_name}}, {{service_type}}, etc.
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT
);

CREATE INDEX idx_drip_enrollments_customer ON drip_enrollments (customer_id);
CREATE INDEX idx_drip_enrollments_status ON drip_enrollments (status) WHERE status = 'active';

-- ============================================================
-- PENDING_DRIP_MESSAGES — Queue of scheduled drip messages
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_drip_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES drip_enrollments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES drip_steps(id) ON DELETE CASCADE,
    message_body TEXT NOT NULL, -- rendered template
    send_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, cancelled, failed
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pending_drips_queue ON pending_drip_messages (send_at) WHERE status = 'pending';
CREATE INDEX idx_pending_drips_enrollment ON pending_drip_messages (enrollment_id);

-- ============================================================
-- WEBHOOK_EVENTS — Raw log of every inbound webhook
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- angi, thumbtack, lsa, servicetitan, twilio_inbound, twilio_status
    idempotency_key TEXT,
    raw_payload JSONB NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, failed, dead_letter
    processing_error TEXT,
    attempts INTEGER DEFAULT 0,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_source ON webhook_events (source, idempotency_key);
CREATE INDEX idx_webhook_events_status ON webhook_events (processing_status) WHERE processing_status IN ('pending', 'failed');
CREATE INDEX idx_webhook_events_created ON webhook_events (created_at DESC);

-- ============================================================
-- STAFF_NOTIFICATIONS — Notification records
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- ai_booking, ai_handoff, speed_to_lead_failure, high_failure_rate, daily_digest
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_unread ON staff_notifications (read, created_at DESC) WHERE read = FALSE;

-- ============================================================
-- SUPPRESSION_LIST — TCPA opt-out tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 TEXT NOT NULL,
    reason TEXT DEFAULT 'opt_out', -- opt_out, complaint, dead_number
    source TEXT, -- twilio_stop, manual, complaint
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_suppression_phone ON suppression_list (phone_e164);

-- ============================================================
-- OAUTH_TOKENS — Thumbtack + Google LSA OAuth tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- thumbtack, google_lsa
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ,
    scopes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_oauth_provider ON oauth_tokens (provider);

-- ============================================================
-- SYSTEM_METRICS — Daily rollup counters
-- ============================================================
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_metrics_date_name ON system_metrics (date, metric_name);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update customers.last_message_at and unread_count on new message
CREATE OR REPLACE FUNCTION update_customer_message_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET
        last_message_at = NEW.created_at,
        unread_count = CASE
            WHEN NEW.direction = 'inbound' THEN unread_count + 1
            ELSE unread_count
        END,
        updated_at = NOW()
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_customer_message_stats
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_message_stats();

-- Update conversations.updated_at on status change
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_timestamp
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Update customers.updated_at on change
CREATE OR REPLACE FUNCTION update_customer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_customer_timestamp
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_timestamp();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_drip_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Service role (backend) can do everything
CREATE POLICY "service_role_all" ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON drip_sequences FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON drip_steps FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON drip_enrollments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON pending_drip_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON webhook_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON staff_notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON suppression_list FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON oauth_tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON system_metrics FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users (admin dashboard) can read/update most tables
CREATE POLICY "auth_read" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON conversations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON conversations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON drip_sequences FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON drip_steps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON drip_enrollments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON drip_enrollments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON pending_drip_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON staff_notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON staff_notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON suppression_list FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_insert" ON suppression_list FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON system_metrics FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- ENABLE REALTIME for inbox UI
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_notifications;

-- ============================================================
-- SEED DATA — Drip sequences and steps
-- ============================================================

-- Estimate Follow-Up (priority 2)
INSERT INTO drip_sequences (slug, name, description, priority) VALUES
    ('estimate_followup', 'Estimate Follow-Up', 'Follow up on outstanding estimates', 2);

INSERT INTO drip_steps (sequence_id, step_number, delay_minutes, message_template)
SELECT id, step_number, delay_minutes, message_template
FROM drip_sequences, (VALUES
    (1, 120, 'Hi {{first_name}}, this is Chris from Brandenburg. Just following up on your {{service_type}} estimate. Any questions I can help with?'),
    (2, 1440, 'Hi {{first_name}}, checking in on your {{service_type}} estimate. We have availability this week. Want me to get you on the schedule?'),
    (3, 4320, 'Hi {{first_name}}, wanted to make sure your {{service_type}} estimate didn''t slip through the cracks. Happy to walk through the details — just reply here or call (512) 756-9847.'),
    (4, 10080, 'Hi {{first_name}}, your {{service_type}} estimate from Brandenburg is still available. If anything''s changed or you''d like an updated quote, just let us know!')
) AS steps(step_number, delay_minutes, message_template)
WHERE drip_sequences.slug = 'estimate_followup';

-- Review Request (priority 3)
INSERT INTO drip_sequences (slug, name, description, priority) VALUES
    ('review_request', 'Review Request', 'Request a review after job completion', 3);

INSERT INTO drip_steps (sequence_id, step_number, delay_minutes, message_template)
SELECT id, step_number, delay_minutes, message_template
FROM drip_sequences, (VALUES
    (1, 120, 'Hi {{first_name}}, thanks for choosing Brandenburg! We hope {{technician_name}} took great care of you. Would you mind leaving us a quick review? {{review_link}}'),
    (2, 4320, 'Hi {{first_name}}, quick reminder — if you have a moment, we''d really appreciate a review of your recent {{service_type}} service. Thank you! {{review_link}}')
) AS steps(step_number, delay_minutes, message_template)
WHERE drip_sequences.slug = 'review_request';

-- Membership Reminder (priority 4)
INSERT INTO drip_sequences (slug, name, description, priority) VALUES
    ('membership_reminder', 'Membership Reminder', 'Remind members about maintenance visits', 4);

INSERT INTO drip_steps (sequence_id, step_number, delay_minutes, message_template)
SELECT id, step_number, delay_minutes, message_template
FROM drip_sequences, (VALUES
    (1, 0, 'Hi {{first_name}}, this is Chris from Brandenburg. As a valued member, you''re due for your {{service_type}} maintenance visit. Want me to get you on the schedule? Reply YES or call (512) 756-9847.'),
    (2, 4320, 'Hi {{first_name}}, just following up on your maintenance reminder. We have availability this week. Reply YES to schedule or call (512) 756-9847.')
) AS steps(step_number, delay_minutes, message_template)
WHERE drip_sequences.slug = 'membership_reminder';
