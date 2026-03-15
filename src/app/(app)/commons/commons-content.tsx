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
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <button
          onClick={() => handleCategoryChange(undefined)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] active:scale-[0.96]",
            !activeCategory
              ? "bg-primary text-white shadow-sm"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-foreground/20"
          )}
        >
          All
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] active:scale-[0.96]",
              activeCategory === cat
                ? "bg-primary text-white shadow-sm"
                : "bg-surface border border-border text-muted hover:text-foreground hover:border-foreground/20"
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
        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(30,58,95,0.35)] active:scale-95 transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(30,58,95,0.45)] md:bottom-6 md:h-12 md:w-12"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label="Add new listing"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
