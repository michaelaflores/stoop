"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";

const tabs = [
  { href: "/commons", label: "Commons", icon: Home },
  { href: "/feed", label: "Feed", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
];

interface BottomTabsProps {
  displayName: string;
  avatarUrl: string | null;
}

export function BottomTabs({ displayName, avatarUrl }: BottomTabsProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar with avatar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden h-14 items-center justify-between border-b border-border bg-surface/95 backdrop-blur-sm px-4">
        <Link href="/commons" className="flex items-center gap-2 -ml-1 px-1 py-2">
          <span className="text-lg font-bold text-primary font-display tracking-tight">Stoop</span>
        </Link>
        <UserDropdown displayName={displayName} avatarUrl={avatarUrl} />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-start justify-around border-t border-border bg-surface/95 backdrop-blur-sm pt-1.5 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[72px] min-h-[48px] px-4 py-2 rounded-xl transition-colors active:bg-border/40",
                isActive ? "text-primary" : "text-muted"
              )}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-semibold leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
