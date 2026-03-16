import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold text-primary font-display tracking-tight">Stoop</span>
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Building stronger neighborhoods, one shared tool at a time.
            </p>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Michael Flores. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
