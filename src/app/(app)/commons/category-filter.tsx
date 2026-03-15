"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LISTING_CATEGORY_LABELS,
  ITEM_CATEGORIES,
  SKILL_CATEGORIES,
  type ListingCategory,
} from "@/lib/supabase/types";

interface CategoryFilterProps {
  activeCategory?: ListingCategory;
}

const allCategories = [...ITEM_CATEGORIES, ...SKILL_CATEGORIES];

export function CategoryFilter({ activeCategory }: CategoryFilterProps) {
  return (
    <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <Link
        href="/commons"
        className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
          !activeCategory
            ? "bg-primary text-white"
            : "bg-surface border border-border text-muted hover:text-foreground"
        )}
      >
        All
      </Link>
      {allCategories.map((cat) => (
        <Link
          key={cat}
          href={`/commons?category=${cat}`}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeCategory === cat
              ? "bg-primary text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"
          )}
        >
          {LISTING_CATEGORY_LABELS[cat]}
        </Link>
      ))}
    </div>
  );
}
