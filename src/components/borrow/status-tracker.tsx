"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BorrowStatus } from "@/lib/supabase/types";

interface StatusTrackerProps {
  status: BorrowStatus;
}

const steps = [
  { key: "pending", label: "Requested" },
  { key: "approved", label: "Approved" },
  { key: "active", label: "Picked Up" },
  { key: "returned", label: "Returned" },
] as const;

type StepKey = (typeof steps)[number]["key"];

const stepOrder: Record<StepKey, number> = {
  pending: 0,
  approved: 1,
  active: 2,
  returned: 3,
};

export function StatusTracker({ status }: StatusTrackerProps) {
  if (status === "declined") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-alert/10 px-3 py-1 text-xs font-medium text-alert">
        Declined
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1 text-xs font-medium text-muted">
        Cancelled
      </div>
    );
  }

  const currentIndex = stepOrder[status as StepKey] ?? -1;

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-4",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                    ? "border-2 border-primary bg-primary/10 text-primary"
                    : "border border-border bg-surface text-muted"
                )}
              >
                {isCompleted ? <Check size={10} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
