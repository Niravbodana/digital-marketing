import Link from "next/link";
import { FORMAT_PILLS, VIDEO_TEMPLATES } from "@/lib/studios";

export function SuperHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 studio-gradient" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[150px]" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-orange-400">Bodana Digital</p>
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
          The ultimate<br />
          <span className="gradient-text">creation machine.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
          Movies, music, books, images, presentations, code — anything — from a single prompt.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/studio" className="glow-orange rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-neutral-100">
            Start creating →
          </Link>
          <Link href="/login" className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/5">
            Sign in
          </Link>
        </div>

        {/* Format pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-2">
          {FORMAT_PILLS.map((f) => (
            <span key={f} className="format-pill">{f}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudiosSection() {
  const studios = [
    { name: "Creator Studio", desc: "Create images and videos with the best AI models.", icon: "🎨", href: "/studio" },
    { name: "Marketing Studio", desc: "UGC videos, viral shorts, ad campaigns.", icon: "📣", href: "/studio" },
    { name: "Document Studio", desc: "Word, PDF, PowerPoint, Excel — formatted & ready.", icon: "📄", href: "/studio" },
    { name: "Social Studio", desc: "Instagram, TikTok, LinkedIn — post & publish.", icon: "📱", href: "/dashboard" },
  ];

  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold md:text-4xl">AI agents create real content.<br /><span className="text-neutral-500">In minutes.</span></h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-neutral-500">Not text responses. Actual files you can download, edit, and ship.</p>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {studios.map((s) => (
            <Link key={s.name} href={s.href} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-orange-500/30 hover:bg-orange-500/5">
              <span className="text-4xl">{s.icon}</span>
              <h3 className="mt-4 text-xl font-bold group-hover:text-orange-300">{s.name}</h3>
              <p className="mt-2 text-neutral-500">{s.desc}</p>
              <span className="mt-4 inline-block text-sm text-orange-400">Open Studio →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TemplatesSection() {
  return (
    <section className="border-t border-white/5 bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold">Pick a format. Make a short.</h2>
        <p className="mt-2 text-neutral-500">Each template carries its own visual style, voice, and pacing.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VIDEO_TEMPLATES.map((t) => (
            <Link key={t.id} href="/studio" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20">
              {t.popular && <span className="text-xs font-medium text-orange-400">{t.tag}</span>}
              <h3 className="mt-2 font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{t.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { num: "01", title: "Understand your request", desc: "AI analyzes content type, format, style, and requirements." },
    { num: "02", title: "Gather intelligence", desc: "Research, data extraction, and context building when needed." },
    { num: "03", title: "Create your content", desc: "Production-ready output with formatting, media, and polish." },
    { num: "04", title: "Refine & perfect", desc: "Want changes? Just say so. Regenerate conversationally." },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">From prompt to production in four steps.</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num}>
              <span className="text-4xl font-bold text-white/10">{s.num}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SuperFooter() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-2xl font-bold">Stop spending hours on content.<br />Make it in minutes.</h2>
        <Link href="/studio" className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black">Start creating</Link>
        <p className="mt-8 text-xs text-neutral-600">© {new Date().getFullYear()} Bodana Digital · You own everything created</p>
      </div>
    </footer>
  );
}
