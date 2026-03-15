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
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden h-12 items-center justify-between border-b border-border bg-surface px-4">
        <Link href="/commons" className="flex items-center gap-2">
          <span className="text-base font-bold text-primary">Stoop</span>
        </Link>
        <UserDropdown displayName={displayName} avatarUrl={avatarUrl} />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-16 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted"
              )}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
