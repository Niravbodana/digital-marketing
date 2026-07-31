export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
              About
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Built for brands that want real growth
            </h2>
            <p className="mt-6 leading-relaxed text-slate-400">
              Bodana Digital was founded by{" "}
              <strong className="text-white">Nirav Bodana</strong> with one
              mission: help businesses grow using modern marketing — SEO, social
              media, paid ads, and AI-powered automation.
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              We don&apos;t believe in vanity metrics. Every campaign we run is
              tied to leads, sales, and measurable ROI. Whether you&apos;re a
              startup or an established brand, we build systems that scale.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Transparent reporting — weekly & monthly",
                "No long-term lock-in contracts",
                "Dedicated account manager",
                "AI + human creativity combined",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass glow rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold">
                NB
              </div>
              <div>
                <h3 className="text-xl font-semibold">Nirav Bodana</h3>
                <p className="text-sm text-indigo-400">Founder & Lead Strategist</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-400">
              Digital marketing specialist focused on growth strategy, social
              media automation, and building brands that stand out in crowded
              markets.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-white">5+</div>
                <div className="text-xs text-slate-400">Years Experience</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-xs text-slate-400">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
