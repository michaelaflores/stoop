"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StoopPresenceProps {
  neighborhoodId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface PresenceUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export function StoopPresence({ neighborhoodId, userId, displayName, avatarUrl }: StoopPresenceProps) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel(`stoop:${neighborhoodId}`, {
      config: { presence: { key: userId } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const keys = Object.keys(state);
      setOnlineCount(keys.length);

      const presenceUsers: PresenceUser[] = keys.slice(0, 5).map((key) => {
        const presences = state[key] as unknown as PresenceUser[];
        return presences[0];
      });
      setUsers(presenceUsers);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          display_name: displayName,
          avatar_url: avatarUrl,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhoodId, userId, displayName, avatarUrl]);

  if (onlineCount === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
      </span>

      {users.length > 0 && (
        <div className="flex -space-x-1.5">
          {users.map((u) =>
            u.avatar_url ? (
              <img
                key={u.user_id}
                src={u.avatar_url}
                alt={u.display_name}
                className="h-5 w-5 rounded-full border border-surface object-cover"
              />
            ) : (
              <div
                key={u.user_id}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-surface bg-primary/10 text-[9px] font-bold text-primary"
              >
                {u.display_name.charAt(0).toUpperCase()}
              </div>
            )
          )}
        </div>
      )}

      <span className="text-sm text-secondary font-medium">
        {onlineCount} {onlineCount === 1 ? "neighbor" : "neighbors"} on the stoop
      </span>
    </div>
  );
}
