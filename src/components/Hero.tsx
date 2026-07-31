export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Accepting new clients for 2026
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl md:leading-[1.1]">
          We turn{" "}
          <span className="gradient-text">attention into revenue</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
          Bodana Digital is a growth-focused marketing studio. We build brands
          that rank, engage, and convert — across search, social, and paid
          channels.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/dashboard"
            className="glow rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Open AI Studio — Start Free
          </a>
          <a
            href="#services"
            className="rounded-full border border-white/10 px-8 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Explore Services
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "150+", label: "Campaigns Launched" },
            { value: "3.2x", label: "Avg. ROAS" },
            { value: "30+", label: "Platforms Managed" },
            { value: "98%", label: "Client Retention" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5">
              <div className="text-2xl font-bold text-white md:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-slate-400 md:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
