// supabase/functions/search/index.ts
// Edge Function: Semantic search across listings, posts, and requests
// Uses built-in gte-small model to embed the search query, then calls
// the semantic_search RPC to find similar content via pgvector
//
// POST /functions/v1/search
// Body: { "search": "string", "neighborhood_id": "uuid", "match_threshold": 0.5, "limit": 20 }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const model = new Supabase.ai.Session("gte-small");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { search, neighborhood_id, match_threshold = 0.5, limit = 20 } = await req.json();

    if (!search) {
      return new Response(
        JSON.stringify({ error: "Please provide a search term" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!neighborhood_id) {
      return new Response(
        JSON.stringify({ error: "Please provide a neighborhood_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate embedding for the search query using gte-small
    const embedding = await model.run(search, {
      mean_pool: true,
      normalize: true,
    });

    // Call the semantic_search RPC
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.rpc("semantic_search", {
      query_embedding: JSON.stringify(embedding),
      target_neighborhood_id: neighborhood_id,
      match_threshold: match_threshold,
      result_limit: limit,
    });

    if (error) {
      console.error("semantic_search RPC error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ search, result: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("search error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
