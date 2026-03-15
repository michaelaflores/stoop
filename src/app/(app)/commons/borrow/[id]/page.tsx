import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BorrowRequestForm } from "@/components/borrow/borrow-request-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BorrowPage({ params }: Props) {
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
    // Already have an active request — send back to listing detail
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
    <div className="mx-auto max-w-md px-4 py-6">
      <Link
        href={`/commons/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to listing
      </Link>

      <div className="card p-5">
        <h1 className="mb-4 text-base font-bold">Request to Borrow</h1>
        <BorrowRequestForm
          listingId={listing.id}
          listingTitle={listing.title}
          lenderName={lenderName ?? "Neighbor"}
        />
      </div>
    </div>
  );
}
