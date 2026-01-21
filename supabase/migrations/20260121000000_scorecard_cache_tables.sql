-- Scorecard Cache Tables for ServiceTitan Integration
-- These tables cache data from ServiceTitan API to minimize API calls and handle rate limits

-- Cache table for technician period data (raw KPIs per time period)
CREATE TABLE IF NOT EXISTS technician_period_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  is_previous BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technician_cache_key ON technician_period_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_technician_cache_expires ON technician_period_cache(expires_at);

-- Cache table for pre-computed rankings responses
CREATE TABLE IF NOT EXISTS rankings_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rankings_cache_key ON rankings_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_rankings_cache_expires ON rankings_cache(expires_at);

-- Cache table for leads data
CREATE TABLE IF NOT EXISTS leads_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  is_previous BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_cache_key ON leads_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_leads_cache_expires ON leads_cache(expires_at);

-- Cache table for gross margin data
CREATE TABLE IF NOT EXISTS gross_margin_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gross_margin_cache_key ON gross_margin_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_gross_margin_cache_expires ON gross_margin_cache(expires_at);

-- Cache table for cancelled jobs
CREATE TABLE IF NOT EXISTS cancelled_jobs_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  days INTEGER NOT NULL,
  offset_days INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cancelled_jobs_cache_key ON cancelled_jobs_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cancelled_jobs_cache_expires ON cancelled_jobs_cache(expires_at);

-- Distributed lock table (for rate limiting across serverless instances)
CREATE TABLE IF NOT EXISTS api_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_key TEXT UNIQUE NOT NULL,
  lock_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_locks_key ON api_locks(lock_key);
CREATE INDEX IF NOT EXISTS idx_api_locks_expires ON api_locks(expires_at);

-- API request tracking (for rate limiting)
CREATE TABLE IF NOT EXISTS api_request_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_tracking_report ON api_request_tracking(report_id, window_start);
CREATE INDEX IF NOT EXISTS idx_api_tracking_expires ON api_request_tracking(expires_at);

-- Function to clean up expired cache entries (can be called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM technician_period_cache WHERE expires_at < NOW();
  DELETE FROM rankings_cache WHERE expires_at < NOW();
  DELETE FROM leads_cache WHERE expires_at < NOW();
  DELETE FROM gross_margin_cache WHERE expires_at < NOW();
  DELETE FROM cancelled_jobs_cache WHERE expires_at < NOW();
  DELETE FROM api_locks WHERE expires_at < NOW();
  DELETE FROM api_request_tracking WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
