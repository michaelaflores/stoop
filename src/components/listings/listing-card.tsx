import Link from "next/link";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import { ListingPlaceholder } from "./listing-placeholder";
import type { ListingWithOwner } from "@/lib/supabase/types";

interface ListingCardProps {
  listing: ListingWithOwner;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const photoUrl = listing.photo_urls?.[0];

  return (
    <Link
      href={`/commons/${listing.id}`}
      className={cn(
        "card group block overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98]",
        className
      )}
    >
      {/* Photo area */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-border/30">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ListingPlaceholder category={listing.category} className="h-full w-full" />
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={listing.category} />
          <span
            className={cn(
              "badge",
              listing.status === "available"
                ? "badge-available"
                : "badge-borrowed"
            )}
          >
            {listing.status === "available" ? "Available" : "Borrowed"}
          </span>
        </div>

        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {listing.title}
        </h3>

        {listing.condition && (
          <p className="mt-1 text-xs text-muted">{listing.condition}</p>
        )}

        <p className="mt-2 text-xs font-medium text-muted">
          {listing.profiles.display_name}
        </p>
      </div>
    </Link>
  );
}
