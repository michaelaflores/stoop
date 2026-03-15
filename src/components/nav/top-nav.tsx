"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/commons", label: "Commons", icon: Home },
  { href: "/feed", label: "Feed", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
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
        <span className="text-lg font-bold text-primary">Stoop</span>
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

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
