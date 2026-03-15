/**
 * Call the generate-embedding Edge Function after content creation.
 * Fire-and-forget from the caller's perspective, but we do await
 * internally so errors are logged to the browser console for debugging.
 */
export async function triggerEmbedding(
  table: "listings" | "posts" | "requests",
  record: Record<string, unknown>
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.warn("triggerEmbedding: missing SUPABASE_URL or ANON_KEY");
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-embedding`, {
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
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`triggerEmbedding failed (${res.status}):`, text);
    }
  } catch (err) {
    console.warn(`triggerEmbedding error for ${table}:`, err);
  }
}
