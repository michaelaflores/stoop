"use client";

import { useFeedDetailRealtime } from "@/hooks/use-feed-realtime";

export function FeedDetailRealtime({ postId }: { postId: string }) {
  useFeedDetailRealtime(postId);
  return null;
}
