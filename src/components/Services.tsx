const services = [
  {
    icon: "🔍",
    title: "SEO & Content",
    description:
      "Rank higher with technical SEO, keyword strategy, and content that answers what your audience actually searches for.",
    tags: ["Technical SEO", "Blog Strategy", "Link Building"],
  },
  {
    icon: "📱",
    title: "Social Media Marketing",
    description:
      "Build a consistent presence across Instagram, LinkedIn, X, and more — with AI-powered scheduling and creative that converts.",
    tags: ["Content Calendar", "Postiz MCP", "Community"],
  },
  {
    icon: "🎯",
    title: "Paid Advertising",
    description:
      "Meta, Google, and LinkedIn ads optimized for ROAS. We test, scale, and report — so every rupee works harder.",
    tags: ["Meta Ads", "Google Ads", "Retargeting"],
  },
  {
    icon: "✨",
    title: "Brand Strategy",
    description:
      "Positioning, messaging, and visual identity that makes you memorable. From logo to launch, we craft brands that stick.",
    tags: ["Positioning", "Visual ID", "Messaging"],
  },
  {
    icon: "📊",
    title: "Analytics & CRO",
    description:
      "Track what matters. We set up dashboards, run A/B tests, and optimize funnels to lift conversion rates month over month.",
    tags: ["GA4", "Heatmaps", "A/B Testing"],
  },
  {
    icon: "🤖",
    title: "AI Marketing",
    description:
      "Leverage AI for content, automation, and MCP integrations — so your marketing runs smarter, not just faster.",
    tags: ["AI Content", "Automation", "MCP Tools"],
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Everything you need to grow online
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Full-funnel digital marketing — from first impression to final
            conversion.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="glass group rounded-2xl p-6 transition hover:border-indigo-500/30 hover:bg-indigo-500/5"
            >
              <span className="text-3xl">{service.icon}</span>
              <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {service.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
