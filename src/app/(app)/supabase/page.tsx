import {
  Shield,
  Lock,
  Radio,
  Users,
  Megaphone,
  Image,
  MapPin,
  Brain,
  Search,
  Clock,
  Zap,
  Activity,
  Webhook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureCategory = "auth" | "realtime" | "data";

interface Feature {
  icon: LucideIcon;
  name: string;
  description: string;
  category: FeatureCategory;
  isSupabaseSpecific: boolean;
}

const CATEGORY_BORDER: Record<FeatureCategory, string> = {
  auth: "border-l-primary",
  realtime: "border-l-secondary",
  data: "border-l-accent",
};

const features: Feature[] = [
  {
    icon: Shield,
    name: "Auth",
    description:
      "Email/password signup, session management, and RLS identity for secure neighborhood access.",
    category: "auth",
    isSupabaseSpecific: true,
  },
  {
    icon: Lock,
    name: "Row Level Security",
    description:
      "Neighborhood-scoped data isolation and own-resource editing policies enforced at the database level via auth.uid().",
    category: "auth",
    isSupabaseSpecific: true,
  },
  {
    icon: Radio,
    name: "Realtime Postgres Changes",
    description:
      "Live feed updates, comment and vote sync, and borrow status changes pushed to all connected clients.",
    category: "realtime",
    isSupabaseSpecific: true,
  },
  {
    icon: Users,
    name: "Realtime Presence",
    description:
      '"Who\'s on the stoop" — see active neighbors in real time with avatar circles and online count.',
    category: "realtime",
    isSupabaseSpecific: true,
  },
  {
    icon: Megaphone,
    name: "Realtime Broadcast",
    description:
      "Urgent safety alerts pushed instantly to every connected neighbor with a dismissible banner.",
    category: "realtime",
    isSupabaseSpecific: true,
  },
  {
    icon: Image,
    name: "Storage",
    description:
      "Photo uploads for listings with a public bucket and automatic URL generation.",
    category: "data",
    isSupabaseSpecific: true,
  },
  {
    icon: Webhook,
    name: "Database Webhooks",
    description:
      "Profile auto-creation on signup via handle_new_user trigger, keeping auth and app data in sync.",
    category: "auth",
    isSupabaseSpecific: true,
  },
  {
    icon: MapPin,
    name: "PostGIS",
    description:
      "Neighborhood boundaries stored as polygons, address-to-neighborhood assignment via ST_Contains.",
    category: "data",
    isSupabaseSpecific: false,
  },
  {
    icon: Brain,
    name: "pgvector",
    description:
      "Embedding columns on listings and posts, ready for semantic search with cosine similarity.",
    category: "data",
    isSupabaseSpecific: false,
  },
  {
    icon: Search,
    name: "Full-Text Search",
    description:
      "Neighborhood Memory — unified search across listings, posts, and requests using ts_vector and GIN indexes.",
    category: "data",
    isSupabaseSpecific: false,
  },
  {
    icon: Clock,
    name: "pg_cron",
    description:
      "Scheduled jobs for overdue borrow checks (hourly), alert archival (daily), and reputation tier updates (daily).",
    category: "data",
    isSupabaseSpecific: false,
  },
  {
    icon: Zap,
    name: "Database Functions (RPCs)",
    description:
      "complete_borrow, get_leaderboard, search_neighborhood, and assign_neighborhood — complex logic in Postgres, exposed via Supabase's auto-REST API.",
    category: "data",
    isSupabaseSpecific: false,
  },
  {
    icon: Activity,
    name: "Triggers",
    description:
      "Automatic vote count, comment count, and alert confirmation maintenance via database triggers.",
    category: "data",
    isSupabaseSpecific: false,
  },
];

const supabaseCount = features.filter((f) => f.isSupabaseSpecific).length;
const pgCount = features.filter((f) => !f.isSupabaseSpecific).length;

export default function SupabasePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold font-display">Built with Supabase</h1>
        <p className="mt-1 text-sm text-muted">
          Every feature of Supabase, working together to power a neighborhood
          sharing platform.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-[#3ECF8E]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#3ECF8E]">
            S
          </span>
          Supabase Platform ({supabaseCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-[#336791]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#336791]">
            PG
          </span>
          Postgres Extension ({pgCount})
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.name}
              className={cn(
                "card border-l-4 p-4",
                CATEGORY_BORDER[feature.category]
              )}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} className="shrink-0 text-foreground" />
                <span className="text-sm font-bold font-display">
                  {feature.name}
                </span>
                {feature.isSupabaseSpecific ? (
                  <span className="ml-auto inline-flex shrink-0 items-center rounded-full bg-[#3ECF8E]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#3ECF8E]">
                    Supabase
                  </span>
                ) : (
                  <span className="ml-auto inline-flex shrink-0 items-center rounded-full bg-[#336791]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#336791]">
                    Postgres
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        {features.length} features. {supabaseCount} Supabase platform + {pgCount} Postgres extensions. Built in 8 hours.
      </p>
    </div>
  );
}
