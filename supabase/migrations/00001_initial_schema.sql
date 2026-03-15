-- ============================================================
-- Stoop: Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable extensions (PostGIS, pgvector, pg_cron)
-- Note: pg_cron must be enabled via Supabase Dashboard > Database > Extensions
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- ============================================================
-- NEIGHBORHOODS
-- ============================================================

CREATE TABLE public.neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  boundary extensions.GEOMETRY(MultiPolygon, 4326),
  center extensions.GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_neighborhoods_boundary ON public.neighborhoods USING GIST(boundary);

-- ============================================================
-- PROFILES (extends Supabase Auth)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  neighborhood_id UUID REFERENCES public.neighborhoods(id),
  reputation_score INT DEFAULT 0,
  reputation_tier TEXT DEFAULT 'new_neighbor'
    CHECK (reputation_tier IN ('new_neighbor', 'regular', 'block_captain', 'neighborhood_legend')),
  location extensions.GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_neighborhood ON public.profiles(neighborhood_id);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- THE COMMONS — Listings
-- ============================================================

CREATE TYPE public.listing_type AS ENUM ('item', 'skill');
CREATE TYPE public.listing_status AS ENUM ('available', 'borrowed', 'unavailable');
CREATE TYPE public.listing_category AS ENUM (
  'tools', 'kitchen', 'outdoor', 'recreation', 'household', 'electronics',
  'skill_handyman', 'skill_tutoring', 'skill_pet', 'skill_tech', 'skill_other'
);

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id),
  type public.listing_type NOT NULL DEFAULT 'item',
  category public.listing_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition TEXT,
  max_borrow_days INT DEFAULT 7,
  photo_urls TEXT[],
  status public.listing_status NOT NULL DEFAULT 'available',
  embedding extensions.VECTOR(384),
  borrow_count INT DEFAULT 0,
  avg_rating FLOAT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_neighborhood ON public.listings(neighborhood_id, status);
CREATE INDEX idx_listings_category ON public.listings(neighborhood_id, category);
CREATE INDEX idx_listings_owner ON public.listings(owner_id);

-- ============================================================
-- THE COMMONS — Borrows
-- ============================================================

CREATE TYPE public.borrow_status AS ENUM ('pending', 'approved', 'active', 'returned', 'declined', 'cancelled');

CREATE TABLE public.borrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.borrow_status NOT NULL DEFAULT 'pending',
  message TEXT,
  pickup_date TIMESTAMPTZ,
  expected_return_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  borrower_confirmed_pickup BOOLEAN DEFAULT false,
  lender_confirmed_pickup BOOLEAN DEFAULT false,
  borrower_confirmed_return BOOLEAN DEFAULT false,
  lender_confirmed_return BOOLEAN DEFAULT false,
  borrower_rating INT CHECK (borrower_rating BETWEEN 1 AND 5),
  lender_rating INT CHECK (lender_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_borrows_listing ON public.borrows(listing_id, status);
CREATE INDEX idx_borrows_borrower ON public.borrows(borrower_id, status);
CREATE INDEX idx_borrows_lender ON public.borrows(lender_id, status);

-- ============================================================
-- THE COMMONS — Requests ("I Need...")
-- ============================================================

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  needed_by TIMESTAMPTZ,
  is_fulfilled BOOLEAN DEFAULT false,
  fulfilled_by_listing_id UUID REFERENCES public.listings(id),
  embedding extensions.VECTOR(384),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_requests_neighborhood ON public.requests(neighborhood_id, is_fulfilled);

-- ============================================================
-- THE FEED — Posts
-- ============================================================

CREATE TYPE public.post_type AS ENUM ('discussion', 'event', 'alert', 'recommendation', 'ask');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'urgent');

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES public.neighborhoods(id),
  type public.post_type NOT NULL DEFAULT 'discussion',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  alert_severity public.alert_severity,
  alert_confirmed_count INT DEFAULT 0,
  alert_dismissed_count INT DEFAULT 0,
  event_starts_at TIMESTAMPTZ,
  event_location TEXT,
  photo_urls TEXT[],
  embedding extensions.VECTOR(384),
  upvote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_posts_neighborhood ON public.posts(neighborhood_id, created_at DESC);
CREATE INDEX idx_posts_type ON public.posts(neighborhood_id, type);

-- ============================================================
-- THE FEED — Comments
-- ============================================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_post ON public.comments(post_id, created_at ASC);

-- ============================================================
-- ENGAGEMENT — Votes, Alert Responses, Saved Posts
-- ============================================================

CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE public.alert_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_type TEXT NOT NULL CHECK (response_type IN ('confirm', 'dismiss')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ============================================================
-- REPUTATION
-- ============================================================

CREATE TABLE public.reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points INT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reputation_events_user ON public.reputation_events(user_id, created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read neighborhood listings" ON public.listings FOR SELECT USING (
  neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Create listings" ON public.listings FOR INSERT WITH CHECK (
  owner_id = auth.uid() AND
  neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Edit own listings" ON public.listings FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Delete own listings" ON public.listings FOR DELETE USING (owner_id = auth.uid());

-- Borrows
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own borrows" ON public.borrows FOR SELECT USING (
  borrower_id = auth.uid() OR lender_id = auth.uid()
);
CREATE POLICY "Create borrow request" ON public.borrows FOR INSERT WITH CHECK (borrower_id = auth.uid());
CREATE POLICY "Update own borrows" ON public.borrows FOR UPDATE USING (
  borrower_id = auth.uid() OR lender_id = auth.uid()
);

-- Requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read neighborhood requests" ON public.requests FOR SELECT USING (
  neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Create requests" ON public.requests FOR INSERT WITH CHECK (
  requester_id = auth.uid() AND
  neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Edit own requests" ON public.requests FOR UPDATE USING (requester_id = auth.uid());

-- Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read neighborhood posts" ON public.posts FOR SELECT USING (
  neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Create posts" ON public.posts FOR INSERT WITH CHECK (
  author_id = auth.uid() AND
  neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Edit own posts" ON public.posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Delete own posts" ON public.posts FOR DELETE USING (author_id = auth.uid());

-- Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read comments" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = comments.post_id
    AND posts.neighborhood_id = (SELECT neighborhood_id FROM public.profiles WHERE id = auth.uid())
  )
);
CREATE POLICY "Create comments" ON public.comments FOR INSERT WITH CHECK (author_id = auth.uid());

-- Votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Create votes" ON public.votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own votes" ON public.votes FOR DELETE USING (user_id = auth.uid());

-- Alert responses
ALTER TABLE public.alert_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read alert responses" ON public.alert_responses FOR SELECT USING (true);
CREATE POLICY "Create alert response" ON public.alert_responses FOR INSERT WITH CHECK (user_id = auth.uid());

-- Saved posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own saves" ON public.saved_posts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Create saves" ON public.saved_posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own saves" ON public.saved_posts FOR DELETE USING (user_id = auth.uid());

-- Reputation events
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own reputation" ON public.reputation_events FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Assign neighborhood based on coordinates (PostGIS)
CREATE OR REPLACE FUNCTION public.assign_neighborhood(lat FLOAT, lng FLOAT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  result_id UUID;
BEGIN
  SELECT id INTO result_id
  FROM public.neighborhoods
  WHERE extensions.ST_Contains(boundary, extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326))
  LIMIT 1;
  RETURN result_id;
END;
$$;

-- Get neighborhood leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(target_neighborhood_id UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  reputation_score INT,
  reputation_tier TEXT,
  total_lends BIGINT,
  total_borrows BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    p.reputation_score,
    p.reputation_tier,
    (SELECT COUNT(*) FROM public.borrows b WHERE b.lender_id = p.id AND b.status = 'returned') as total_lends,
    (SELECT COUNT(*) FROM public.borrows b WHERE b.borrower_id = p.id AND b.status = 'returned') as total_borrows
  FROM public.profiles p
  WHERE p.neighborhood_id = target_neighborhood_id
  ORDER BY p.reputation_score DESC
  LIMIT limit_count;
END;
$$;

-- Increment reputation (called by Edge Functions)
CREATE OR REPLACE FUNCTION public.increment_reputation(
  target_user_id UUID,
  points INT,
  event_type TEXT,
  ref_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.reputation_events (user_id, event_type, points, reference_id)
  VALUES (target_user_id, event_type, points, ref_id);

  UPDATE public.profiles
  SET reputation_score = reputation_score + points,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Complete borrow (atomic state transition + reputation)
CREATE OR REPLACE FUNCTION public.complete_borrow(
  borrow_id UUID,
  completing_user_id UUID,
  rating INT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_borrow public.borrows%ROWTYPE;
BEGIN
  SELECT * INTO v_borrow FROM public.borrows WHERE id = borrow_id;
  IF v_borrow IS NULL THEN RETURN false; END IF;

  IF completing_user_id = v_borrow.borrower_id THEN
    UPDATE public.borrows SET
      borrower_confirmed_return = true,
      borrower_rating = COALESCE(rating, borrower_rating),
      updated_at = now()
    WHERE id = borrow_id;
  ELSIF completing_user_id = v_borrow.lender_id THEN
    UPDATE public.borrows SET
      lender_confirmed_return = true,
      lender_rating = COALESCE(rating, lender_rating),
      updated_at = now()
    WHERE id = borrow_id;
  ELSE
    RETURN false;
  END IF;

  SELECT * INTO v_borrow FROM public.borrows WHERE id = borrow_id;
  IF v_borrow.borrower_confirmed_return AND v_borrow.lender_confirmed_return THEN
    UPDATE public.borrows SET status = 'returned', actual_return_date = now(), updated_at = now()
    WHERE id = borrow_id;

    UPDATE public.listings SET status = 'available', borrow_count = borrow_count + 1, updated_at = now()
    WHERE id = v_borrow.listing_id;

    INSERT INTO public.reputation_events (user_id, event_type, points, reference_id)
    VALUES
      (v_borrow.lender_id, 'lend_completed', 10, borrow_id),
      (v_borrow.borrower_id, 'borrow_completed', 3, borrow_id);

    UPDATE public.profiles SET reputation_score = reputation_score + 10, updated_at = now()
    WHERE id = v_borrow.lender_id;
    UPDATE public.profiles SET reputation_score = reputation_score + 3, updated_at = now()
    WHERE id = v_borrow.borrower_id;
  END IF;

  RETURN true;
END;
$$;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create a public bucket for listing/post photos
-- Run this separately or via the Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
