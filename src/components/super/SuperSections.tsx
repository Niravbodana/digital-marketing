import Link from "next/link";
import { FORMAT_PILLS, VIDEO_TEMPLATES } from "@/lib/studios";

const DELIVERABLES = [
  { icon: "🎬", title: "Make a Movie", desc: "Script, storyboard, footage, score, and final cut." },
  { icon: "📖", title: "Write a Book", desc: "Full manuscript — outlined, drafted, edited, with cover." },
  { icon: "🌐", title: "Build a Website", desc: "Pixel-perfect sites that load fast and convert." },
  { icon: "📣", title: "Cut a Commercial", desc: "30-sec spot with hook, visuals, voiceover, and edit." },
  { icon: "🎯", title: "Design Graphic Ads", desc: "Thumb-stopping creative in every campaign size." },
  { icon: "🎵", title: "Produce a Song", desc: "Original tracks with real vocals, mixed and mastered." },
  { icon: "📊", title: "Deliver a Deck", desc: "Presentations that win the room — end to end." },
  { icon: "📱", title: "Run Your Marketing", desc: "Agent that plans, creates, launches, and reports." },
  { icon: "📲", title: "Ship a Mobile App", desc: "Working apps with backends — ready for the store." },
  { icon: "📷", title: "Create Photography", desc: "Portfolio-grade photos from scratch or retouch." },
  { icon: "🎨", title: "Create Visual Art", desc: "Paintings, illustrations, concept art — any style." },
  { icon: "👨‍👩‍👧", title: "Make a Family Movie", desc: "Turn clips into a scored, narrated family film." },
];

const COMPARISON = [
  { item: "Cinematic promo video, scored & edited", chatgpt: "8-sec clips", gemini: "8-sec clips", midjourney: "8-sec clips", runway: "clips only", bodana: "✅ Full production" },
  { item: "Full song with vocals", chatgpt: "❌", gemini: "❌", midjourney: "❌", runway: "❌", bodana: "✅ ElevenLabs TTS" },
  { item: "Complete website", chatgpt: "code snippets", gemini: "page editor", midjourney: "❌", runway: "❌", bodana: "✅ Full HTML/React" },
  { item: "Pitch deck / PowerPoint", chatgpt: "outline only", gemini: "bad decks", midjourney: "❌", runway: "❌", bodana: "✅ Designed deck" },
  { item: "Agents that post on schedule", chatgpt: "❌", gemini: "❌", midjourney: "❌", runway: "❌", bodana: "✅ Postiz + scheduler" },
];

export function SuperHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 studio-gradient" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[150px]" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-orange-400">Join 180,000+ Creators & Builders</p>
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
          Type one sentence.<br />
          Get <span className="gradient-text">anything.</span><br />
          <span className="text-neutral-500">In minutes.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
          Movies, music, books, images, presentations, code — no duct-taping apps together.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/studio" className="glow-orange rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-neutral-100">
            Start Creating Now →
          </Link>
          <Link href="/pricing" className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/5">
            View Pricing
          </Link>
        </div>
        <p className="mt-4 text-xs text-neutral-600">Cancel anytime · 30-Day Money Back Guarantee</p>

        <div className="mt-16 flex flex-wrap justify-center gap-2">
          {FORMAT_PILLS.map((f) => (
            <span key={f} className="format-pill">{f}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DeliverablesSection() {
  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">Tired of AI Slop?</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-neutral-500">SuperCool-style deliverables — world-class, in one place.</p>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DELIVERABLES.map((d) => (
            <Link key={d.title} href="/studio" className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-orange-500/30 hover:bg-orange-500/5">
              <span className="text-3xl">{d.icon}</span>
              <h3 className="mt-3 font-bold group-hover:text-orange-300">{d.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{d.desc}</p>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-neutral-600">One subscription. Every craft. Zero duct tape.</p>
      </div>
    </section>
  );
}

export function ComparisonSection() {
  return (
    <section className="border-t border-white/5 bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">No One Else Is Even Close.</h2>
        <p className="mt-2 text-center text-neutral-500">Not cheaper. Not faster. They literally can&apos;t do it.</p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-neutral-500">
                <th className="py-3 pr-4">Deliverable</th>
                <th className="px-3 py-3">ChatGPT</th>
                <th className="px-3 py-3">Gemini</th>
                <th className="px-3 py-3">Midjourney</th>
                <th className="px-3 py-3">Runway</th>
                <th className="px-3 py-3 text-orange-400">Bodana</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.item} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium">{r.item}</td>
                  <td className="px-3 py-3 text-neutral-600">{r.chatgpt}</td>
                  <td className="px-3 py-3 text-neutral-600">{r.gemini}</td>
                  <td className="px-3 py-3 text-neutral-600">{r.midjourney}</td>
                  <td className="px-3 py-3 text-neutral-600">{r.runway}</td>
                  <td className="px-3 py-3 text-emerald-400">{r.bodana}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function StudiosSection() {
  const studios = [
    { name: "Creator Studio", desc: "Images, logos, photography with DALL-E.", icon: "🎨", href: "/studio" },
    { name: "Marketing Studio", desc: "UGC ads, commercials, viral shorts.", icon: "📣", href: "/studio" },
    { name: "Document Studio", desc: "Books, decks, PDFs — formatted & ready.", icon: "📄", href: "/studio" },
    { name: "Audio Studio", desc: "Songs, voiceovers, podcasts — real MP3.", icon: "🎵", href: "/studio" },
    { name: "Video Studio", desc: "Trailers, reels, commercials — real video.", icon: "🎬", href: "/studio" },
    { name: "Make Anything", desc: "Movies, apps, novels — one prompt.", icon: "⚡", href: "/studio" },
  ];

  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold md:text-4xl">AI agents create real content.<br /><span className="text-neutral-500">In minutes.</span></h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-neutral-500">Not text responses. Actual files you can download, edit, and ship.</p>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

export function PricingCTA() {
  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold">Plans from ₹499/month</h2>
        <p className="mt-4 text-neutral-500">Credit packs, subscriptions, promo codes — all in one place.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/pricing" className="rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-8 py-4 text-sm font-semibold">View All Plans</Link>
          <Link href="/signup" className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold hover:bg-white/5">Start Free</Link>
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
        <div className="mt-6 flex justify-center gap-6 text-xs text-neutral-600">
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/studio" className="hover:text-white">Studio</Link>
          <Link href="/admin" className="hover:text-white">Admin</Link>
        </div>
        <p className="mt-8 text-xs text-neutral-600">© {new Date().getFullYear()} Bodana Digital · You own everything created</p>
      </div>
    </footer>
  );
}
