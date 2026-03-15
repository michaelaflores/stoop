"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Neighborhood } from "@/lib/supabase/types";

interface OnboardingFormProps {
  neighborhoods: Neighborhood[];
  userId: string;
}

export function OnboardingForm({
  neighborhoods,
  userId,
}: OnboardingFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ neighborhood_id: selectedId })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/commons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="neighborhood"
          className="mb-1 block text-sm font-medium"
        >
          Neighborhood
        </label>
        <select
          id="neighborhood"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
          className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238a7e72%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat"
        >
          <option value="">Select your neighborhood</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={loading || !selectedId} className="w-full">
        {loading ? "Saving..." : "Join neighborhood"}
      </Button>
    </form>
  );
}
