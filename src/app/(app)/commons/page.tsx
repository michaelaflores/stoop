import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/listing-card";
import { CategoryFilter } from "./category-filter";
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

  let query = supabase
    .from("listings")
    .select("*, profiles!listings_owner_id_fkey(display_name, avatar_url, reputation_tier)")
    .eq("neighborhood_id", profile!.neighborhood_id!)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data: listings } = await query;

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Map placeholder */}
      <div className="card mb-4 flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[#e8e0d5] to-[#d5cdc2] md:h-56">
        <div className="flex flex-col items-center gap-2 text-muted">
          <MapPin size={28} />
          <span className="text-sm font-medium">Map coming soon</span>
        </div>
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
