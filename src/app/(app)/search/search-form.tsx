"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { searchNeighborhood } from "./actions";
import { SearchResults } from "./search-results";
import type { SearchResult } from "@/lib/supabase/types";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    const data = await searchNeighborhood(trimmed);
    setResults(data as SearchResult[]);
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      // Update URL
      router.replace(`/search?q=${encodeURIComponent(trimmed)}`, {
        scroll: false,
      });
      performSearch(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, performSearch]);

  // Run initial search if URL has query
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted"
          />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your neighborhood memory..."
          className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          autoFocus
        />
      </div>

      {!hasSearched && !loading && (
        <div className="card p-8 text-center">
          <Search size={32} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">
            Your neighborhood remembers everything. Search for items to borrow,
            discussions, recommendations, and more.
          </p>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">
            No results found. Try different keywords.
          </p>
        </div>
      )}

      {hasSearched && results.length > 0 && (
        <SearchResults results={results} />
      )}
    </div>
  );
}
