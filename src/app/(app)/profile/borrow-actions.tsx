"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useBorrowRealtime } from "@/hooks/use-borrow-realtime";

export function ProfileRealtime({ userId }: { userId: string }) {
  useBorrowRealtime(userId);
  return null;
}

interface ActionButtonsProps {
  borrowId: string;
  action: "approve-decline" | "confirm-pickup" | "confirm-return" | "cancel";
}

export function BorrowActionButtons({ borrowId, action }: ActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(type: string) {
    setLoading(type);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (type === "approve") {
        // Get the borrow to find listing info
        const { data: borrow } = await supabase
          .from("borrows")
          .select("listing_id, pickup_date")
          .eq("id", borrowId)
          .single();

        if (!borrow) return;

        // Get listing max_borrow_days
        const { data: listing } = await supabase
          .from("listings")
          .select("max_borrow_days")
          .eq("id", borrow.listing_id)
          .single();

        if (!listing) return;

        // Calculate expected return date
        const pickup = new Date(borrow.pickup_date || new Date());
        pickup.setDate(pickup.getDate() + listing.max_borrow_days);
        const expectedReturn = pickup.toISOString().split("T")[0];

        await supabase
          .from("borrows")
          .update({ status: "approved", expected_return_date: expectedReturn })
          .eq("id", borrowId);

        await supabase
          .from("listings")
          .update({ status: "borrowed" })
          .eq("id", borrow.listing_id);
      } else if (type === "decline") {
        await supabase
          .from("borrows")
          .update({ status: "declined" })
          .eq("id", borrowId);
      } else if (type === "cancel") {
        await supabase
          .from("borrows")
          .update({ status: "cancelled" })
          .eq("id", borrowId);
      } else if (type === "confirm-pickup") {
        // Figure out if user is borrower or lender
        const { data: borrow } = await supabase
          .from("borrows")
          .select("borrower_id, lender_id, borrower_confirmed_pickup, lender_confirmed_pickup")
          .eq("id", borrowId)
          .single();

        if (!borrow) return;

        const isBorrower = borrow.borrower_id === user.id;
        const field = isBorrower ? "borrower_confirmed_pickup" : "lender_confirmed_pickup";

        await supabase
          .from("borrows")
          .update({ [field]: true })
          .eq("id", borrowId);

        // Check if both confirmed
        const otherConfirmed = isBorrower
          ? borrow.lender_confirmed_pickup
          : borrow.borrower_confirmed_pickup;

        if (otherConfirmed) {
          await supabase
            .from("borrows")
            .update({ status: "active" })
            .eq("id", borrowId);
        }
      } else if (type === "confirm-return") {
        const { data: borrow } = await supabase
          .from("borrows")
          .select("borrower_id, lender_id, borrower_confirmed_return, lender_confirmed_return, listing_id")
          .eq("id", borrowId)
          .single();

        if (!borrow) return;

        const isBorrower = borrow.borrower_id === user.id;
        const field = isBorrower ? "borrower_confirmed_return" : "lender_confirmed_return";

        await supabase
          .from("borrows")
          .update({ [field]: true })
          .eq("id", borrowId);

        const otherConfirmed = isBorrower
          ? borrow.lender_confirmed_return
          : borrow.borrower_confirmed_return;

        if (otherConfirmed) {
          await supabase
            .from("borrows")
            .update({
              status: "returned",
              actual_return_date: new Date().toISOString().split("T")[0],
            })
            .eq("id", borrowId);

          // Set listing back to available
          await supabase
            .from("listings")
            .update({ status: "available" })
            .eq("id", borrow.listing_id);
        }
      }
    } finally {
      setLoading(null);
      router.refresh();
    }
  }

  if (action === "approve-decline") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
        >
          {loading === "approve" ? "..." : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("decline")}
          disabled={loading !== null}
        >
          {loading === "decline" ? "..." : "Decline"}
        </Button>
      </div>
    );
  }

  if (action === "confirm-pickup") {
    return (
      <Button
        size="sm"
        onClick={() => handleAction("confirm-pickup")}
        disabled={loading !== null}
      >
        {loading ? "..." : "Confirm Pickup"}
      </Button>
    );
  }

  if (action === "confirm-return") {
    return (
      <Button
        size="sm"
        onClick={() => handleAction("confirm-return")}
        disabled={loading !== null}
      >
        {loading ? "..." : "Confirm Return"}
      </Button>
    );
  }

  if (action === "cancel") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction("cancel")}
        disabled={loading !== null}
      >
        {loading ? "..." : "Cancel Request"}
      </Button>
    );
  }

  return null;
}
