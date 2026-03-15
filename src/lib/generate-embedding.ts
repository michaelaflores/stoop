/**
 * Fire-and-forget call to the generate-embedding Edge Function.
 * Called after creating/updating listings, posts, or requests
 * so semantic search stays up to date.
 */
export function triggerEmbedding(
  table: "listings" | "posts" | "requests",
  record: Record<string, unknown>
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return;

  // Fire and forget — don't block the UI on embedding generation
  fetch(`${supabaseUrl}/functions/v1/generate-embedding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      type: "INSERT",
      table,
      schema: "public",
      record,
      old_record: null,
    }),
  }).catch((err) => {
    // Silently log — embedding failure shouldn't affect the user
    console.warn(`Embedding generation failed for ${table}:`, err);
  });
}
