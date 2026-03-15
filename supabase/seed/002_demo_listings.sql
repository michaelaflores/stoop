-- ============================================================
-- Demo Listings Seed
-- Run in Supabase SQL Editor (bypasses RLS)
-- 
-- Creates a demo user "Stoop Demo" and 10 realistic listings
-- in the same neighborhood as the first real user found,
-- or defaults to Fishtown.
-- ============================================================

DO $$
DECLARE
  demo_user_id UUID;
  target_neighborhood_id UUID;
  demo_email TEXT := 'demo@stoop.app';
BEGIN
  -- Find the neighborhood of the first real user, or fall back to Fishtown
  SELECT p.neighborhood_id INTO target_neighborhood_id
  FROM public.profiles p
  WHERE p.neighborhood_id IS NOT NULL
  ORDER BY p.created_at ASC
  LIMIT 1;

  IF target_neighborhood_id IS NULL THEN
    SELECT id INTO target_neighborhood_id
    FROM public.neighborhoods
    WHERE slug = 'fishtown'
    LIMIT 1;
  END IF;

  IF target_neighborhood_id IS NULL THEN
    RAISE EXCEPTION 'No neighborhoods found. Run the neighborhood seed first.';
  END IF;

  -- Check if demo user already exists in profiles
  SELECT id INTO demo_user_id
  FROM public.profiles
  WHERE display_name = 'Stoop Demo';

  -- If no demo user, create one via auth.users + profile
  IF demo_user_id IS NULL THEN
    demo_user_id := gen_random_uuid();
    
    -- Insert into auth.users (minimal record for the demo user)
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      demo_user_id,
      '00000000-0000-0000-0000-000000000000',
      demo_email,
      crypt('demo-password-not-for-login', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      format('{"display_name":"Stoop Demo"}')::jsonb,
      'authenticated', 'authenticated', now(), now(),
      '', '', '', ''
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert profile
    INSERT INTO public.profiles (id, display_name, neighborhood_id, reputation_score, reputation_tier)
    VALUES (demo_user_id, 'Stoop Demo', target_neighborhood_id, 45, 'regular')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Clear any existing demo listings
  DELETE FROM public.listings WHERE owner_id = demo_user_id;

  -- Insert 10 demo listings across categories
  INSERT INTO public.listings (owner_id, neighborhood_id, type, category, title, description, condition, max_borrow_days, status) VALUES
  (
    demo_user_id, target_neighborhood_id, 'item', 'tools',
    'DeWalt Cordless Drill',
    'Powerful 20V cordless drill with two batteries and charger. Great for hanging shelves, assembling furniture, or any project around the house. Comes with a full bit set.',
    'Great — batteries hold full charge',
    5, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'tools',
    'Pressure Washer (Electric)',
    'Sun Joe 2030 PSI electric pressure washer. Perfect for cleaning sidewalks, patios, siding, and cars. Comes with multiple nozzle tips.',
    'Like new — used twice',
    3, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'kitchen',
    'KitchenAid Stand Mixer',
    'Classic 5-quart stand mixer in Empire Red. Includes paddle, whisk, and dough hook attachments. Makes baking so much easier.',
    'Good — small scratch on base',
    4, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'outdoor',
    'Coleman 6-Person Tent',
    'Dome tent that fits 6 comfortably (or 4 with gear). Sets up in about 10 minutes. Weatherproof — survived a downpour at Ricketts Glen last summer.',
    'Good — minor wear on zipper',
    7, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'recreation',
    'Acoustic Guitar (Yamaha FG800)',
    'Solid spruce top, great tone for a beginner or intermediate player. Comes with a soft case, capo, and extra strings.',
    'Great — plays beautifully',
    14, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'household',
    'Bissell Carpet Cleaner',
    'ProHeat carpet cleaner — deep cleans carpets and rugs. I use it twice a year, happy to lend between uses. Comes with cleaning solution.',
    'Works perfectly',
    3, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'electronics',
    'Portable Projector (Anker Nebula)',
    'Mini projector with built-in speaker. Connects via HDMI or Bluetooth. Great for movie nights or backyard screenings. Surprisingly bright.',
    'Great — includes carrying case',
    5, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'item', 'tools',
    'Extension Ladder (24 ft)',
    'Werner aluminum extension ladder. Reaches second-story gutters easily. Folds down for transport. Can deliver within a few blocks.',
    'Good — some paint splatter',
    3, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'skill', 'skill_handyman',
    'Furniture Assembly Help',
    'Happy to help assemble IKEA furniture, mount TVs, or hang heavy things. I have all the tools. Usually takes 1-2 hours depending on the project.',
    NULL,
    1, 'available'
  ),
  (
    demo_user_id, target_neighborhood_id, 'skill', 'skill_tech',
    'WiFi / Home Network Setup',
    'Can help optimize your WiFi, set up mesh networks, or troubleshoot dead zones. I work in IT — this is my thing. Free for neighbors!',
    NULL,
    1, 'available'
  );

  RAISE NOTICE 'Seeded 10 demo listings in neighborhood % for user %', target_neighborhood_id, demo_user_id;
END $$;
