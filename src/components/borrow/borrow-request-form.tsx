"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface BorrowRequestFormProps {
  listingId: string;
  listingTitle: string;
  lenderName: string;
  onSuccess?: () => void;
}

export function BorrowRequestForm({
  listingId,
  listingTitle,
  lenderName,
  onSuccess,
}: BorrowRequestFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      const { data: listing } = await supabase
        .from("listings")
        .select("owner_id")
        .eq("id", listingId)
        .single();

      if (!listing) {
        setError("Listing not found.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("borrows").insert({
        listing_id: listingId,
        borrower_id: user.id,
        lender_id: listing.owner_id,
        status: "pending",
        message,
        pickup_date: pickupDate,
        expected_return_date: null,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/commons");
          router.refresh();
        }
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <span className="text-lg text-green-600">✓</span>
        </div>
        <p className="font-medium">Request sent!</p>
        <p className="mt-1 text-sm text-muted">
          {lenderName} will be notified.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-3 text-sm text-muted">
          Request to borrow <span className="font-medium text-foreground">{listingTitle}</span> from{" "}
          <span className="font-medium text-foreground">{lenderName}</span>
        </p>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the lender why you'd like to borrow this and when works for pickup..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label htmlFor="pickup-date" className="mb-1 block text-sm font-medium">
          Preferred pickup date
        </label>
        <input
          id="pickup-date"
          type="date"
          required
          min={today}
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Request"}
      </Button>
    </form>
  );
}
