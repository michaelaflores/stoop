import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { PostWithAuthor, PostType } from "@/lib/supabase/types";
import { FeedTypeFilter } from "./feed-type-filter";
import { PostCard } from "@/components/feed/post-card";
import { StoopPresence } from "@/components/feed/stoop-presence";

interface FeedPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) redirect("/onboarding");

  // Build posts query
  let query = supabase
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(display_name, avatar_url, reputation_tier)"
    )
    .eq("neighborhood_id", profile.neighborhood_id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(50);

  // Apply type filter
  const typeFilter = params.type as PostType | undefined;
  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const { data: posts } = await query;

  // Fetch user's votes
  const { data: votes } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", user.id);

  const votedPostIds = new Set(votes?.map((v) => v.post_id) ?? []);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <StoopPresence
        neighborhoodId={profile.neighborhood_id}
        userId={user.id}
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
      />

      <FeedTypeFilter />

      <div className="mt-4 space-y-3">
        {(posts ?? []).length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-muted">
              No posts yet. Be the first to share something with your neighbors!
            </p>
          </div>
        )}
        {((posts ?? []) as PostWithAuthor[]).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            hasVoted={votedPostIds.has(post.id)}
            userId={user.id}
          />
        ))}
      </div>

      {/* New post FAB */}
      <Link
        href="/feed/new"
        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95 transition-transform hover:scale-105 md:bottom-6 md:h-12 md:w-12"
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
