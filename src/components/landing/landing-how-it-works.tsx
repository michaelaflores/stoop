const steps = [
  {
    number: "01",
    title: "Join your neighborhood",
    description: "Sign up and select your neighborhood. We verify addresses to keep communities safe and local.",
  },
  {
    number: "02",
    title: "Browse or share",
    description: "List items you're willing to lend, or browse what your neighbors have available. Tools, kitchen gear, camping equipment — it's all there.",
  },
  {
    number: "03",
    title: "Connect and borrow",
    description: "Request items through the app. Coordinate pickup times, and build relationships with the people next door.",
  },
  {
    number: "04",
    title: "Give back",
    description: "Return items, leave reviews, and watch your community grow stronger. The more you share, the more you earn.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            How Stoop works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">
            Getting started takes less than two minutes. Here's how it works.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (hidden on mobile, shown on larger screens) */}
              {index < steps.length - 1 && (
                <div className="absolute top-6 left-12 hidden h-0.5 w-[calc(100%-3rem)] bg-border lg:block" />
              )}
              
              {/* Step number */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white font-display">
                {step.number}
              </div>
              
              <h3 className="mt-4 text-lg font-semibold text-foreground font-display">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
