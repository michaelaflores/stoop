"use client";

import { useBorrowRealtime } from "@/hooks/use-borrow-realtime";

export function ListingDetailRealtime({ userId }: { userId: string }) {
  useBorrowRealtime(userId);
  return null;
}
