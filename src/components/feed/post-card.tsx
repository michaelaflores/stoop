"use client";

import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { MessageCircle, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POST_TYPE_LABELS,
  POST_TYPE_ICONS,
  ALERT_SEVERITY_LABELS,
  type PostWithAuthor,
  type AlertSeverity,
} from "@/lib/supabase/types";
import { UpvoteButton } from "./upvote-button";

const severityStyles: Record<AlertSeverity, string> = {
  info: "bg-blue-50 text-blue-700",
  warning: "bg-accent/15 text-[#7D6820]",
  urgent: "bg-alert/10 text-alert",
};

interface PostCardProps {
  post: PostWithAuthor;
  hasVoted: boolean;
  userId: string;
}

export function PostCard({ post, hasVoted, userId }: PostCardProps) {
  const author = post.profiles;

  return (
    <Link href={`/feed/${post.id}`} className="card block p-4 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]">
      <div className="mb-2.5 flex items-center gap-2 flex-wrap">
        <span className="badge badge-category">
          {POST_TYPE_ICONS[post.type]} {POST_TYPE_LABELS[post.type]}
        </span>
        {post.type === "alert" && post.alert_severity && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
              severityStyles[post.alert_severity]
            )}
          >
            {ALERT_SEVERITY_LABELS[post.alert_severity]}
          </span>
        )}
      </div>

      <div className="mb-2.5 flex items-center gap-2.5">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.display_name}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
            {author.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-semibold">{author.display_name}</span>
        <span className="text-xs text-muted">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </span>
      </div>

      <h3 className="mb-1.5 text-base font-bold font-display leading-snug">{post.title}</h3>
      <p className="mb-3 text-sm text-muted leading-relaxed line-clamp-3">{post.body}</p>

      {post.type === "event" && post.event_starts_at && (
        <div className="mb-3 flex flex-col gap-1.5 text-sm text-secondary-muted">
          <span className="flex items-center gap-1.5">
            <Calendar size={15} />
            {format(new Date(post.event_starts_at), "EEE, MMM d 'at' h:mm a")}
          </span>
          {post.event_location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} />
              {post.event_location}
            </span>
          )}
        </div>
      )}

      {post.type === "alert" && (
        <div className="mb-3 text-xs font-medium text-muted">
          {post.alert_confirmed_count} confirmed · {post.alert_dismissed_count} dismissed
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-3" onClick={(e) => e.preventDefault()}>
        <UpvoteButton
          postId={post.id}
          initialCount={post.upvote_count}
          hasVoted={hasVoted}
          userId={userId}
        />
        <span className="flex items-center gap-1.5 text-sm text-muted min-h-[40px] px-1">
          <MessageCircle size={18} />
          {post.comment_count}
        </span>
      </div>
    </Link>
  );
}
