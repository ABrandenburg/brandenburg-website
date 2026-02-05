-- Reviews & Reputation Tables Migration
-- Creates technicians, review_requests, and reviews_received tables

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

-- Create indexes for technicians
CREATE INDEX idx_technicians_servicetitan_id ON technicians(servicetitan_id);
CREATE INDEX idx_technicians_active ON technicians(active);

-- Review requests sent to customers
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL, -- ServiceTitan job ID (unique constraint prevents duplicates)
  job_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  technician_id UUID REFERENCES technicians(id),
  technician_name TEXT,
  review_url TEXT NOT NULL, -- Unique tracking URL
  status TEXT NOT NULL DEFAULT 'pending',
  sms_payload JSONB, -- SMS message details
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_review_request_status CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked'))
);

-- Create indexes for review_requests
CREATE INDEX idx_review_requests_job_id ON review_requests(job_id);
CREATE INDEX idx_review_requests_status ON review_requests(status);
CREATE INDEX idx_review_requests_technician ON review_requests(technician_id);
CREATE INDEX idx_review_requests_sent_at ON review_requests(sent_at DESC);

-- Reviews received (imported from Google, Facebook, etc.)
CREATE TABLE IF NOT EXISTS reviews_received (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- 'google', 'facebook', 'yelp', etc.
  external_id TEXT, -- Platform's review ID
  technician_id UUID REFERENCES technicians(id),
  technician_name TEXT,
  customer_name TEXT,
  rating DECIMAL(2, 1) NOT NULL, -- 1.0 to 5.0
  review_text TEXT,
  review_date TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  response_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, external_id)
);

-- Create indexes for reviews_received
CREATE INDEX idx_reviews_platform ON reviews_received(platform);
CREATE INDEX idx_reviews_technician ON reviews_received(technician_id);
CREATE INDEX idx_reviews_rating ON reviews_received(rating DESC);
CREATE INDEX idx_reviews_date ON reviews_received(review_date DESC);

-- Enable Row Level Security
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_received ENABLE ROW LEVEL SECURITY;

-- RLS Policies for technicians
CREATE POLICY "Authenticated users can read technicians" ON technicians
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage technicians" ON technicians
  FOR ALL TO service_role USING (true);

-- RLS Policies for review_requests
CREATE POLICY "Authenticated users can read review_requests" ON review_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage review_requests" ON review_requests
  FOR ALL TO service_role USING (true);

-- RLS Policies for reviews_received
CREATE POLICY "Authenticated users can read reviews" ON reviews_received
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage reviews" ON reviews_received
  FOR ALL TO service_role USING (true);
