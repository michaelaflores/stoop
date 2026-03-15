import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/commons");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary font-display tracking-tight">Stoop</h1>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Sign in to your neighborhood
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="inline-block py-1 font-semibold text-primary hover:underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
