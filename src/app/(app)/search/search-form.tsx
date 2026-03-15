"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Brain, TextSearch } from "lucide-react";
import { searchNeighborhood, semanticSearchNeighborhood } from "./actions";
import { SearchResults } from "./search-results";
import type { SearchResult } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type SearchMode = "keyword" | "semantic";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialMode = (searchParams.get("mode") as SearchMode) ?? "keyword";

  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    async (q: string, searchMode: SearchMode) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);

      const data =
        searchMode === "semantic"
          ? await semanticSearchNeighborhood(trimmed)
          : await searchNeighborhood(trimmed);

      setResults(data as SearchResult[]);
      setLoading(false);
    },
    []
  );

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
      router.replace(
        `/search?q=${encodeURIComponent(trimmed)}&mode=${mode}`,
        { scroll: false }
      );
      performSearch(trimmed, mode);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, mode, router, performSearch]);

  // Run initial search if URL has query
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Search mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("keyword")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "keyword"
              ? "bg-primary text-white"
              : "bg-border text-muted hover:text-foreground"
          )}
        >
          <TextSearch size={14} />
          Keyword
        </button>
        <button
          onClick={() => setMode("semantic")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "semantic"
              ? "bg-[#3ECF8E] text-white"
              : "bg-border text-muted hover:text-foreground"
          )}
        >
          <Brain size={14} />
          Semantic
          <span className="rounded bg-white/20 px-1 py-0.5 text-[10px] font-bold leading-none">
            AI
          </span>
        </button>
      </div>

      {/* Search input */}
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
          placeholder={
            mode === "semantic"
              ? "Describe what you're looking for..."
              : "Search your neighborhood memory..."
          }
          className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          autoFocus
        />
      </div>

      {/* Mode explanation */}
      {mode === "semantic" && !hasSearched && (
        <p className="text-xs text-muted">
          Semantic search understands meaning, not just keywords. Try
          &quot;something to carry groceries&quot; or &quot;weekend activities for kids.&quot;
        </p>
      )}

      {!hasSearched && !loading && (
        <div className="card p-8 text-center">
          <Search size={32} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">
            {mode === "semantic"
              ? "AI-powered search understands what you mean, not just what you type. Powered by Supabase Edge Functions + pgvector."
              : "Your neighborhood remembers everything. Search for items to borrow, discussions, recommendations, and more."}
          </p>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">
            {mode === "semantic"
              ? "No semantic matches found. Embeddings may not be generated yet — try keyword search, or wait for the Edge Function to process content."
              : "No results found. Try different keywords."}
          </p>
        </div>
      )}

      {hasSearched && results.length > 0 && (
        <SearchResults results={results} isSemanticMode={mode === "semantic"} />
      )}
    </div>
  );
}
