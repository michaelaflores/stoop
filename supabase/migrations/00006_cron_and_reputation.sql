-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Overdue borrow check: runs every hour
SELECT cron.schedule(
  'check-overdue-borrows',
  '0 * * * *',
  $$
    UPDATE borrows SET updated_at = now()
    WHERE status = 'active'
      AND expected_return_date < CURRENT_DATE
      AND updated_at < now() - interval '1 hour';
  $$
);

-- 2. Archive old alerts: daily at 3am UTC
SELECT cron.schedule(
  'archive-old-alerts',
  '0 3 * * *',
  $$
    UPDATE posts SET is_archived = true, updated_at = now()
    WHERE type = 'alert'
      AND is_archived = false
      AND created_at < now() - interval '7 days';
  $$
);

-- 3. Reputation tier updater: daily at 4am UTC
SELECT cron.schedule(
  'update-reputation-tiers',
  '0 4 * * *',
  $$
    UPDATE profiles SET
      reputation_tier = CASE
        WHEN reputation_score >= 100 THEN 'neighborhood_legend'
        WHEN reputation_score >= 50 THEN 'block_captain'
        WHEN reputation_score >= 10 THEN 'regular'
        ELSE 'new_neighbor'
      END,
      updated_at = now()
    WHERE reputation_tier != CASE
      WHEN reputation_score >= 100 THEN 'neighborhood_legend'
      WHEN reputation_score >= 50 THEN 'block_captain'
      WHEN reputation_score >= 10 THEN 'regular'
      ELSE 'new_neighbor'
    END;
  $$
);

-- Add borrows and listings to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE borrows;
ALTER PUBLICATION supabase_realtime ADD TABLE listings;
