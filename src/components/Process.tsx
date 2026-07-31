const steps = [
  {
    num: "01",
    title: "Discover",
    description: "We audit your brand, competitors, and audience to find quick wins and long-term opportunities.",
  },
  {
    num: "02",
    title: "Strategize",
    description: "A custom roadmap with clear KPIs — traffic, leads, revenue — tied to channels that fit your budget.",
  },
  {
    num: "03",
    title: "Execute",
    description: "Our team launches campaigns, creates content, and optimizes daily. You get updates, not surprises.",
  },
  {
    num: "04",
    title: "Scale",
    description: "Double down on what works. We refine, expand, and automate so growth compounds over time.",
  },
];

export function Process() {
  return (
    <section id="process" className="border-y border-white/5 bg-slate-900/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Process
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            How we work with you
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <span className="text-5xl font-bold text-indigo-500/20">
                {step.num}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
