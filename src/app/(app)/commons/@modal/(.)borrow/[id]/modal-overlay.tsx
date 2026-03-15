"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { BorrowRequestForm } from "@/components/borrow/borrow-request-form";

interface ModalOverlayProps {
  listingId: string;
  listingTitle: string;
  lenderName: string;
}

export function ModalOverlay({
  listingId,
  listingTitle,
  lenderName,
}: ModalOverlayProps) {
  const router = useRouter();

  function handleClose() {
    router.back();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal card */}
      <div className="card relative z-10 mx-4 w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Request to Borrow</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-muted hover:bg-border hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <BorrowRequestForm
          listingId={listingId}
          listingTitle={listingTitle}
          lenderName={lenderName}
          onSuccess={handleClose}
        />
      </div>
    </div>
  );
}
