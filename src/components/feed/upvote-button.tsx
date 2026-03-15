"use client";

import { useState } from "react";
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
      if (!error) {
        await supabase.from("posts").update({ upvote_count: count + 1 }).eq("id", postId);
      } else {
        setVoted(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase.from("votes").delete().eq("post_id", postId).eq("user_id", userId);
      if (!error) {
        await supabase.from("posts").update({ upvote_count: Math.max(0, count - 1) }).eq("id", postId);
      } else {
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
        "flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium transition-colors",
        voted
          ? "bg-primary/10 text-primary"
          : "text-muted hover:text-foreground hover:bg-border"
      )}
    >
      <ArrowBigUp size={18} className={cn(voted && "fill-primary")} />
      {count}
    </button>
  );
}
