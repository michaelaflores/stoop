"use client";

import { useState, useEffect } from "react";
import { ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface UpvoteButtonProps {
  postId: string;
  initialCount: number;
  hasVoted: boolean;
  userId: string;
}

export function UpvoteButton({ postId, initialCount, hasVoted, userId }: UpvoteButtonProps) {
  const [voted, setVoted] = useState(hasVoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Sync with server data when router.refresh() delivers new props
  useEffect(() => { setCount(initialCount); }, [initialCount]);
  useEffect(() => { setVoted(hasVoted); }, [hasVoted]);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    const newVoted = !voted;

    // Optimistic update
    setVoted(newVoted);
    setCount((c) => c + (newVoted ? 1 : -1));

    if (newVoted) {
      const { error } = await supabase.from("votes").insert({ post_id: postId, user_id: userId });
      if (error) {
        // Revert optimistic update
        setVoted(false);
        setCount((c) => c - 1);
      }
      // Count is maintained by database trigger — no manual update needed
    } else {
      const { error } = await supabase.from("votes").delete().eq("post_id", postId).eq("user_id", userId);
      if (error) {
        // Revert optimistic update
        setVoted(true);
        setCount((c) => c + 1);
      }
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[40px] active:scale-[0.96]",
        voted
          ? "bg-primary/10 text-primary"
          : "text-muted hover:text-foreground hover:bg-border/60"
      )}
      aria-label={voted ? "Remove upvote" : "Upvote"}
    >
      <ArrowBigUp size={20} className={cn(voted && "fill-primary")} />
      {count}
    </button>
  );
}
