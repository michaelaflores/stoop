import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  POST_TYPE_LABELS,
  POST_TYPE_ICONS,
  ALERT_SEVERITY_LABELS,
  type PostWithAuthor,
  type CommentWithAuthor,
  type AlertSeverity,
} from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { UpvoteButton } from "@/components/feed/upvote-button";
import { CommentSection } from "@/components/feed/comment-section";
import { AlertActions } from "@/components/feed/alert-actions";
import { FeedDetailRealtime } from "./realtime";

const severityStyles: Record<AlertSeverity, string> = {
  info: "bg-blue-50 text-blue-700",
  warning: "bg-accent/15 text-[#8E6D18]",
  urgent: "bg-alert/10 text-alert",
};

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch post with author
  const { data: post } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(display_name, avatar_url, reputation_tier)"
    )
    .eq("id", id)
    .single();

  if (!post) notFound();

  const typedPost = post as unknown as PostWithAuthor;
  const author = typedPost.profiles;

  // Fetch comments with authors
  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles!comments_author_id_fkey(display_name, avatar_url)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  // Check user's vote
  const { data: vote } = await supabase
    .from("votes")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Check user's alert response (for alert posts)
  let existingAlertResponse: "confirm" | "dismiss" | null = null;
  if (typedPost.type === "alert") {
    const { data: alertResp } = await supabase
      .from("alert_responses")
      .select("response_type")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    existingAlertResponse = (alertResp?.response_type as "confirm" | "dismiss") ?? null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <FeedDetailRealtime postId={id} />

      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      <div className="card p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="badge badge-category">
            {POST_TYPE_ICONS[typedPost.type]} {POST_TYPE_LABELS[typedPost.type]}
          </span>
          {typedPost.type === "alert" && typedPost.alert_severity && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                severityStyles[typedPost.alert_severity]
              )}
            >
              {ALERT_SEVERITY_LABELS[typedPost.alert_severity]}
            </span>
          )}
        </div>

        <div className="mb-3 flex items-center gap-2">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.display_name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {author.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-sm font-medium">{author.display_name}</span>
            <p className="text-xs text-muted">
              {formatDistanceToNow(new Date(typedPost.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <h1 className="mb-2 text-lg font-bold font-display">{typedPost.title}</h1>
        <p className="mb-3 text-sm whitespace-pre-wrap">{typedPost.body}</p>

        {typedPost.type === "event" && typedPost.event_starts_at && (
          <div className="mb-3 flex flex-col gap-1 rounded-lg bg-secondary/10 p-3 text-sm text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {format(new Date(typedPost.event_starts_at), "EEE, MMM d 'at' h:mm a")}
            </span>
            {typedPost.event_location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {typedPost.event_location}
              </span>
            )}
          </div>
        )}

        {typedPost.type === "alert" && (
          <div className="mb-3">
            <AlertActions
              postId={typedPost.id}
              userId={user.id}
              existingResponse={existingAlertResponse}
              confirmedCount={typedPost.alert_confirmed_count}
              dismissedCount={typedPost.alert_dismissed_count}
            />
          </div>
        )}

        <div className="mb-4 flex items-center border-t border-border pt-3">
          <UpvoteButton
            postId={typedPost.id}
            initialCount={typedPost.upvote_count}
            hasVoted={!!vote}
            userId={user.id}
          />
        </div>

        <div className="border-t border-border pt-4">
          <CommentSection
            comments={(comments ?? []) as CommentWithAuthor[]}
            postId={id}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}
