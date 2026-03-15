"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { CommentWithAuthor } from "@/lib/supabase/types";

interface CommentSectionProps {
  comments: CommentWithAuthor[];
  postId: string;
  userId: string;
}

export function CommentSection({ comments, postId, userId }: CommentSectionProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: userId,
      body: body.trim(),
    });

    if (!error) {
      // Count is maintained by database trigger — no manual update needed
      setBody("");
      router.refresh();
    }

    setSubmitting(false);
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 && (
        <p className="mb-4 text-sm text-muted">No comments yet. Be the first!</p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => {
          const author = comment.profiles;
          return (
            <div key={comment.id} className="flex gap-2">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.display_name}
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {author.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{author.display_name}</span>
                  <span className="text-xs text-muted">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button type="submit" size="sm" disabled={!body.trim() || submitting}>
          Post
        </Button>
      </form>
    </div>
  );
}
