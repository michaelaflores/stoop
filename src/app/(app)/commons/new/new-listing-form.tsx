"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ITEM_CATEGORIES,
  SKILL_CATEGORIES,
  LISTING_CATEGORY_LABELS,
  type ListingType,
  type ListingCategory,
} from "@/lib/supabase/types";

interface NewListingFormProps {
  userId: string;
  neighborhoodId: string;
}

export function NewListingForm({
  userId,
  neighborhoodId,
}: NewListingFormProps) {
  const router = useRouter();
  const [type, setType] = useState<ListingType>("item");
  const [category, setCategory] = useState<ListingCategory>("tools");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [maxBorrowDays, setMaxBorrowDays] = useState(7);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = type === "item" ? ITEM_CATEGORIES : SKILL_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    let photoUrls: string[] | null = null;

    // Upload photo if selected
    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, photo);

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(path);

      photoUrls = [publicUrl];
    }

    const { data, error: insertError } = await supabase
      .from("listings")
      .insert({
        owner_id: userId,
        neighborhood_id: neighborhoodId,
        type,
        category,
        title,
        description,
        condition: type === "item" ? condition : null,
        max_borrow_days: maxBorrowDays,
        photo_urls: photoUrls,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/commons/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">
          {error}
        </div>
      )}

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setType("item");
            setCategory("tools");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            type === "item"
              ? "bg-primary text-white"
              : "border border-border bg-surface text-muted"
          }`}
        >
          Item
        </button>
        <button
          type="button"
          onClick={() => {
            setType("skill");
            setCategory("skill_handyman");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            type === "skill"
              ? "bg-primary text-white"
              : "border border-border bg-surface text-muted"
          }`}
        >
          Skill
        </button>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          placeholder={
            type === "item" ? 'e.g., "DeWalt Power Drill"' : 'e.g., "Dog Walking"'
          }
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ListingCategory)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {LISTING_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          placeholder="Describe what you're sharing..."
        />
      </div>

      {type === "item" && (
        <div>
          <label
            htmlFor="condition"
            className="mb-1 block text-sm font-medium"
          >
            Condition
          </label>
          <input
            id="condition"
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder='e.g., "Like new", "Good", "Well-loved"'
          />
        </div>
      )}

      <div>
        <label
          htmlFor="maxBorrowDays"
          className="mb-1 block text-sm font-medium"
        >
          Max borrow days
        </label>
        <input
          id="maxBorrowDays"
          type="number"
          min={1}
          max={90}
          value={maxBorrowDays}
          onChange={(e) => setMaxBorrowDays(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Photo upload */}
      <div>
        <label className="mb-1 block text-sm font-medium">Photo</label>
        <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-sm text-muted transition-colors hover:border-primary/30 hover:text-foreground">
          {photo ? photo.name : "Click to upload a photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create listing"}
      </Button>
    </form>
  );
}
