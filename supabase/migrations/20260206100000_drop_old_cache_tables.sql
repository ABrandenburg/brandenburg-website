-- Drop old ServiceTitan API cache tables
-- These are no longer needed since scorecard data now comes from emailed reports
-- stored in the scorecard_data table.

DROP TABLE IF EXISTS rankings_cache;
DROP TABLE IF EXISTS technician_period_cache;
DROP TABLE IF EXISTS leads_cache;

-- Drop the old api_locks table used for rate limiting ServiceTitan API calls
DROP TABLE IF EXISTS api_locks;
