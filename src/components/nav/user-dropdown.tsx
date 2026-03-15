"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Blocks, LogOut, Settings, Trophy, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
  displayName: string;
  avatarUrl: string | null;
}

export function UserDropdown({ displayName, avatarUrl }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-border/60 active:bg-border min-h-[44px] min-w-[44px] justify-center"
        aria-label="User menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm font-medium md:inline">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-surface py-1.5 shadow-[var(--shadow-dropdown)]">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-border/50 transition-colors"
          >
            <User size={16} />
            Profile
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-border/50 transition-colors"
          >
            <Trophy size={16} />
            Leaderboard
          </Link>
          <Link
            href="/supabase"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-border/50 transition-colors"
          >
            <Blocks size={16} />
            Built with Supabase
          </Link>
          <button
            disabled
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted opacity-50"
          >
            <Settings size={16} />
            Settings
          </button>
          <div className="my-1.5 border-t border-border" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-alert hover:bg-alert/5 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
