import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";
import type { Neighborhood } from "@/lib/supabase/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has a neighborhood
  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (profile?.neighborhood_id) {
    redirect("/commons");
  }

  // Fetch neighborhoods sorted alphabetically
  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-primary font-display">Stoop</h1>
          <p className="mt-1 text-sm text-muted">
            Pick your neighborhood to get started
          </p>
        </div>

        <OnboardingForm
          neighborhoods={(neighborhoods as Neighborhood[]) ?? []}
          userId={user.id}
        />
      </div>
    </div>
  );
}
