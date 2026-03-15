// supabase/functions/generate-embedding/index.ts
// Edge Function: Generate embeddings using Supabase's built-in gte-small model
// Triggered as a database webhook on INSERT/UPDATE to listings, posts, or requests
//
// Zero external dependencies — gte-small runs natively in Supabase Edge Runtime v1.36.0+
// Produces 384-dimensional vectors stored in each table's `embedding` column

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Initialize the built-in gte-small model session
const model = new Supabase.ai.Session("gte-small");

interface WebhookPayload {
  type: "INSERT" | "UPDATE";
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
}

// Map table names to the fields used for embedding content
const TABLE_CONTENT_MAP: Record<string, (record: Record<string, unknown>) => string> = {
  listings: (r) => `${r.title || ""} ${r.description || ""}`.trim(),
  posts: (r) => `${r.title || ""} ${r.body || ""}`.trim(),
  requests: (r) => `${r.title || ""} ${r.description || ""}`.trim(),
};

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { table, record } = payload;

    // Get content builder for this table
    const getContent = TABLE_CONTENT_MAP[table];
    if (!getContent) {
      console.warn(`Unknown table: ${table}`);
      return new Response(JSON.stringify({ error: `Unknown table: ${table}` }), {
        status: 400,
      });
    }

    const content = getContent(record);
    if (!content) {
      console.warn(`Empty content for ${table}/${record.id}`);
      return new Response("ok — skipped (empty content)");
    }

    // Generate embedding using built-in gte-small (384 dimensions)
    const embedding = await model.run(content, {
      mean_pool: true,
      normalize: true,
    });

    // Store embedding in the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from(table)
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", record.id);

    if (error) {
      console.error(`Failed to store embedding for ${table}/${record.id}:`, error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`Generated embedding for ${table}/${record.id} (${content.length} chars)`);
    return new Response(JSON.stringify({ success: true, table, id: record.id }));
  } catch (err) {
    console.error("generate-embedding error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
