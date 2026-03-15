"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { CommonsMap } from "./commons-map";
import { cn } from "@/lib/utils";
import {
  LISTING_CATEGORY_LABELS,
  ITEM_CATEGORIES,
  SKILL_CATEGORIES,
  type ListingCategory,
  type ListingWithOwner,
} from "@/lib/supabase/types";

const allCategories = [...ITEM_CATEGORIES, ...SKILL_CATEGORIES];

interface CommonsContentProps {
  listings: ListingWithOwner[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapData: any;
  neighborhoodName: string;
  initialCategory?: string;
}

export function CommonsContent({
  listings,
  mapData,
  neighborhoodName,
  initialCategory,
}: CommonsContentProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    initialCategory
  );

  // Stable refs for map props — these never change after initial render
  const stableMapData = useRef(mapData).current;
  const stableNeighborhoodName = useRef(neighborhoodName).current;

  const handleCategoryChange = useCallback(
    (category: string | undefined) => {
      setActiveCategory(category);
      // Sync URL without server re-render
      const url = category ? `/commons?category=${category}` : "/commons";
      router.replace(url, { scroll: false });
    },
    [router]
  );

  const filteredListings = useMemo(() => {
    if (!activeCategory) return listings;
    return listings.filter((l) => l.category === activeCategory);
  }, [listings, activeCategory]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* Map — stable refs, memo'd component, never re-renders on filter change */}
      <div className="mb-4">
        <CommonsMap
          mapData={stableMapData}
          neighborhoodName={stableNeighborhoodName}
        />
      </div>

      {/* Category filter */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          onClick={() => handleCategoryChange(undefined)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            !activeCategory
              ? "bg-primary text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"
          )}
        >
          All
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            )}
          >
            {LISTING_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            {activeCategory
              ? "No listings in this category yet."
              : "No listings yet. Be the first to share something!"}
          </p>
        </div>
      )}

      {/* Add listing FAB */}
      <Link
        href="/commons/new"
        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95 transition-transform hover:scale-105 md:bottom-6 md:h-12 md:w-12"
        style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
