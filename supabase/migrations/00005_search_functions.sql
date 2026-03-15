-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_listings_fts ON listings USING gin(
  to_tsvector('english', title || ' ' || description)
);
CREATE INDEX IF NOT EXISTS idx_posts_fts ON posts USING gin(
  to_tsvector('english', title || ' ' || body)
);
CREATE INDEX IF NOT EXISTS idx_requests_fts ON requests USING gin(
  to_tsvector('english', title || ' ' || description)
);

-- Unified search function across listings, posts, and requests
CREATE OR REPLACE FUNCTION search_neighborhood(
  query_text TEXT,
  target_neighborhood_id UUID,
  result_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  title TEXT,
  snippet TEXT,
  author_name TEXT,
  author_avatar TEXT,
  category TEXT,
  created_at TIMESTAMPTZ,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT
      l.id,
      'listing'::TEXT as source_type,
      l.title,
      LEFT(l.description, 200) as snippet,
      p.display_name as author_name,
      p.avatar_url as author_avatar,
      l.category::TEXT,
      l.created_at,
      ts_rank(
        to_tsvector('english', l.title || ' ' || l.description),
        plainto_tsquery('english', query_text)
      )::FLOAT as relevance
    FROM listings l
    JOIN profiles p ON p.id = l.owner_id
    WHERE l.neighborhood_id = target_neighborhood_id
      AND l.is_active = true
      AND to_tsvector('english', l.title || ' ' || l.description) @@ plainto_tsquery('english', query_text)
  )
  UNION ALL
  (
    SELECT
      po.id,
      'post'::TEXT,
      po.title,
      LEFT(po.body, 200),
      p.display_name,
      p.avatar_url,
      po.type::TEXT,
      po.created_at,
      ts_rank(
        to_tsvector('english', po.title || ' ' || po.body),
        plainto_tsquery('english', query_text)
      )::FLOAT
    FROM posts po
    JOIN profiles p ON p.id = po.author_id
    WHERE po.neighborhood_id = target_neighborhood_id
      AND po.is_archived = false
      AND to_tsvector('english', po.title || ' ' || po.body) @@ plainto_tsquery('english', query_text)
  )
  UNION ALL
  (
    SELECT
      r.id,
      'request'::TEXT,
      r.title,
      LEFT(r.description, 200),
      p.display_name,
      p.avatar_url,
      'request'::TEXT,
      r.created_at,
      ts_rank(
        to_tsvector('english', r.title || ' ' || r.description),
        plainto_tsquery('english', query_text)
      )::FLOAT
    FROM requests r
    JOIN profiles p ON p.id = r.requester_id
    WHERE r.neighborhood_id = target_neighborhood_id
      AND r.is_fulfilled = false
      AND to_tsvector('english', r.title || ' ' || r.description) @@ plainto_tsquery('english', query_text)
  )
  ORDER BY relevance DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: get_leaderboard already exists from 00001_initial_schema.sql
-- No need to recreate it here.
