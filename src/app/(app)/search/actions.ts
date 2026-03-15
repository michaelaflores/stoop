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
