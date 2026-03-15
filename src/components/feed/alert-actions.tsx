"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface AlertActionsProps {
  postId: string;
  userId: string;
  existingResponse: "confirm" | "dismiss" | null;
  confirmedCount: number;
  dismissedCount: number;
}

export function AlertActions({
  postId,
  userId,
  existingResponse,
  confirmedCount,
  dismissedCount,
}: AlertActionsProps) {
  const [response, setResponse] = useState(existingResponse);
  const [confirmed, setConfirmed] = useState(confirmedCount);
  const [dismissed, setDismissed] = useState(dismissedCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleResponse(type: "confirm" | "dismiss") {
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    const previousResponse = response;

    // Optimistic update
    if (previousResponse === type) {
      // Un-respond
      setResponse(null);
      if (type === "confirm") setConfirmed((c) => c - 1);
      else setDismissed((c) => c - 1);

      await supabase
        .from("alert_responses")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      setResponse(type);
      if (type === "confirm") {
        setConfirmed((c) => c + 1);
        if (previousResponse === "dismiss") setDismissed((c) => c - 1);
      } else {
        setDismissed((c) => c + 1);
        if (previousResponse === "confirm") setConfirmed((c) => c - 1);
      }

      await supabase
        .from("alert_responses")
        .upsert(
          { post_id: postId, user_id: userId, response_type: type },
          { onConflict: "post_id,user_id" }
        );
    }

    // Update counts on the post
    const newConfirmed = type === "confirm"
      ? (previousResponse === type ? confirmedCount - 1 : confirmedCount + (previousResponse === "dismiss" ? 0 : 1))
      : (previousResponse === "confirm" ? confirmedCount - 1 : confirmedCount);
    const newDismissed = type === "dismiss"
      ? (previousResponse === type ? dismissedCount - 1 : dismissedCount + (previousResponse === "confirm" ? 0 : 1))
      : (previousResponse === "dismiss" ? dismissedCount - 1 : dismissedCount);

    await supabase
      .from("posts")
      .update({
        alert_confirmed_count: Math.max(0, newConfirmed),
        alert_dismissed_count: Math.max(0, newDismissed),
      })
      .eq("id", postId);

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant={response === "confirm" ? "secondary" : "outline"}
          size="sm"
          onClick={() => handleResponse("confirm")}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <Check size={14} />
          I can confirm
        </Button>
        <Button
          variant={response === "dismiss" ? "outline" : "outline"}
          size="sm"
          onClick={() => handleResponse("dismiss")}
          disabled={loading}
          className={cn(
            "flex items-center gap-1",
            response === "dismiss" && "border-alert text-alert"
          )}
        >
          <X size={14} />
          Not seeing this
        </Button>
      </div>
      <span className="text-xs text-muted">
        {confirmed} confirmed · {dismissed} dismissed
      </span>
    </div>
  );
}
