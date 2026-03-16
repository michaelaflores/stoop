import { Home, MessageSquare, Search, Trophy, Bell, MapPin } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "The Commons",
    description: "Browse and borrow tools, equipment, and household items from neighbors. No more buying things you'll use once.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MessageSquare,
    title: "Community Feed",
    description: "Share updates, ask questions, organize events, and stay connected with what's happening on your block.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Bell,
    title: "Neighborhood Alerts",
    description: "Get real-time alerts about what matters — lost pets, suspicious activity, weather warnings, and more.",
    color: "bg-alert/10 text-alert",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find exactly what you need with AI-powered search. Looking for a ladder? We'll find who has one nearby.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Trophy,
    title: "Reputation System",
    description: "Build trust through positive interactions. Active, helpful neighbors earn recognition in the community.",
    color: "bg-secondary-muted/15 text-secondary-muted",
  },
  {
    icon: MapPin,
    title: "Local Focus",
    description: "Everything is hyperlocal. Connect with people in your actual neighborhood, not a city-wide void.",
    color: "bg-primary/10 text-primary",
  },
];

export function LandingFeatures() {
  return (
    <section className="border-t border-border bg-surface px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything you need to connect
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">
            Stoop brings together the tools for a thriving neighborhood community, all in one place.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card p-6 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                <feature.icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground font-display">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
