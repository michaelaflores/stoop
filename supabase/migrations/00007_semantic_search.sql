-- Migration 00007: Semantic search infrastructure
-- Adds HNSW indexes for fast vector similarity search and
-- a unified semantic_search RPC function used by the `search` Edge Function.

-- ============================================================
-- 1. HNSW indexes on embedding columns (for fast cosine search)
-- ============================================================
-- Using vector_ip_ops (inner product) since embeddings are normalized to unit length,
-- inner product is equivalent to cosine similarity but faster to compute.

CREATE INDEX IF NOT EXISTS idx_listings_embedding
  ON listings
  USING hnsw (embedding extensions.vector_ip_ops);

CREATE INDEX IF NOT EXISTS idx_posts_embedding
  ON posts
  USING hnsw (embedding extensions.vector_ip_ops);

CREATE INDEX IF NOT EXISTS idx_requests_embedding
  ON requests
  USING hnsw (embedding extensions.vector_ip_ops);

-- ============================================================
-- 2. Unified semantic search function
-- ============================================================
-- Called by the `search` Edge Function after generating the query embedding.
-- Returns results from listings, posts, and requests ordered by similarity.

CREATE OR REPLACE FUNCTION semantic_search(
  query_embedding extensions.VECTOR(384),
  target_neighborhood_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
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
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Listings
    SELECT
      l.id,
      'listing'::TEXT AS source_type,
      l.title,
      LEFT(l.description, 200) AS snippet,
      p.display_name AS author_name,
      p.avatar_url AS author_avatar,
      l.category::TEXT,
      l.created_at,
      -- Inner product of normalized vectors = cosine similarity
      -- <#> returns negative inner product, so negate for a 0-1 similarity score
      (-(l.embedding::extensions.vector <#> query_embedding))::FLOAT AS similarity
    FROM listings l
    JOIN profiles p ON p.id = l.owner_id
    WHERE l.neighborhood_id = target_neighborhood_id
      AND l.is_active = true
      AND l.embedding IS NOT NULL
      AND (-(l.embedding::extensions.vector <#> query_embedding)) > match_threshold
  )
  UNION ALL
  (
    -- Posts
    SELECT
      po.id,
      'post'::TEXT,
      po.title,
      LEFT(po.body, 200),
      p.display_name,
      p.avatar_url,
      po.type::TEXT,
      po.created_at,
      (-(po.embedding::extensions.vector <#> query_embedding))::FLOAT
    FROM posts po
    JOIN profiles p ON p.id = po.author_id
    WHERE po.neighborhood_id = target_neighborhood_id
      AND po.is_archived = false
      AND po.embedding IS NOT NULL
      AND (-(po.embedding::extensions.vector <#> query_embedding)) > match_threshold
  )
  UNION ALL
  (
    -- Requests
    SELECT
      r.id,
      'request'::TEXT,
      r.title,
      LEFT(r.description, 200),
      p.display_name,
      p.avatar_url,
      'request'::TEXT,
      r.created_at,
      (-(r.embedding::extensions.vector <#> query_embedding))::FLOAT
    FROM requests r
    JOIN profiles p ON p.id = r.requester_id
    WHERE r.neighborhood_id = target_neighborhood_id
      AND r.is_fulfilled = false
      AND r.embedding IS NOT NULL
      AND (-(r.embedding::extensions.vector <#> query_embedding)) > match_threshold
  )
  ORDER BY similarity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
