"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { POST_TYPE_LABELS, POST_TYPE_ICONS, type PostType } from "@/lib/supabase/types";

const types: { value: PostType | "all"; label: string; icon?: string }[] = [
  { value: "all", label: "All" },
  ...Object.entries(POST_TYPE_LABELS).map(([value, label]) => ({
    value: value as PostType,
    label,
    icon: POST_TYPE_ICONS[value as PostType],
  })),
];

export function FeedTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "all";

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {types.map((t) => (
        <button
          key={t.value}
          onClick={() => handleSelect(t.value)}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            current === t.value
              ? "bg-primary text-white"
              : "bg-surface text-muted border border-border hover:text-foreground"
          )}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}
