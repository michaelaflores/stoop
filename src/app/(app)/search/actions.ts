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

  // Call the Edge Function directly via fetch to avoid SSR client
  // body-forwarding issues with supabase.functions.invoke
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        search: query,
        neighborhood_id: profile.neighborhood_id,
        match_threshold: 0.5,
        limit: 30,
      }),
    });

    if (!res.ok) {
      console.error("Semantic search error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    // Map the response to match SearchResult interface
    // The Edge Function returns { search, result: [...] }
    const results = data?.result ?? [];
    return results.map((r: Record<string, unknown>) => ({
      ...r,
      // Map similarity → relevance for UI consistency
      relevance: r.similarity ?? 0,
    }));
  } catch (err) {
    console.error("Semantic search error:", err);
    return [];
  }
}
