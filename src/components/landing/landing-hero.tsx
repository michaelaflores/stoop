import Link from "next/link";
import { ArrowRight, Users, Wrench, MessageSquare } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
          <Users size={16} />
          <span>Neighborhood-first community</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
          Your neighborhood,{" "}
          <span className="text-primary">connected</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl text-pretty">
          Borrow tools, share skills, and build real connections with the people who live around you. 
          Stoop brings back the spirit of front-porch community.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-all hover:bg-primary-hover hover:gap-3"
          >
            Join your neighborhood
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-border"
          >
            Sign in
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wrench size={24} />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground font-display">500+</p>
            <p className="text-sm text-muted">Items shared</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Users size={24} />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground font-display">1,200+</p>
            <p className="text-sm text-muted">Active neighbors</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MessageSquare size={24} />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground font-display">50+</p>
            <p className="text-sm text-muted">Neighborhoods</p>
          </div>
        </div>
      </div>
    </section>
  );
}
