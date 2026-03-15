-- ============================================================
-- Map RPC: Get neighborhood boundary + scattered listing pins
-- Run in Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_neighborhood_map_data(target_neighborhood_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'boundary', (
      SELECT ST_AsGeoJSON(n.boundary)::json
      FROM public.neighborhoods n
      WHERE n.id = target_neighborhood_id
    ),
    'center', (
      SELECT json_build_array(
        ST_X(n.center),
        ST_Y(n.center)
      )
      FROM public.neighborhoods n
      WHERE n.id = target_neighborhood_id
    ),
    'listings', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', l.id,
        'title', l.title,
        'category', l.category,
        'status', l.status,
        'point', json_build_array(
          ST_X(random_pt.geom),
          ST_Y(random_pt.geom)
        )
      )), '[]'::json)
      FROM public.listings l
      CROSS JOIN LATERAL (
        SELECT (ST_Dump(
          ST_GeneratePoints(
            (SELECT n.boundary FROM public.neighborhoods n WHERE n.id = target_neighborhood_id),
            1
          )
        )).geom
      ) AS random_pt
      WHERE l.neighborhood_id = target_neighborhood_id
        AND l.is_active = true
    )
  ) INTO result;

  RETURN result;
END;
$$;
