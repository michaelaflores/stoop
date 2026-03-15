import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewListingForm } from "./new-listing-form";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user!.id)
    .single();

  if (!profile?.neighborhood_id) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="text-lg font-bold">Share something</h1>
      <p className="mt-1 text-sm text-muted">
        List an item or skill for your neighbors to borrow.
      </p>
      <div className="mt-4">
        <NewListingForm
          userId={user!.id}
          neighborhoodId={profile.neighborhood_id}
        />
      </div>
    </div>
  );
}
