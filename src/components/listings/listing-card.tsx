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
      className={cn("card block overflow-hidden transition-shadow hover:shadow-md", className)}
    >
      {/* Photo area */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <ListingPlaceholder category={listing.category} className="h-full w-full" />
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-2">
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

        <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-1">
          {listing.title}
        </h3>

        {listing.condition && (
          <p className="mt-0.5 text-xs text-muted">{listing.condition}</p>
        )}

        <p className="mt-1.5 text-xs text-muted">
          {listing.profiles.display_name}
        </p>
      </div>
    </Link>
  );
}
