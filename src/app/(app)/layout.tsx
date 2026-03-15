import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/nav/top-nav";
import { BottomTabs } from "@/components/nav/bottom-tabs";
import { AlertBanner } from "@/components/feed/alert-banner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, neighborhood_id")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen">
      <AlertBanner neighborhoodId={profile.neighborhood_id} />
      <TopNav
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
      />
      {/* Mobile top bar spacer */}
      <div className="h-14 md:hidden" />
      <main className="pb-tabs">{children}</main>
      <BottomTabs
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
      />
    </div>
  );
}
