import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12 sm:py-20">
          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
          </div>

          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
            Ready to meet your neighbors?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80 text-pretty">
            Join Stoop today and become part of a community that shares, supports, and looks out for each other.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary transition-all hover:bg-white/90 hover:gap-3"
            >
              Get started free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
