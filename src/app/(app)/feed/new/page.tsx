import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewPostForm } from "./new-post-form";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-4 text-lg font-bold font-display">New Post</h1>
      <NewPostForm
        userId={user.id}
        neighborhoodId={profile.neighborhood_id}
      />
    </div>
  );
}
