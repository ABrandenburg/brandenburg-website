-- Analytics Materialized View Migration
-- Creates tech_performance_card materialized view for technician performance metrics

-- Materialized view for technician performance card (last 30 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS tech_performance_card AS
SELECT
  t.id AS technician_id,
  t.servicetitan_id,
  t.name AS technician_name,
  t.active,
  -- Job metrics (last 30 days)
  COUNT(DISTINCT j.job_id) AS total_jobs,
  SUM(j.total_amount) AS total_revenue,
  -- Review request metrics
  COUNT(DISTINCT rr.id) AS review_requests_sent,
  ROUND(
    CAST(COUNT(DISTINCT rr.id) AS DECIMAL) / NULLIF(COUNT(DISTINCT j.job_id), 0) * 100,
    2
  ) AS request_rate_percent,
  -- Reviews received metrics
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

-- Create indexes on materialized view for performance
CREATE UNIQUE INDEX idx_tech_perf_tech_id ON tech_performance_card(technician_id);
CREATE INDEX idx_tech_perf_rating ON tech_performance_card(avg_rating DESC NULLS LAST);
CREATE INDEX idx_tech_perf_revenue ON tech_performance_card(total_revenue DESC NULLS LAST);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_tech_performance_card()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use CONCURRENTLY to avoid locking the view during refresh
  -- This allows reads to continue while the view is being updated
  REFRESH MATERIALIZED VIEW CONCURRENTLY tech_performance_card;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION refresh_tech_performance_card() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_tech_performance_card() TO service_role;

-- Optional: Trigger to refresh on new reviews (commented out for now - using cron instead)
-- CREATE OR REPLACE FUNCTION trigger_refresh_tech_performance()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   PERFORM refresh_tech_performance_card();
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER refresh_on_new_review
--   AFTER INSERT OR UPDATE ON reviews_received
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION trigger_refresh_tech_performance();
