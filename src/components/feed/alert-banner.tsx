"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AlertBannerProps {
  neighborhoodId: string;
}

interface AlertPayload {
  postId: string;
  title: string;
  body: string;
  severity: string;
}

export function AlertBanner({ neighborhoodId }: AlertBannerProps) {
  const [alert, setAlert] = useState<AlertPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel(`alerts:${neighborhoodId}`);

    channel.on("broadcast", { event: "urgent_alert" }, (payload) => {
      setAlert(payload.payload as AlertPayload);

      // Auto-dismiss after 15 seconds
      setTimeout(() => {
        setAlert(null);
      }, 15000);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhoodId]);

  if (!alert) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 bg-alert px-4 py-3 text-white shadow-lg animate-in slide-in-from-top duration-300 cursor-pointer"
      onClick={() => {
        router.push(`/feed/${alert.postId}`);
        setAlert(null);
      }}
    >
      <AlertTriangle size={20} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{alert.title}</p>
        <p className="text-xs opacity-90">Tap to view</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAlert(null);
        }}
        className="shrink-0 rounded-full p-2 hover:bg-white/20 active:bg-white/20"
      >
        <X size={16} />
      </button>
    </div>
  );
}
