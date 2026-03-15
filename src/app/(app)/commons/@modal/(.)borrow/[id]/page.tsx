import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ModalOverlay } from "./modal-overlay";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BorrowModalPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check for existing active borrow request — prevent duplicates
  const { data: existingBorrow } = await supabase
    .from("borrows")
    .select("id")
    .eq("listing_id", id)
    .eq("borrower_id", user.id)
    .in("status", ["pending", "approved", "active"])
    .limit(1)
    .maybeSingle();

  if (existingBorrow) {
    redirect(`/commons/${id}`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, profiles!listings_owner_id_fkey(display_name)"
    )
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const profiles = listing.profiles as unknown as { display_name: string } | { display_name: string }[];
  const lenderName = Array.isArray(profiles) ? profiles[0]?.display_name : profiles?.display_name;

  return (
    <ModalOverlay
      listingId={listing.id}
      listingTitle={listing.title}
      lenderName={lenderName ?? "Neighbor"}
    />
  );
}
