"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";

const navItems = [
  { href: "/commons", label: "Commons", icon: Home },
  { href: "/feed", label: "Feed", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
];

interface TopNavProps {
  displayName: string;
  avatarUrl: string | null;
}

export function TopNav({ displayName, avatarUrl }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="hidden md:flex h-14 items-center border-b border-border bg-surface px-6">
      <Link href="/commons" className="mr-8 flex items-center gap-2">
        <span className="text-lg font-bold text-primary font-display">Stoop</span>
      </Link>

      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-foreground hover:bg-border"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto">
        <UserDropdown displayName={displayName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
