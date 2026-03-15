"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchNeighborhood(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) return [];

  const { data } = await supabase.rpc("search_neighborhood", {
    query_text: query,
    target_neighborhood_id: profile.neighborhood_id,
    result_limit: 30,
  });

  return data ?? [];
}

export async function semanticSearchNeighborhood(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) return [];

  const { data, error } = await supabase.functions.invoke("search", {
    body: {
      search: query,
      neighborhood_id: profile.neighborhood_id,
      match_threshold: 0.4,
      limit: 30,
    },
  });

  if (error) {
    console.error("Semantic search error:", error);
    return [];
  }

  // Map the response to match SearchResult interface
  // The Edge Function returns { search, result: [...] }
  const results = data?.result ?? [];
  return results.map((r: Record<string, unknown>) => ({
    ...r,
    // Map similarity → relevance for UI consistency
    relevance: r.similarity ?? 0,
  }));
}
