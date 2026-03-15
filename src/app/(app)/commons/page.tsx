import { createClient } from "@/lib/supabase/server";
import { CommonsContent } from "./commons-content";
import type { ListingWithOwner } from "@/lib/supabase/types";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CommonsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user!.id)
    .single();

  const neighborhoodId = profile!.neighborhood_id!;

  // Fetch ALL listings (filtering is client-side to avoid map re-render)
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles!listings_owner_id_fkey(display_name, avatar_url, reputation_tier)")
    .eq("neighborhood_id", neighborhoodId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Fetch map data via RPC (may fail if RPC not yet created)
  let mapData = null;
  try {
    const { data, error } = await supabase.rpc("get_neighborhood_map_data", {
      target_neighborhood_id: neighborhoodId,
    });
    if (!error && data) {
      mapData = data;
    }
  } catch {
    // RPC not available yet — fall through to fallback
  }

  // Fallback: if RPC failed, fetch boundary/center directly
  if (!mapData) {
    try {
      const { data: geoData } = await supabase
        .from("neighborhoods")
        .select("name, boundary::text, center::text")
        .eq("id", neighborhoodId)
        .single();

      if (geoData?.center) {
        // Parse the center point text (POINT(lng lat))
        const centerMatch = geoData.center.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        const center: [number, number] | null = centerMatch
          ? [parseFloat(centerMatch[1]), parseFloat(centerMatch[2])]
          : null;

        mapData = {
          boundary: null, // Can't easily parse WKT MultiPolygon client-side
          center,
          listings: [],
        };
      }
    } catch {
      // No map data available
    }
  }

  // Fetch neighborhood name
  const { data: neighborhood } = await supabase
    .from("neighborhoods")
    .select("name")
    .eq("id", neighborhoodId)
    .single();

  return (
    <CommonsContent
      listings={(listings as ListingWithOwner[]) ?? []}
      mapData={mapData}
      neighborhoodName={neighborhood?.name ?? "Your Neighborhood"}
      initialCategory={params.category}
    />
  );
}
