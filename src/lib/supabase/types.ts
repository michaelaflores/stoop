// Manual types matching supabase/migrations/00001_initial_schema.sql
// Replace with auto-generated types later:
//   npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/database.types.ts

export type ListingType = "item" | "skill";
export type ListingStatus = "available" | "borrowed" | "unavailable";
export type ListingCategory =
  | "tools"
  | "kitchen"
  | "outdoor"
  | "recreation"
  | "household"
  | "electronics"
  | "skill_handyman"
  | "skill_tutoring"
  | "skill_pet"
  | "skill_tech"
  | "skill_other";

export type BorrowStatus =
  | "pending"
  | "approved"
  | "active"
  | "returned"
  | "declined"
  | "cancelled";

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

// ----- Row types -----

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  // boundary and center are PostGIS geometry — not returned by default
  created_at: string;
}

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

export interface Listing {
  id: string;
  owner_id: string;
  neighborhood_id: string;
  type: ListingType;
  category: ListingCategory;
  title: string;
  description: string;
  condition: string | null;
  max_borrow_days: number;
  photo_urls: string[] | null;
  status: ListingStatus;
  borrow_count: number;
  avg_rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingWithOwner extends Listing {
  profiles: Pick<Profile, "display_name" | "avatar_url" | "reputation_tier">;
}

export interface Borrow {
  id: string;
  listing_id: string;
  borrower_id: string;
  lender_id: string;
  status: BorrowStatus;
  message: string | null;
  pickup_date: string | null;
  expected_return_date: string | null;
  actual_return_date: string | null;
  borrower_confirmed_pickup: boolean;
  lender_confirmed_pickup: boolean;
  borrower_confirmed_return: boolean;
  lender_confirmed_return: boolean;
  borrower_rating: number | null;
  lender_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  requester_id: string;
  neighborhood_id: string;
  title: string;
  description: string;
  needed_by: string | null;
  is_fulfilled: boolean;
  fulfilled_by_listing_id: string | null;
  created_at: string;
  updated_at: string;
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

export interface PostWithAuthor extends Post {
  profiles: Pick<Profile, "display_name" | "avatar_url" | "reputation_tier">;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  profiles: Pick<Profile, "display_name" | "avatar_url">;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// ----- Helpers -----

export const LISTING_CATEGORY_LABELS: Record<ListingCategory, string> = {
  tools: "Tools",
  kitchen: "Kitchen",
  outdoor: "Outdoor",
  recreation: "Recreation",
  household: "Household",
  electronics: "Electronics",
  skill_handyman: "Handyman",
  skill_tutoring: "Tutoring",
  skill_pet: "Pet Care",
  skill_tech: "Tech Help",
  skill_other: "Other Skill",
};

export const ITEM_CATEGORIES: ListingCategory[] = [
  "tools",
  "kitchen",
  "outdoor",
  "recreation",
  "household",
  "electronics",
];

export const SKILL_CATEGORIES: ListingCategory[] = [
  "skill_handyman",
  "skill_tutoring",
  "skill_pet",
  "skill_tech",
  "skill_other",
];

export const REPUTATION_TIER_LABELS: Record<ReputationTier, string> = {
  new_neighbor: "New Neighbor",
  regular: "Regular",
  block_captain: "Block Captain",
  neighborhood_legend: "Neighborhood Legend",
};

export const POST_TYPE_LABELS: Record<PostType, string> = {
  discussion: "Discussion",
  event: "Event",
  alert: "Alert",
  recommendation: "Recommendation",
  ask: "Ask",
};

export const POST_TYPE_ICONS: Record<PostType, string> = {
  discussion: "💬",
  event: "📅",
  alert: "⚠️",
  recommendation: "⭐",
  ask: "❓",
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: "Info",
  warning: "Warning",
  urgent: "Urgent",
};

// ----- Search & Leaderboard -----

export interface SearchResult {
  id: string;
  source_type: "listing" | "post" | "request";
  title: string;
  snippet: string;
  author_name: string;
  author_avatar: string | null;
  category: string;
  created_at: string;
  relevance: number;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  reputation_score: number;
  reputation_tier: ReputationTier;
}
