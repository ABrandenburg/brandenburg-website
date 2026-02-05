-- ============================================
-- COMBINED MIGRATIONS FOR MARKETING & REVIEWS
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- MIGRATION 1: Marketing Tables
-- ============================================

-- Raw ad spend data (imported from various ad platforms via third-party tools)
CREATE TABLE IF NOT EXISTS raw_ad_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  spend DECIMAL(10, 2) NOT NULL,
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, date)
);

CREATE INDEX idx_ad_spend_date ON raw_ad_spend(date DESC);
CREATE INDEX idx_ad_spend_platform ON raw_ad_spend(platform);

-- Raw ServiceTitan jobs data
CREATE TABLE IF NOT EXISTS raw_servicetitan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  job_number TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  technician_id TEXT,
  technician_name TEXT,
  job_type TEXT,
  business_unit TEXT,
  status TEXT NOT NULL,
  total_amount DECIMAL(10, 2),
  completed_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ,
  booking_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('Completed', 'Canceled', 'In Progress', 'Scheduled', 'Pending'))
);

CREATE INDEX idx_jobs_job_id ON raw_servicetitan_jobs(job_id);
CREATE INDEX idx_jobs_completed_date ON raw_servicetitan_jobs(completed_date DESC);
CREATE INDEX idx_jobs_status ON raw_servicetitan_jobs(status);
CREATE INDEX idx_jobs_technician ON raw_servicetitan_jobs(technician_id);
CREATE INDEX idx_jobs_job_type ON raw_servicetitan_jobs(job_type);

ALTER TABLE raw_ad_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_servicetitan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ad_spend" ON raw_ad_spend
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage ad_spend" ON raw_ad_spend
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read jobs" ON raw_servicetitan_jobs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage jobs" ON raw_servicetitan_jobs
  FOR ALL TO service_role USING (true);

-- ============================================
-- MIGRATION 2: Reviews & Reputation Tables
-- ============================================

-- Technicians master table
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicetitan_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_technicians_servicetitan_id ON technicians(servicetitan_id);
CREATE INDEX idx_technicians_active ON technicians(active);

-- Review requests sent to customers
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  job_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  technician_id UUID REFERENCES technicians(id),
  technician_name TEXT,
  review_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sms_payload JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_review_request_status CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked'))
);

CREATE INDEX idx_review_requests_job_id ON review_requests(job_id);
CREATE INDEX idx_review_requests_status ON review_requests(status);
CREATE INDEX idx_review_requests_technician ON review_requests(technician_id);
CREATE INDEX idx_review_requests_sent_at ON review_requests(sent_at DESC);

-- Reviews received
CREATE TABLE IF NOT EXISTS reviews_received (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_id TEXT,
  technician_id UUID REFERENCES technicians(id),
  technician_name TEXT,
  customer_name TEXT,
  rating DECIMAL(2, 1) NOT NULL,
  review_text TEXT,
  review_date TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  response_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, external_id)
);

CREATE INDEX idx_reviews_platform ON reviews_received(platform);
CREATE INDEX idx_reviews_technician ON reviews_received(technician_id);
CREATE INDEX idx_reviews_rating ON reviews_received(rating DESC);
CREATE INDEX idx_reviews_date ON reviews_received(review_date DESC);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_received ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read technicians" ON technicians
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage technicians" ON technicians
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read review_requests" ON review_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage review_requests" ON review_requests
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read reviews" ON reviews_received
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage reviews" ON reviews_received
  FOR ALL TO service_role USING (true);

-- ============================================
-- MIGRATION 3: Analytics Materialized View
-- ============================================

-- Materialized view for technician performance
CREATE MATERIALIZED VIEW IF NOT EXISTS tech_performance_card AS
SELECT
  t.id AS technician_id,
  t.servicetitan_id,
  t.name AS technician_name,
  t.active,
  COUNT(DISTINCT j.job_id) AS total_jobs,
  SUM(j.total_amount) AS total_revenue,
  COUNT(DISTINCT rr.id) AS review_requests_sent,
  ROUND(
    CAST(COUNT(DISTINCT rr.id) AS DECIMAL) / NULLIF(COUNT(DISTINCT j.job_id), 0) * 100,
    2
  ) AS request_rate_percent,
  COUNT(DISTINCT r.id) AS reviews_received,
  ROUND(AVG(r.rating), 2) AS avg_rating,
  MAX(j.completed_date) AS last_job_date
FROM technicians t
LEFT JOIN raw_servicetitan_jobs j ON t.servicetitan_id = j.technician_id
  AND j.status = 'Completed'
  AND j.completed_date >= NOW() - INTERVAL '30 days'
LEFT JOIN review_requests rr ON rr.technician_id = t.id
  AND rr.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN reviews_received r ON r.technician_id = t.id
  AND r.review_date >= NOW() - INTERVAL '30 days'
WHERE t.active = true
GROUP BY t.id, t.servicetitan_id, t.name, t.active;

CREATE UNIQUE INDEX idx_tech_perf_tech_id ON tech_performance_card(technician_id);
CREATE INDEX idx_tech_perf_rating ON tech_performance_card(avg_rating DESC NULLS LAST);
CREATE INDEX idx_tech_perf_revenue ON tech_performance_card(total_revenue DESC NULLS LAST);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_tech_performance_card()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY tech_performance_card;
END;
$$;

GRANT EXECUTE ON FUNCTION refresh_tech_performance_card() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_tech_performance_card() TO service_role;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- You should now have:
-- - 5 new tables: raw_ad_spend, raw_servicetitan_jobs, technicians, review_requests, reviews_received
-- - 1 materialized view: tech_performance_card
-- - 1 function: refresh_tech_performance_card()
-- ============================================
