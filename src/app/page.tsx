import Link from "next/link";
import { SuperHero, DeliverablesSection, ComparisonSection, StudiosSection, TemplatesSection, HowItWorks, PricingCTA, SuperFooter } from "@/components/super/SuperSections";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 text-xs">BD</span>
            Bodana
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-neutral-400 hover:text-white">Pricing</Link>
            <Link href="/studio" className="text-sm text-neutral-400 hover:text-white">Studio</Link>
            <Link href="/login" className="text-sm text-neutral-400 hover:text-white">Sign in</Link>
            <Link href="/signup" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">Get started</Link>
          </div>
        </nav>
      </header>
      <main>
        <SuperHero />
        <DeliverablesSection />
        <ComparisonSection />
        <StudiosSection />
        <TemplatesSection />
        <HowItWorks />
        <PricingCTA />
      </main>
      <SuperFooter />
    </div>
  );
}
