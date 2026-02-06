-- Create scorecard_data table for storing processed email report data
-- Replaces the old rankings_cache, technician_period_cache, and leads_cache tables

CREATE TABLE IF NOT EXISTS scorecard_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period INTEGER NOT NULL,              -- 7, 30, 90, or 365
    report_date DATE NOT NULL,            -- Date the report covers through
    data JSONB NOT NULL,                  -- Full rankings JSON + raw rows for trend comparison
    source_filename TEXT,                 -- Original xlsx filename for auditing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(period, report_date)
);

-- Index for fast lookups by period (most recent first)
CREATE INDEX IF NOT EXISTS idx_scorecard_data_period_date
    ON scorecard_data(period, report_date DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scorecard_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_scorecard_data_updated_at
    BEFORE UPDATE ON scorecard_data
    FOR EACH ROW
    EXECUTE FUNCTION update_scorecard_data_updated_at();
