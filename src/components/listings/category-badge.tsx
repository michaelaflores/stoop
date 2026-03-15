import { cn } from "@/lib/utils";
import {
  ListingCategory,
  LISTING_CATEGORY_LABELS,
} from "@/lib/supabase/types";

interface CategoryBadgeProps {
  category: ListingCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span className={cn("badge badge-category", className)}>
      {LISTING_CATEGORY_LABELS[category]}
    </span>
  );
}
