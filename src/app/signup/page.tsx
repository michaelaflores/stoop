import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/commons");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-primary font-display">Stoop</h1>
          <p className="mt-1 text-sm text-muted">
            Join your neighborhood community
          </p>
        </div>

        <SignupForm />

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="inline-block py-1 font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
