"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { triggerEmbedding } from "@/lib/generate-embedding";
import { cn } from "@/lib/utils";
import {
  POST_TYPE_LABELS,
  POST_TYPE_ICONS,
  ALERT_SEVERITY_LABELS,
  type PostType,
  type AlertSeverity,
} from "@/lib/supabase/types";

const postTypes: PostType[] = ["discussion", "event", "alert", "recommendation", "ask"];
const alertSeverities: AlertSeverity[] = ["info", "warning", "urgent"];

interface NewPostFormProps {
  userId: string;
  neighborhoodId: string;
}

export function NewPostForm({ userId, neighborhoodId }: NewPostFormProps) {
  const router = useRouter();
  const [type, setType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("info");
  const [eventStartsAt, setEventStartsAt] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    const supabase = createClient();

    const insertData: Record<string, unknown> = {
      author_id: userId,
      neighborhood_id: neighborhoodId,
      type,
      title: title.trim(),
      body: body.trim(),
    };

    if (type === "event") {
      if (eventStartsAt) insertData.event_starts_at = eventStartsAt;
      if (eventLocation.trim()) insertData.event_location = eventLocation.trim();
    }

    if (type === "alert") {
      insertData.alert_severity = alertSeverity;
    }

    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert(insertData)
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Generate embedding for semantic search (awaited before navigation)
    if (newPost) {
      await triggerEmbedding("posts", {
        id: newPost.id,
        title: title.trim(),
        body: body.trim(),
      });
    }

    // Broadcast urgent alerts
    if (type === "alert" && alertSeverity === "urgent" && newPost) {
      const channel = supabase.channel(`alerts:${neighborhoodId}`);
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "urgent_alert",
        payload: {
          postId: newPost.id,
          title: title.trim(),
          body: body.trim(),
          severity: "urgent",
        },
      });
      supabase.removeChannel(channel);
    }

    if (newPost) {
      router.push(`/feed/${newPost.id}`);
    } else {
      router.push("/feed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-4">
      {/* Type selector */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Type</label>
        <div className="flex flex-wrap gap-2">
          {postTypes.map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => setType(pt)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                type === pt
                  ? "bg-primary text-white"
                  : "bg-surface text-muted border border-border hover:text-foreground"
              )}
            >
              {POST_TYPE_ICONS[pt]} {POST_TYPE_LABELS[pt]}
            </button>
          ))}
        </div>
      </div>

      {/* Alert severity */}
      {type === "alert" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Severity</label>
          <div className="flex gap-2">
            {alertSeverities.map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setAlertSeverity(sev)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  alertSeverity === sev
                    ? sev === "urgent"
                      ? "bg-alert text-white"
                      : sev === "warning"
                        ? "bg-accent text-white"
                        : "bg-blue-600 text-white"
                    : "bg-surface text-muted border border-border"
                )}
              >
                {ALERT_SEVERITY_LABELS[sev]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="What's on your mind?"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium">
          Details
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          placeholder="Share the details..."
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Event fields */}
      {type === "event" && (
        <>
          <div>
            <label htmlFor="event_date" className="mb-1.5 block text-sm font-medium">
              Date & Time
            </label>
            <input
              id="event_date"
              type="datetime-local"
              value={eventStartsAt}
              onChange={(e) => setEventStartsAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="event_location" className="mb-1.5 block text-sm font-medium">
              Location
            </label>
            <input
              id="event_location"
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Where is this happening?"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}

      <Button type="submit" disabled={!title.trim() || !body.trim() || submitting} className="w-full">
        {submitting ? "Posting..." : "Post"}
      </Button>
    </form>
  );
}
