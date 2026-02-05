-- Marketing Tables Migration
-- Creates raw_ad_spend and raw_servicetitan_jobs tables for marketing analytics

-- Raw ad spend data (imported from various ad platforms via third-party tools)
CREATE TABLE IF NOT EXISTS raw_ad_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- 'google', 'facebook', 'yelp', etc.
  date DATE NOT NULL,
  spend DECIMAL(10, 2) NOT NULL,
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  metadata JSONB DEFAULT '{}', -- Additional raw payload data from Airbyte/Portable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, date)
);

-- Create indexes for raw_ad_spend
CREATE INDEX idx_ad_spend_date ON raw_ad_spend(date DESC);
CREATE INDEX idx_ad_spend_platform ON raw_ad_spend(platform);

-- Raw ServiceTitan jobs data (synced from ServiceTitan API)
CREATE TABLE IF NOT EXISTS raw_servicetitan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL, -- ServiceTitan job ID
  job_number TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  technician_id TEXT,
  technician_name TEXT,
  job_type TEXT,
  business_unit TEXT,
  status TEXT NOT NULL, -- 'Completed', 'Canceled', 'In Progress', etc.
  total_amount DECIMAL(10, 2),
  completed_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ,
  booking_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- Full job object from ServiceTitan
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('Completed', 'Canceled', 'In Progress', 'Scheduled', 'Pending'))
);

-- Create indexes for raw_servicetitan_jobs
CREATE INDEX idx_jobs_job_id ON raw_servicetitan_jobs(job_id);
CREATE INDEX idx_jobs_completed_date ON raw_servicetitan_jobs(completed_date DESC);
CREATE INDEX idx_jobs_status ON raw_servicetitan_jobs(status);
CREATE INDEX idx_jobs_technician ON raw_servicetitan_jobs(technician_id);
CREATE INDEX idx_jobs_job_type ON raw_servicetitan_jobs(job_type);

-- Enable Row Level Security
ALTER TABLE raw_ad_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_servicetitan_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raw_ad_spend
CREATE POLICY "Authenticated users can read ad_spend" ON raw_ad_spend
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage ad_spend" ON raw_ad_spend
  FOR ALL TO service_role USING (true);

-- RLS Policies for raw_servicetitan_jobs
CREATE POLICY "Authenticated users can read jobs" ON raw_servicetitan_jobs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage jobs" ON raw_servicetitan_jobs
  FOR ALL TO service_role USING (true);
