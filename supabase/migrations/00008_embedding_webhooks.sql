-- Migration 00008: Database webhook triggers for automatic embedding generation
-- 
-- NOTE: Automatic embedding generation for NEW content requires a Database Webhook
-- configured in the Supabase Dashboard (Database > Webhooks) pointing to the 
-- generate-embedding Edge Function, triggered on INSERT/UPDATE for:
--   - listings (title, description changes)
--   - posts (title, body changes)  
--   - requests (title, description changes)
--
-- For EXISTING content that lacks embeddings, use the backfill approach below.
-- This calls the generate-embedding Edge Function for each row without an embedding.
-- Run this from the Supabase SQL Editor AFTER configuring your project URL below.

-- ============================================================
-- Backfill function: Generate embeddings for existing content
-- ============================================================
-- Uses pg_net to call the Edge Function asynchronously for each row.
-- Replace YOUR_SUPABASE_URL and YOUR_SERVICE_ROLE_KEY before running.

-- To backfill, run:
--   SELECT backfill_embeddings('YOUR_SUPABASE_URL', 'YOUR_SERVICE_ROLE_KEY');

CREATE OR REPLACE FUNCTION backfill_embeddings(
  project_url TEXT,
  svc_role_key TEXT
)
RETURNS TABLE (table_name TEXT, queued_count INT) AS $$
DECLARE
  rec RECORD;
  cnt_listings INT := 0;
  cnt_posts INT := 0;
  cnt_requests INT := 0;
BEGIN
  -- Backfill listings
  FOR rec IN SELECT l.id, l.title, l.description FROM listings l WHERE l.embedding IS NULL LOOP
    PERFORM extensions.http_post(
      url := project_url || '/functions/v1/generate-embedding',
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'listings',
        'schema', 'public',
        'record', jsonb_build_object('id', rec.id, 'title', rec.title, 'description', rec.description),
        'old_record', NULL
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || svc_role_key
      )
    );
    cnt_listings := cnt_listings + 1;
  END LOOP;

  -- Backfill posts
  FOR rec IN SELECT po.id, po.title, po.body FROM posts po WHERE po.embedding IS NULL LOOP
    PERFORM extensions.http_post(
      url := project_url || '/functions/v1/generate-embedding',
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'posts',
        'schema', 'public',
        'record', jsonb_build_object('id', rec.id, 'title', rec.title, 'body', rec.body),
        'old_record', NULL
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || svc_role_key
      )
    );
    cnt_posts := cnt_posts + 1;
  END LOOP;

  -- Backfill requests
  FOR rec IN SELECT r.id, r.title, r.description FROM requests r WHERE r.embedding IS NULL LOOP
    PERFORM extensions.http_post(
      url := project_url || '/functions/v1/generate-embedding',
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'requests',
        'schema', 'public',
        'record', jsonb_build_object('id', rec.id, 'title', rec.title, 'description', rec.description),
        'old_record', NULL
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || svc_role_key
      )
    );
    cnt_requests := cnt_requests + 1;
  END LOOP;

  RETURN QUERY SELECT 'listings'::TEXT, cnt_listings
    UNION ALL SELECT 'posts'::TEXT, cnt_posts
    UNION ALL SELECT 'requests'::TEXT, cnt_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
