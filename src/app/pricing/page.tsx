"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Package = {
  id: string; name: string; credits: number; priceInr: number;
  originalPriceInr?: number | null; badge?: string | null; features?: string | null;
  billingPeriod: string; highlight: boolean;
};
type Plan = {
  id: string; name: string; priceInr: number; originalPriceInr?: number | null;
  creditsPerMonth: number; billingPeriod: string; badge?: string | null;
  features?: string | null; popular: boolean;
};

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<"credits" | "subscription">("subscription");
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    fetch("/api/pricing").then((r) => r.json()).then((d) => {
      setPackages(d.packages || []);
      setPlans(d.plans || []);
    });
  }, []);

  function parseFeatures(f?: string | null): string[] {
    if (!f) return [];
    try { return JSON.parse(f); } catch { return []; }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 text-xs">BD</span>
            Bodana Digital
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/studio" className="text-sm text-neutral-400 hover:text-white">Studio</Link>
            <Link href="/signup" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">Start free</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-orange-400">Simple Pricing</p>
        <h1 className="mt-4 text-4xl font-bold md:text-6xl">One platform.<br /><span className="gradient-text">Every workflow.</span></h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-500">Cancel anytime · 30-day money-back guarantee · Join 180,000+ creators</p>

        <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button onClick={() => setBilling("subscription")} className={`rounded-full px-6 py-2 text-sm font-medium ${billing === "subscription" ? "bg-white text-black" : "text-neutral-400"}`}>Monthly Plans</button>
          <button onClick={() => setBilling("credits")} className={`rounded-full px-6 py-2 text-sm font-medium ${billing === "credits" ? "bg-white text-black" : "text-neutral-400"}`}>Credit Packs</button>
        </div>

        <div className="mt-6 flex max-w-md mx-auto gap-2">
          <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Promo code (e.g. WELCOME50)" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono" />
          <Link href={`/credits?promo=${promoCode}`} className="rounded-xl bg-orange-500/20 px-4 py-3 text-sm text-orange-400 hover:bg-orange-500/30">Apply →</Link>
        </div>
      </section>

      {billing === "subscription" ? (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div key={p.id} className={`relative rounded-2xl border p-6 transition hover:scale-[1.02] ${p.popular ? "border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-transparent shadow-lg shadow-orange-500/10" : "border-white/10 bg-white/[0.02]"}`}>
                {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold text-white">{p.badge}</span>}
                <h3 className="text-lg font-bold">{p.name}</h3>
                <div className="mt-4">
                  {p.originalPriceInr && <span className="text-sm text-neutral-600 line-through">₹{p.originalPriceInr}</span>}
                  <p className="text-3xl font-bold">₹{p.priceInr}<span className="text-sm font-normal text-neutral-500">/{p.billingPeriod === "yearly" ? "yr" : "mo"}</span></p>
                </div>
                <p className="mt-2 text-sm text-orange-400">{p.creditsPerMonth} credits/{p.billingPeriod === "yearly" ? "month" : "month"}</p>
                <ul className="mt-4 space-y-2 text-left">
                  {parseFeatures(p.features).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-400"><span className="text-emerald-400">✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold ${p.popular ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white" : "border border-white/20 hover:bg-white/5"}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <div key={p.id} className={`relative rounded-2xl border p-6 ${p.highlight ? "border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-transparent" : "border-white/10 bg-white/[0.02]"}`}>
                {p.badge && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-400">{p.badge}</span>}
                <h3 className="mt-2 text-lg font-bold">{p.name}</h3>
                <div className="mt-4">
                  {p.originalPriceInr && <span className="text-sm text-neutral-600 line-through">₹{p.originalPriceInr}</span>}
                  <p className="text-3xl font-bold">₹{p.priceInr}</p>
                </div>
                <p className="mt-2 text-sm text-orange-400">{p.credits} credits</p>
                <ul className="mt-4 space-y-2 text-left">
                  {parseFeatures(p.features).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-400"><span className="text-emerald-400">✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/credits" className="mt-6 block w-full rounded-xl border border-white/20 py-3 text-center text-sm font-semibold hover:bg-white/5">
                  Buy Credits
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-white/5 bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold">Active Promo Codes</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["WELCOME50 — 50% off first purchase", "BODANA100 — 100 free credits", "LAUNCH25 — 25% off any plan", "VIP500 — 500 bonus credits"].map((p) => (
              <div key={p} className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 px-4 py-3 font-mono text-sm text-orange-300">{p}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
