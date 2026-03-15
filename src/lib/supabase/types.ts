// Auto-generated types will go here.
// Run `npx supabase gen types typescript --project-id <project-id>` to generate.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Placeholder types until we generate from the live schema.
// These match the schema defined in supabase/migrations/.

export type PostType =
  | "discussion"
  | "event"
  | "alert"
  | "recommendation"
  | "ask";

export type AlertSeverity = "info" | "warning" | "urgent";

export type ReputationTier =
  | "new_neighbor"
  | "regular"
  | "block_captain"
  | "neighborhood_legend";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  neighborhood_id: string | null;
  reputation_score: number;
  reputation_tier: ReputationTier;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  neighborhood_id: string;
  type: PostType;
  title: string;
  body: string;
  alert_severity: AlertSeverity | null;
  alert_confirmed_count: number;
  alert_dismissed_count: number;
  event_starts_at: string | null;
  event_location: string | null;
  photo_urls: string[] | null;
  upvote_count: number;
  comment_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
