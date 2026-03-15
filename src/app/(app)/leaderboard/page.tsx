import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { REPUTATION_TIER_LABELS } from "@/lib/supabase/types";
import type { LeaderboardEntry } from "@/lib/supabase/types";

const TIER_BADGE_STYLES: Record<string, string> = {
  new_neighbor: "bg-border text-muted",
  regular: "bg-secondary-muted/10 text-secondary-muted",
  block_captain: "bg-accent/10 text-[#7D6820]",
  neighborhood_legend: "bg-primary/10 text-primary",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) redirect("/onboarding");

  const { data } = await supabase.rpc("get_leaderboard", {
    target_neighborhood_id: profile.neighborhood_id,
    limit_count: 20,
  });

  const entries = (data ?? []) as LeaderboardEntry[];

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 text-lg font-bold font-display">
        Stoop Cred Leaderboard
      </h1>

      {entries.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted">
            No neighbors in your neighborhood yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.user_id === user.id;
            const tierKey = entry.reputation_tier as string;
            return (
              <div
                key={entry.user_id}
                className={cn(
                  "card flex items-center gap-3 p-3",
                  isCurrentUser && "border-l-2 border-primary bg-primary/5"
                )}
              >
                <span className="w-6 text-center text-sm font-bold text-muted">
                  {index + 1}
                </span>

                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.display_name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {entry.display_name}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-muted">(you)</span>
                      )}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                      TIER_BADGE_STYLES[tierKey] ?? "bg-border text-muted"
                    )}
                  >
                    {REPUTATION_TIER_LABELS[entry.reputation_tier] ?? tierKey}
                  </span>
                </div>

                <span className="text-sm font-bold text-primary">
                  {entry.reputation_score}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
