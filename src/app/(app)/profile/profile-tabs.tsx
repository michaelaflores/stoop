"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { StatusTracker } from "@/components/borrow/status-tracker";
import { BorrowActionButtons } from "./borrow-actions";
import type { ListingWithOwner, Borrow, Profile, Listing } from "@/lib/supabase/types";
import { format } from "date-fns";

type Tab = "listings" | "requests" | "borrows";

interface BorrowWithListing extends Borrow {
  listings: Pick<Listing, "id" | "title" | "photo_urls">;
}

interface IncomingBorrow extends BorrowWithListing {
  borrower_profile: Pick<Profile, "display_name" | "avatar_url">;
}

interface OutgoingBorrow extends BorrowWithListing {
  lender_profile: Pick<Profile, "display_name" | "avatar_url">;
}

interface ProfileTabsProps {
  listings: ListingWithOwner[];
  incomingBorrows: IncomingBorrow[];
  outgoingBorrows: OutgoingBorrow[];
  pendingCount: number;
  userId: string;
}

export function ProfileTabs({
  listings,
  incomingBorrows,
  outgoingBorrows,
  pendingCount,
  userId,
}: ProfileTabsProps) {
  const [active, setActive] = useState<Tab>("listings");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "listings", label: "My Listings" },
    { key: "requests", label: "Requests", count: pendingCount || undefined },
    { key: "borrows", label: "My Borrows" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "relative whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
              active === tab.key
                ? "text-primary"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                {tab.count}
              </span>
            )}
            {active === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "listings" && (
        <div>
          {listings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              You haven&apos;t listed anything yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}

      {active === "requests" && (
        <div className="space-y-3">
          {incomingBorrows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No borrow requests yet.
            </p>
          ) : (
            incomingBorrows.map((borrow) => (
              <div key={borrow.id} className="card p-4">
                <div className="flex gap-3">
                  {/* Listing thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                    {borrow.listings.photo_urls?.[0] ? (
                      <img
                        src={borrow.listings.photo_urls[0]}
                        alt={borrow.listings.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: "linear-gradient(135deg, #f0ece6 0%, #ddd4c8 100%)",
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {borrow.listings.title}
                    </p>

                    {/* Borrower info */}
                    <div className="mt-1 flex items-center gap-1.5">
                      {borrow.borrower_profile.avatar_url ? (
                        <img
                          src={borrow.borrower_profile.avatar_url}
                          alt={borrow.borrower_profile.display_name}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[8px] font-medium text-primary">
                          {borrow.borrower_profile.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-muted">
                        {borrow.borrower_profile.display_name}
                      </span>
                    </div>

                    {borrow.message && (
                      <p className="mt-1.5 text-xs text-muted line-clamp-2">
                        &ldquo;{borrow.message}&rdquo;
                      </p>
                    )}

                    {borrow.pickup_date && (
                      <p className="mt-1 text-xs text-muted">
                        Pickup: {format(new Date(borrow.pickup_date), "MMM d, yyyy")}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <StatusTracker status={borrow.status} />
                      {borrow.status === "pending" && (
                        <BorrowActionButtons borrowId={borrow.id} action="approve-decline" />
                      )}
                      {borrow.status === "approved" && (
                        <BorrowActionButtons borrowId={borrow.id} action="confirm-pickup" />
                      )}
                      {borrow.status === "active" && (
                        <BorrowActionButtons borrowId={borrow.id} action="confirm-return" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {active === "borrows" && (
        <div className="space-y-3">
          {outgoingBorrows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              You haven&apos;t borrowed anything yet.
            </p>
          ) : (
            outgoingBorrows.map((borrow) => (
              <div key={borrow.id} className="card p-4">
                <div className="flex gap-3">
                  {/* Listing thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                    {borrow.listings.photo_urls?.[0] ? (
                      <img
                        src={borrow.listings.photo_urls[0]}
                        alt={borrow.listings.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: "linear-gradient(135deg, #f0ece6 0%, #ddd4c8 100%)",
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {borrow.listings.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      from {borrow.lender_profile.display_name}
                    </p>

                    {borrow.expected_return_date && borrow.status === "active" && (
                      <p className="mt-1 text-xs text-muted">
                        Return by: {format(new Date(borrow.expected_return_date), "MMM d, yyyy")}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <StatusTracker status={borrow.status} />
                      {borrow.status === "pending" && (
                        <BorrowActionButtons borrowId={borrow.id} action="cancel" />
                      )}
                      {borrow.status === "approved" && (
                        <BorrowActionButtons borrowId={borrow.id} action="confirm-pickup" />
                      )}
                      {borrow.status === "active" && (
                        <BorrowActionButtons borrowId={borrow.id} action="confirm-return" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
