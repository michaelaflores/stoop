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
  },
  {
    icon: Lock,
    name: "Row Level Security",
    description:
      "Neighborhood-scoped data isolation and own-resource editing policies enforced at the database level.",
    category: "auth",
  },
  {
    icon: Radio,
    name: "Realtime Postgres Changes",
    description:
      "Live feed updates, comment and vote sync, and borrow status changes pushed to all connected clients.",
    category: "realtime",
  },
  {
    icon: Users,
    name: "Realtime Presence",
    description:
      '"Who\'s on the stoop" — see active neighbors in real time with avatar circles and online count.',
    category: "realtime",
  },
  {
    icon: Megaphone,
    name: "Realtime Broadcast",
    description:
      "Urgent safety alerts pushed instantly to every connected neighbor with a dismissible banner.",
    category: "realtime",
  },
  {
    icon: Image,
    name: "Storage",
    description:
      "Photo uploads for listings with a public bucket and automatic URL generation.",
    category: "data",
  },
  {
    icon: MapPin,
    name: "PostGIS",
    description:
      "Neighborhood boundaries stored as polygons, address-to-neighborhood assignment via ST_Contains.",
    category: "data",
  },
  {
    icon: Brain,
    name: "pgvector",
    description:
      "Embedding columns on listings and posts, ready for semantic search with cosine similarity.",
    category: "data",
  },
  {
    icon: Search,
    name: "Full-Text Search",
    description:
      "Neighborhood Memory — unified search across listings, posts, and requests using ts_vector and GIN indexes.",
    category: "data",
  },
  {
    icon: Clock,
    name: "pg_cron",
    description:
      "Scheduled jobs for overdue borrow checks (hourly), alert archival (daily), and reputation tier updates (daily).",
    category: "data",
  },
  {
    icon: Zap,
    name: "Database Functions (RPCs)",
    description:
      "complete_borrow, get_leaderboard, search_neighborhood, and assign_neighborhood — complex logic in Postgres.",
    category: "data",
  },
  {
    icon: Activity,
    name: "Triggers",
    description:
      "Automatic vote count, comment count, and alert confirmation maintenance via database triggers.",
    category: "data",
  },
  {
    icon: Webhook,
    name: "Database Webhooks",
    description:
      "Profile auto-creation on signup via handle_new_user trigger, keeping auth and app data in sync.",
    category: "auth",
  },
];

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
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        13 features. One platform. Built in 8 hours.
      </p>
    </div>
  );
}
