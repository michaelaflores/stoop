import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/listing-card";
import { CategoryFilter } from "./category-filter";
import { CommonsMap } from "./commons-map";
import type { ListingWithOwner, ListingCategory } from "@/lib/supabase/types";

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

  // Fetch listings
  let query = supabase
    .from("listings")
    .select("*, profiles!listings_owner_id_fkey(display_name, avatar_url, reputation_tier)")
    .eq("neighborhood_id", neighborhoodId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data: listings } = await query;

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
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Map */}
      <div className="mb-4">
        <CommonsMap
          mapData={mapData}
          neighborhoodName={neighborhood?.name ?? "Your Neighborhood"}
        />
      </div>

      {/* Category filter */}
      <CategoryFilter activeCategory={params.category as ListingCategory | undefined} />

      {/* Listings grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {(listings as ListingWithOwner[] | null)?.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {(!listings || listings.length === 0) && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            No listings yet. Be the first to share something!
          </p>
        </div>
      )}

      {/* Add listing FAB */}
      <Link
        href="/commons/new"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 md:bottom-6"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
