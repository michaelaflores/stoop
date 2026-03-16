const testimonials = [
  {
    quote: "I borrowed a pressure washer from my neighbor Steve and ended up making a friend for life. We grab beers now.",
    author: "Marcus T.",
    neighborhood: "Fishtown, Philadelphia",
    avatar: null,
  },
  {
    quote: "As a new mom, the community alerts have been invaluable. I feel so much safer knowing my neighbors are looking out.",
    author: "Jessica R.",
    neighborhood: "Northern Liberties",
    avatar: null,
  },
  {
    quote: "I've saved hundreds of dollars not buying tools I'd use once. My garage is cleaner and my wallet is happier.",
    author: "David K.",
    neighborhood: "South Philly",
    avatar: null,
  },
];

export function LandingTestimonials() {
  return (
    <section className="border-t border-border bg-surface px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Neighbors helping neighbors
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">
            Real stories from real communities using Stoop.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card p-6"
            >
              {/* Quote */}
              <blockquote className="text-base leading-relaxed text-foreground">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted">{testimonial.neighborhood}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
