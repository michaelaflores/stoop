"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/supabase/types";

const SOURCE_BADGE_STYLES: Record<string, string> = {
  listing: "bg-primary/10 text-primary",
  post: "bg-secondary-muted/10 text-secondary-muted",
  request: "bg-accent/10 text-[#7D6820]",
};

const SOURCE_LABELS: Record<string, string> = {
  listing: "Listing",
  post: "Post",
  request: "Request",
};

type FilterTab = "all" | "listing" | "post" | "request";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "listing", label: "Listings" },
  { value: "post", label: "Posts" },
  { value: "request", label: "Requests" },
];

function getResultLink(result: SearchResult): string {
  switch (result.source_type) {
    case "listing":
      return `/commons/${result.id}`;
    case "post":
      return `/feed/${result.id}`;
    case "request":
      return `/commons`;
  }
}

interface SearchResultsProps {
  results: SearchResult[];
  isSemanticMode?: boolean;
}

export function SearchResults({ results, isSemanticMode = false }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all"
      ? results
      : results.filter((r) => r.source_type === activeTab);

  const counts = {
    all: results.length,
    listing: results.filter((r) => r.source_type === "listing").length,
    post: results.filter((r) => r.source_type === "post").length,
    request: results.filter((r) => r.source_type === "request").length,
  };

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-primary text-white"
                : "bg-border text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className="ml-1 opacity-70">({counts[tab.value]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-muted">
            No {activeTab === "all" ? "" : SOURCE_LABELS[activeTab]?.toLowerCase() + " "}results found.
          </p>
        </div>
      ) : (
        filtered.map((result) => (
          <Link
            key={`${result.source_type}-${result.id}`}
            href={getResultLink(result)}
            className="card block p-4 transition-colors hover:bg-border/30 active:bg-border/30"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      SOURCE_BADGE_STYLES[result.source_type]
                    )}
                  >
                    {SOURCE_LABELS[result.source_type]}
                  </span>

                  {isSemanticMode && result.relevance > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#7D6820]">
                      {Math.round(result.relevance * 100)}% match
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 font-display text-base font-bold leading-tight">
                  {result.title}
                </h3>

                {result.snippet && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {result.snippet}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  {result.author_avatar ? (
                    <img
                      src={result.author_avatar}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {result.author_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{result.author_name}</span>
                  <span>·</span>
                  <span>
                    {formatDistanceToNow(new Date(result.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
