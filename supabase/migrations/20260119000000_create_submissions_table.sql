-- Create submissions table for storing form data
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all submissions
CREATE POLICY "Authenticated users can read submissions" ON submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for service role (API) to insert
CREATE POLICY "Service role can insert submissions" ON submissions
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create policy for anon to insert (for public forms)
CREATE POLICY "Anon can insert submissions" ON submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy for authenticated to update status
CREATE POLICY "Authenticated users can update submissions" ON submissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
