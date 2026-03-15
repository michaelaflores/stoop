-- ============================================================
-- Demo Borrows Seed
-- Creates borrows in various lifecycle states to demonstrate
-- the full borrow flow during the demo.
-- ============================================================

DO $$
DECLARE
  v_neighborhood_id UUID;
  v_user1 UUID;
  v_user2 UUID;
  v_user3 UUID;
  v_user4 UUID;
  v_user5 UUID;
  v_listing1 UUID;
  v_listing2 UUID;
  v_listing3 UUID;
  v_listing4 UUID;
  v_borrow_returned UUID;
BEGIN
  -- Get neighborhood
  SELECT id INTO v_neighborhood_id FROM neighborhoods WHERE slug = 'fishtown' LIMIT 1;
  IF v_neighborhood_id IS NULL THEN
    SELECT id INTO v_neighborhood_id FROM neighborhoods LIMIT 1;
  END IF;

  -- Get user IDs
  SELECT id INTO v_user1 FROM profiles WHERE neighborhood_id = v_neighborhood_id ORDER BY created_at ASC LIMIT 1;
  IF v_user1 IS NULL THEN
    SELECT id INTO v_user1 FROM profiles ORDER BY created_at ASC LIMIT 1;
  END IF;
  IF v_user1 IS NULL THEN
    RAISE EXCEPTION 'No profiles found. Please sign up at least one user before running this seed.';
  END IF;

  SELECT COALESCE(neighborhood_id, v_neighborhood_id) INTO v_neighborhood_id FROM profiles WHERE id = v_user1;

  SELECT id INTO v_user2 FROM profiles WHERE id != v_user1 ORDER BY created_at ASC LIMIT 1;
  IF v_user2 IS NULL THEN v_user2 := v_user1; END IF;
  SELECT id INTO v_user3 FROM profiles WHERE id NOT IN (v_user1, v_user2) ORDER BY created_at ASC LIMIT 1;
  IF v_user3 IS NULL THEN v_user3 := v_user1; END IF;
  SELECT id INTO v_user4 FROM profiles WHERE id NOT IN (v_user1, v_user2, v_user3) ORDER BY created_at ASC LIMIT 1;
  IF v_user4 IS NULL THEN v_user4 := v_user2; END IF;
  SELECT id INTO v_user5 FROM profiles WHERE id NOT IN (v_user1, v_user2, v_user3, v_user4) ORDER BY created_at ASC LIMIT 1;
  IF v_user5 IS NULL THEN v_user5 := v_user1; END IF;

  -- Get listing IDs (first 4 listings in the neighborhood)
  SELECT id INTO v_listing1 FROM listings WHERE neighborhood_id = v_neighborhood_id ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO v_listing2 FROM listings WHERE neighborhood_id = v_neighborhood_id AND id != v_listing1 ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO v_listing3 FROM listings WHERE neighborhood_id = v_neighborhood_id AND id NOT IN (v_listing1, v_listing2) ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO v_listing4 FROM listings WHERE neighborhood_id = v_neighborhood_id AND id NOT IN (v_listing1, v_listing2, v_listing3) ORDER BY created_at ASC LIMIT 1;

  IF v_listing1 IS NULL THEN
    RAISE EXCEPTION 'No listings found. Please run 002_demo_listings.sql first.';
  END IF;
  -- Fallbacks for missing listings
  IF v_listing2 IS NULL THEN v_listing2 := v_listing1; END IF;
  IF v_listing3 IS NULL THEN v_listing3 := v_listing1; END IF;
  IF v_listing4 IS NULL THEN v_listing4 := v_listing1; END IF;

  -- ============================================================
  -- CLEANUP: Remove previous seed borrows
  -- ============================================================
  DELETE FROM reputation_events WHERE reference_id IN (
    SELECT id FROM borrows WHERE message IN (
      'Would love to borrow this for a weekend project!',
      'Need this for a dinner party this Saturday.',
      'Moving some furniture — this would be a lifesaver!',
      'Used it for camping at Wissahickon — amazing gear!'
    )
  );
  DELETE FROM borrows WHERE message IN (
    'Would love to borrow this for a weekend project!',
    'Need this for a dinner party this Saturday.',
    'Moving some furniture — this would be a lifesaver!',
    'Used it for camping at Wissahickon — amazing gear!'
  );

  -- ============================================================
  -- 1. PENDING — user2 requested to borrow listing1 from user1
  -- ============================================================
  INSERT INTO borrows (
    listing_id, borrower_id, lender_id, status, message,
    pickup_date, created_at
  ) VALUES (
    v_listing1, v_user2, v_user1, 'pending',
    'Would love to borrow this for a weekend project!',
    (CURRENT_DATE + interval '2 days')::date,
    now() - interval '2 hours'
  );

  -- ============================================================
  -- 2. APPROVED — user3 approved to borrow listing2 from user1
  -- ============================================================
  INSERT INTO borrows (
    listing_id, borrower_id, lender_id, status, message,
    pickup_date, expected_return_date, created_at
  ) VALUES (
    v_listing2, v_user3, v_user1, 'approved',
    'Need this for a dinner party this Saturday.',
    (CURRENT_DATE + interval '1 day')::date,
    (CURRENT_DATE + interval '5 days')::date,
    now() - interval '1 day'
  );

  -- ============================================================
  -- 3. ACTIVE — user4 currently borrowing listing3 from user1
  -- ============================================================
  INSERT INTO borrows (
    listing_id, borrower_id, lender_id, status, message,
    pickup_date, expected_return_date,
    borrower_confirmed_pickup, lender_confirmed_pickup,
    created_at
  ) VALUES (
    v_listing3, v_user4, v_user1, 'active',
    'Moving some furniture — this would be a lifesaver!',
    (CURRENT_DATE - interval '2 days')::date,
    (CURRENT_DATE + interval '3 days')::date,
    true, true,
    now() - interval '3 days'
  );

  -- Mark listing3 as borrowed
  UPDATE listings SET status = 'borrowed' WHERE id = v_listing3;

  -- ============================================================
  -- 4. RETURNED — user5 completed borrow of listing4 from user2
  -- ============================================================
  INSERT INTO borrows (
    listing_id, borrower_id, lender_id, status, message,
    pickup_date, expected_return_date, actual_return_date,
    borrower_confirmed_pickup, lender_confirmed_pickup,
    borrower_confirmed_return, lender_confirmed_return,
    borrower_rating, lender_rating,
    created_at
  ) VALUES (
    v_listing4, v_user5, v_user2, 'returned',
    'Used it for camping at Wissahickon — amazing gear!',
    (CURRENT_DATE - interval '10 days')::date,
    (CURRENT_DATE - interval '3 days')::date,
    (CURRENT_DATE - interval '4 days')::date,
    true, true,
    true, true,
    5, 5,
    now() - interval '12 days'
  ) RETURNING id INTO v_borrow_returned;

  -- Update listing4 borrow_count
  UPDATE listings SET borrow_count = borrow_count + 1 WHERE id = v_listing4;

  -- Insert reputation events for the returned borrow
  INSERT INTO reputation_events (user_id, event_type, points, reference_id, created_at) VALUES
    (v_user5, 'borrow_completed', 5, v_borrow_returned, now() - interval '4 days'),
    (v_user2, 'lend_completed', 10, v_borrow_returned, now() - interval '4 days'),
    (v_user5, 'rating_received', 3, v_borrow_returned, now() - interval '4 days'),
    (v_user2, 'rating_received', 3, v_borrow_returned, now() - interval '4 days');

  -- Update reputation scores
  UPDATE profiles SET reputation_score = reputation_score + 8 WHERE id = v_user5;
  UPDATE profiles SET reputation_score = reputation_score + 13 WHERE id = v_user2;

END $$;
