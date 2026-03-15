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
  warning: "bg-accent/15 text-[#8E6D18]",
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
    <Link href={`/feed/${post.id}`} className="card block p-4 transition-shadow hover:shadow-md active:shadow-md active:scale-[0.99]">
      <div className="mb-2 flex items-center gap-2">
        <span className="badge badge-category">
          {POST_TYPE_ICONS[post.type]} {POST_TYPE_LABELS[post.type]}
        </span>
        {post.type === "alert" && post.alert_severity && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              severityStyles[post.alert_severity]
            )}
          >
            {ALERT_SEVERITY_LABELS[post.alert_severity]}
          </span>
        )}
      </div>

      <div className="mb-2 flex items-center gap-2">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.display_name}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {author.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">{author.display_name}</span>
        <span className="text-xs text-muted">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </span>
      </div>

      <h3 className="mb-1 text-base font-bold font-display">{post.title}</h3>
      <p className="mb-2 text-sm text-muted line-clamp-3">{post.body}</p>

      {post.type === "event" && post.event_starts_at && (
        <div className="mb-2 flex flex-col gap-1 text-sm text-secondary">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {format(new Date(post.event_starts_at), "EEE, MMM d 'at' h:mm a")}
          </span>
          {post.event_location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {post.event_location}
            </span>
          )}
        </div>
      )}

      {post.type === "alert" && (
        <div className="mb-2 text-xs text-muted">
          {post.alert_confirmed_count} confirmed · {post.alert_dismissed_count} dismissed
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-border pt-2" onClick={(e) => e.preventDefault()}>
        <UpvoteButton
          postId={post.id}
          initialCount={post.upvote_count}
          hasVoted={hasVoted}
          userId={userId}
        />
        <span className="flex items-center gap-1 text-sm text-muted">
          <MessageCircle size={16} />
          {post.comment_count}
        </span>
      </div>
    </Link>
  );
}
