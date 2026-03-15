-- Seed posts, comments, and votes for testing
-- Uses the first 5 profiles found in the database

DO $$
DECLARE
  -- Get neighborhood ID (Fishtown)
  v_neighborhood_id UUID;
  -- User IDs
  v_user1 UUID;
  v_user2 UUID;
  v_user3 UUID;
  v_user4 UUID;
  v_user5 UUID;
  -- Post IDs for adding comments
  v_post_discussion UUID;
  v_post_event UUID;
  v_post_alert_urgent UUID;
  v_post_alert_info UUID;
  v_post_recommendation UUID;
  v_post_ask UUID;
  v_post_discussion2 UUID;
  v_post_event_past UUID;
  v_post_alert_warning UUID;
  v_post_recommendation2 UUID;
BEGIN
  -- Get Fishtown neighborhood
  SELECT id INTO v_neighborhood_id FROM neighborhoods WHERE slug = 'fishtown' LIMIT 1;
  IF v_neighborhood_id IS NULL THEN
    -- Fallback: get first neighborhood
    SELECT id INTO v_neighborhood_id FROM neighborhoods LIMIT 1;
  END IF;

  -- Get user IDs (up to 5)
  -- First try users in the target neighborhood, then fall back to ANY profile
  SELECT id INTO v_user1 FROM profiles WHERE neighborhood_id = v_neighborhood_id ORDER BY created_at ASC LIMIT 1;
  IF v_user1 IS NULL THEN
    -- No users in this neighborhood — grab the first profile in the DB
    SELECT id INTO v_user1 FROM profiles ORDER BY created_at ASC LIMIT 1;
  END IF;
  -- Also update neighborhood_id to match the user's actual neighborhood if needed
  IF v_user1 IS NOT NULL THEN
    SELECT COALESCE(neighborhood_id, v_neighborhood_id) INTO v_neighborhood_id FROM profiles WHERE id = v_user1;
  END IF;

  -- Safety check: abort if there are no profiles at all
  IF v_user1 IS NULL THEN
    RAISE EXCEPTION 'No profiles found. Please sign up at least one user before running this seed.';
  END IF;

  SELECT id INTO v_user2 FROM profiles WHERE id != v_user1 ORDER BY created_at ASC LIMIT 1;
  IF v_user2 IS NULL THEN v_user2 := v_user1; END IF;
  SELECT id INTO v_user3 FROM profiles WHERE id NOT IN (v_user1, v_user2) ORDER BY created_at ASC LIMIT 1;
  IF v_user3 IS NULL THEN v_user3 := v_user1; END IF;
  SELECT id INTO v_user4 FROM profiles WHERE id NOT IN (v_user1, v_user2, v_user3) ORDER BY created_at ASC LIMIT 1;
  IF v_user4 IS NULL THEN v_user4 := v_user2; END IF;
  SELECT id INTO v_user5 FROM profiles WHERE id NOT IN (v_user1, v_user2, v_user3, v_user4) ORDER BY created_at ASC LIMIT 1;
  IF v_user5 IS NULL THEN v_user5 := v_user1; END IF;

  -- ============================================================
  -- POSTS — Cover all 5 types with varied content
  -- ============================================================

  -- 1. Discussion: Active community topic
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, created_at) VALUES
    (gen_random_uuid(), v_user1, v_neighborhood_id, 'discussion',
     'What''s happening with the old Frankford Chocolate Factory?',
     'Drove by today and saw construction crews. Anyone know what they''re building there? Heard rumors of a food hall but also heard condos. Would love a community space.',
     now() - interval '2 hours')
  RETURNING id INTO v_post_discussion;

  -- 2. Discussion: Neighborly topic
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, created_at) VALUES
    (gen_random_uuid(), v_user3, v_neighborhood_id, 'discussion',
     'Best coffee spots for remote work?',
     'Just started working from home and need a good coffee shop with Wi-Fi and outlets. Bonus points if they don''t mind you camping out for a few hours. What are your go-to spots around here?',
     now() - interval '6 hours')
  RETURNING id INTO v_post_discussion2;

  -- 3. Event: Upcoming community event
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, event_starts_at, event_location, created_at) VALUES
    (gen_random_uuid(), v_user2, v_neighborhood_id, 'event',
     'Block Party on Palmer Street',
     'Annual block party is back! We''ll have a grill going, a DJ, games for the kids, and a tool-sharing demo (bring something to list on Stoop!). BYOB and a side dish to share.',
     now() + interval '5 days',
     'Palmer St between Frankford & Girard',
     now() - interval '1 day')
  RETURNING id INTO v_post_event;

  -- 4. Event: Past event (for testing past event display)
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, event_starts_at, event_location, created_at) VALUES
    (gen_random_uuid(), v_user4, v_neighborhood_id, 'event',
     'Community Garden Cleanup Day',
     'Thanks to everyone who came out! We cleared two beds, planted tomatoes and basil, and fixed the fence. Next cleanup is in two weeks.',
     now() - interval '3 days',
     'Fishtown Community Garden, E Berks St',
     now() - interval '5 days')
  RETURNING id INTO v_post_event_past;

  -- 5. Alert: Urgent (active)
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, alert_severity, alert_confirmed_count, alert_dismissed_count, created_at) VALUES
    (gen_random_uuid(), v_user1, v_neighborhood_id, 'alert',
     'Water main break on Girard Avenue',
     'Major water main break at Girard & Frankford. Water is flooding into the street and there''s low pressure in surrounding blocks. PGW crews are on scene. Avoid the intersection.',
     'urgent', 7, 1,
     now() - interval '45 minutes')
  RETURNING id INTO v_post_alert_urgent;

  -- 6. Alert: Warning
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, alert_severity, alert_confirmed_count, alert_dismissed_count, created_at) VALUES
    (gen_random_uuid(), v_user5, v_neighborhood_id, 'alert',
     'Package thefts on E Berks Street',
     'Multiple neighbors have reported packages stolen from porches this week, usually between 2-4pm. Consider getting deliveries to a pickup point or ask a neighbor to grab them. Keep an eye out for a silver sedan.',
     'warning', 4, 0,
     now() - interval '3 hours')
  RETURNING id INTO v_post_alert_warning;

  -- 7. Alert: Info
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, alert_severity, alert_confirmed_count, alert_dismissed_count, created_at) VALUES
    (gen_random_uuid(), v_user3, v_neighborhood_id, 'alert',
     'Street cleaning schedule change',
     'Heads up — the city moved street cleaning from Tuesdays to Thursdays starting next week for our block. Don''t forget to move your cars!',
     'info', 2, 0,
     now() - interval '8 hours')
  RETURNING id INTO v_post_alert_info;

  -- 8. Recommendation
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, created_at) VALUES
    (gen_random_uuid(), v_user4, v_neighborhood_id, 'recommendation',
     'Amazing plumber — fixed my water heater same day',
     'Had an emergency with my water heater last week and called Rodriguez Plumbing (215-555-0147). They came out within 2 hours on a Saturday and fixed it for a very fair price. Mario was super professional and explained everything. Highly recommend for anyone in the neighborhood.',
     now() - interval '12 hours')
  RETURNING id INTO v_post_recommendation;

  -- 9. Recommendation 2
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, created_at) VALUES
    (gen_random_uuid(), v_user2, v_neighborhood_id, 'recommendation',
     'Wissahickon Pizza is criminally underrated',
     'If you haven''t tried their grandma slice yet, you''re missing out. Best pizza in the neighborhood IMO. They also do a great cheesesteak. Cash only though — fair warning.',
     now() - interval '2 days')
  RETURNING id INTO v_post_recommendation2;

  -- 10. Ask
  INSERT INTO posts (id, author_id, neighborhood_id, type, title, body, created_at) VALUES
    (gen_random_uuid(), v_user5, v_neighborhood_id, 'ask',
     'Good vet that takes new patients?',
     'Just adopted a rescue pup and need to find a vet nearby. Anyone have a recommendation for a good vet that''s accepting new patients? Ideally one that''s not too pricey — this little guy needs his shots.',
     now() - interval '4 hours')
  RETURNING id INTO v_post_ask;

  -- ============================================================
  -- COMMENTS — Varied threads on different posts
  -- ============================================================

  -- Comments on the chocolate factory discussion
  INSERT INTO comments (post_id, author_id, body, created_at) VALUES
    (v_post_discussion, v_user2, 'I heard it''s going to be mixed-use — retail on the ground floor with apartments above. The developer presented at the last RCO meeting.', now() - interval '1 hour 45 minutes'),
    (v_post_discussion, v_user3, 'Would really love a food hall there. We need more casual dining options that aren''t just another bar.', now() - interval '1 hour 30 minutes'),
    (v_post_discussion, v_user4, 'The plans showed a food hall component actually! Plus a co-working space. Construction timeline is about 18 months.', now() - interval '1 hour'),
    (v_post_discussion, v_user1, 'That sounds awesome. Hope they include some affordable retail space for local businesses, not just chains.', now() - interval '30 minutes');

  -- Comments on coffee spots
  INSERT INTO comments (post_id, author_id, body, created_at) VALUES
    (v_post_discussion2, v_user1, 'ReAnimator on Frankford Ave is my go-to. Great coffee, plenty of seating, and nobody bothers you.', now() - interval '5 hours'),
    (v_post_discussion2, v_user2, 'Seconding ReAnimator. Also check out Elixr on Sydenham — tiny but amazing pour-over.', now() - interval '4 hours 30 minutes'),
    (v_post_discussion2, v_user4, 'If you want a quieter vibe, the Fishtown branch of the Free Library has great Wi-Fi and is obviously free!', now() - interval '4 hours');

  -- Comments on block party event
  INSERT INTO comments (post_id, author_id, body, created_at) VALUES
    (v_post_event, v_user3, 'Can''t wait! I''ll bring my famous mac and cheese. Should I bring a folding table too?', now() - interval '20 hours'),
    (v_post_event, v_user1, 'Yes to the table! We can always use more. I''ll handle the kids'' games again.', now() - interval '18 hours'),
    (v_post_event, v_user5, 'Is there a rain date? Weather''s looking iffy for next Saturday.', now() - interval '12 hours');

  -- Comments on the urgent alert
  INSERT INTO comments (post_id, author_id, body, created_at) VALUES
    (v_post_alert_urgent, v_user2, 'Can confirm — water is ankle-deep at the intersection. Saw the crews arrive about 20 minutes ago.', now() - interval '40 minutes'),
    (v_post_alert_urgent, v_user4, 'Our water pressure dropped to almost nothing on E Thompson. Filling up pots now just in case.', now() - interval '35 minutes'),
    (v_post_alert_urgent, v_user5, 'PWD says estimated repair time is 4-6 hours. Might want to stock up on bottled water.', now() - interval '20 minutes');

  -- Comments on the ask about vets
  INSERT INTO comments (post_id, author_id, body, created_at) VALUES
    (v_post_ask, v_user1, 'We take our cats to Fishtown Animal Hospital on Girard. Dr. Chen is wonderful and they''re very reasonable.', now() - interval '3 hours 30 minutes'),
    (v_post_ask, v_user3, 'PAWS in Old City is great if you adopted from there — they offer discounted follow-up care. Otherwise +1 for Fishtown Animal Hospital.', now() - interval '3 hours');

  -- Comments on recommendation
  INSERT INTO comments (post_id, author_id, body, created_at) VALUES
    (v_post_recommendation, v_user2, 'Saved this — been looking for a good plumber. The last one I called never showed up.', now() - interval '10 hours');

  -- ============================================================
  -- VOTES (upvotes) — distribute across posts
  -- ============================================================

  -- Urgent alert gets many upvotes
  INSERT INTO votes (post_id, user_id) VALUES
    (v_post_alert_urgent, v_user2),
    (v_post_alert_urgent, v_user3),
    (v_post_alert_urgent, v_user4),
    (v_post_alert_urgent, v_user5);
  UPDATE posts SET upvote_count = 4 WHERE id = v_post_alert_urgent;

  -- Block party event popular
  INSERT INTO votes (post_id, user_id) VALUES
    (v_post_event, v_user1),
    (v_post_event, v_user3),
    (v_post_event, v_user5);
  UPDATE posts SET upvote_count = 3 WHERE id = v_post_event;

  -- Plumber recommendation
  INSERT INTO votes (post_id, user_id) VALUES
    (v_post_recommendation, v_user1),
    (v_post_recommendation, v_user2),
    (v_post_recommendation, v_user5);
  UPDATE posts SET upvote_count = 3 WHERE id = v_post_recommendation;

  -- Chocolate factory discussion
  INSERT INTO votes (post_id, user_id) VALUES
    (v_post_discussion, v_user2),
    (v_post_discussion, v_user4);
  UPDATE posts SET upvote_count = 2 WHERE id = v_post_discussion;

  -- Coffee spots
  INSERT INTO votes (post_id, user_id) VALUES
    (v_post_discussion2, v_user4);
  UPDATE posts SET upvote_count = 1 WHERE id = v_post_discussion2;

  -- Vet ask
  INSERT INTO votes (post_id, user_id) VALUES
    (v_post_ask, v_user3);
  UPDATE posts SET upvote_count = 1 WHERE id = v_post_ask;

  -- ============================================================
  -- UPDATE comment counts
  -- ============================================================
  UPDATE posts SET comment_count = 4 WHERE id = v_post_discussion;
  UPDATE posts SET comment_count = 3 WHERE id = v_post_discussion2;
  UPDATE posts SET comment_count = 3 WHERE id = v_post_event;
  UPDATE posts SET comment_count = 3 WHERE id = v_post_alert_urgent;
  UPDATE posts SET comment_count = 2 WHERE id = v_post_ask;
  UPDATE posts SET comment_count = 1 WHERE id = v_post_recommendation;

  RAISE NOTICE 'Seeded 10 posts, comments, and votes successfully!';
END $$;
