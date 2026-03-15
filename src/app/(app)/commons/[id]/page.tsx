import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryBadge } from "@/components/listings/category-badge";
import { ListingPlaceholder } from "@/components/listings/listing-placeholder";
import {
  REPUTATION_TIER_LABELS,
  type ListingWithOwner,
} from "@/lib/supabase/types";
import { ListingDetailRealtime } from "./realtime-wrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "*, profiles!listings_owner_id_fkey(display_name, avatar_url, reputation_tier)"
    )
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const item = listing as ListingWithOwner;
  const photoUrl = item.photo_urls?.[0];
  const isOwner = user?.id === item.owner_id;

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      {user && <ListingDetailRealtime userId={user.id} />}

      {/* Back link */}
      <Link
        href="/commons"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Commons
      </Link>

      {/* Photo */}
      <div className="card mb-4 overflow-hidden">
        <div className="aspect-[4/3] w-full">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ListingPlaceholder category={item.category} className="h-full w-full" />
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CategoryBadge category={item.category} />
          <span
            className={`badge ${
              item.status === "available" ? "badge-available" : "badge-borrowed"
            }`}
          >
            {item.status === "available" ? "Available" : "Borrowed"}
          </span>
        </div>

        <h1 className="text-lg font-bold font-display">{item.title}</h1>

        <p className="text-sm leading-relaxed text-muted">
          {item.description}
        </p>

        {item.condition && (
          <div className="text-sm">
            <span className="font-medium">Condition:</span>{" "}
            <span className="text-muted">{item.condition}</span>
          </div>
        )}

        <div className="text-sm">
          <span className="font-medium">Max borrow:</span>{" "}
          <span className="text-muted">{item.max_borrow_days} days</span>
        </div>

        {/* Owner */}
        <div className="card flex items-center gap-3 p-3">
          {item.profiles.avatar_url ? (
            <img
              src={item.profiles.avatar_url}
              alt={item.profiles.display_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {item.profiles.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">
              {item.profiles.display_name}
            </p>
            <p className="text-xs text-muted">
              {REPUTATION_TIER_LABELS[item.profiles.reputation_tier]}
            </p>
          </div>
        </div>

        {/* Action button — only show if available and not the owner */}
        {item.status === "available" && !isOwner && (
          <Link
            href={`/commons/borrow/${item.id}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            Request to Borrow
          </Link>
        )}
      </div>
    </div>
  );
}
