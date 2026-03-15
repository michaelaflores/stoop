import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  REPUTATION_TIER_LABELS,
  type ListingWithOwner,
  type ReputationTier,
} from "@/lib/supabase/types";
import { ProfileTabs } from "./profile-tabs";
import { ProfileRealtime } from "./borrow-actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  // Fetch user's listings with profile info (for ListingCard compatibility)
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles!listings_owner_id_fkey(display_name, avatar_url, reputation_tier)")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Fetch incoming borrows (as lender)
  const { data: incomingBorrows } = await supabase
    .from("borrows")
    .select("*, listings(id, title, photo_urls), borrower:profiles!borrows_borrower_id_fkey(display_name, avatar_url)")
    .eq("lender_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch outgoing borrows (as borrower)
  const { data: outgoingBorrows } = await supabase
    .from("borrows")
    .select("*, listings(id, title, photo_urls), lender:profiles!borrows_lender_id_fkey(display_name, avatar_url)")
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  const pendingCount = incomingBorrows?.filter((b) => b.status === "pending").length ?? 0;

  // Map the joined data to the expected shape
  const mappedIncoming = (incomingBorrows ?? []).map((b) => ({
    ...b,
    borrower_profile: b.borrower,
  }));

  const mappedOutgoing = (outgoingBorrows ?? []).map((b) => ({
    ...b,
    lender_profile: b.lender,
  }));

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <ProfileRealtime userId={user.id} />

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold">{profile.display_name}</h1>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="badge badge-category">
              {REPUTATION_TIER_LABELS[profile.reputation_tier as ReputationTier]}
            </span>
            <span className="text-xs text-muted">
              {profile.reputation_score} pts
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            Member since {format(new Date(profile.created_at), "MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs
        listings={(listings ?? []) as ListingWithOwner[]}
        incomingBorrows={mappedIncoming}
        outgoingBorrows={mappedOutgoing}
        pendingCount={pendingCount}
        userId={user.id}
      />
    </div>
  );
}
