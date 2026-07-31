const testimonials = [
  {
    quote:
      "Bodana Digital transformed our social presence. We went from 200 to 15K followers in 6 months — and actual sales followed.",
    name: "Priya Sharma",
    role: "Founder, StyleCraft India",
  },
  {
    quote:
      "Their SEO work got us on page 1 for our top keywords. Organic traffic is up 240% year over year.",
    name: "Rahul Mehta",
    role: "CEO, TechFlow Solutions",
  },
  {
    quote:
      "Finally an agency that speaks in ROI, not jargon. Clear reports, fast execution, real results.",
    name: "Ananya Patel",
    role: "Marketing Head, GreenLeaf Co.",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-white/5 bg-slate-900/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            What clients say
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="glass rounded-2xl p-6"
            >
              <p className="text-sm leading-relaxed text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 border-t border-white/5 pt-4">
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
