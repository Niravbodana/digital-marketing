import Link from "next/link";
import { SiteNav } from "@/components/super/SiteNav";
import { SuperFooter } from "@/components/super/SuperSections";

const FEATURES = [
  { icon: "🎬", title: "Cinematic Video Production", desc: "Full trailers, commercials, UGC ads with script, footage, score, and edit. Not 8-second clips.", tag: "Video" },
  { icon: "🎵", title: "Music & Voice Generation", desc: "Original songs with vocals, voiceovers, audiobooks — real MP3 via ElevenLabs.", tag: "Audio" },
  { icon: "🖼️", title: "AI Image & Photography", desc: "DALL-E 3 powered product shots, logos, ads, visual art — portfolio grade.", tag: "Image" },
  { icon: "📄", title: "Documents & Decks", desc: "Books, pitch decks, proposals, reports — PDF & DOCX export ready.", tag: "Docs" },
  { icon: "💻", title: "Code & Websites", desc: "Working websites, React apps, APIs, automation scripts — deployable code.", tag: "Code" },
  { icon: "🤖", title: "94 AI Agent Tools", desc: "8 studios, 94 specialized tools — from movie trailers to autonomous agents.", tag: "Tools" },
  { icon: "📅", title: "Post Scheduler", desc: "Schedule and auto-publish to Instagram, LinkedIn, Twitter via Postiz.", tag: "Social" },
  { icon: "💬", title: "Chat Refine", desc: "Iterative AI editing — say what to change, get updated output instantly.", tag: "AI" },
  { icon: "👥", title: "Teams & White-label", desc: "Multi-user teams, custom branding, your logo and colors on the platform.", tag: "Enterprise" },
  { icon: "💳", title: "Credits & Razorpay", desc: "Flexible credit system, promo codes, subscription plans — monetize your agency.", tag: "Payments" },
  { icon: "🔑", title: "Multi API Key Vault", desc: "Multiple keys per provider with failover — OpenAI, Claude, Gemini, custom.", tag: "Admin" },
  { icon: "⚡", title: "Autonomous Agents", desc: "Set it, forget it — agents create and post content on schedule.", tag: "Automation" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteNav />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl font-bold">Everything SuperCool has.<br /><span className="gradient-text">And more.</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-500">One platform replaces your entire creative stack — video, audio, images, docs, code, social, payments.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-orange-500/30 hover:bg-orange-500/5">
              <span className="text-3xl">{f.icon}</span>
              <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-neutral-500">{f.tag}</span>
              <h3 className="mt-3 text-lg font-bold group-hover:text-orange-300">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link href="/signup" className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-10 py-4 text-sm font-bold">Start Free — 100 Credits →</Link>
        </div>
      </main>
      <SuperFooter />
    </div>
  );
}
