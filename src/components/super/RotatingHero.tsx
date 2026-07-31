"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "./SiteNav";

const WORDS = ["a movie trailer", "a business book", "a mobile app", "a hit song", "a website", "a PowerPoint", "an audiobook", "a commercial", "a novel", "anything"];

export function RotatingHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 studio-gradient" />
      <div className="absolute left-1/4 top-20 h-[500px] w-[500px] rounded-full bg-orange-500/15 blur-[120px] animate-pulse-glow" />
      <div className="absolute right-1/4 bottom-20 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse-glow" />
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-neutral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Join 180,000+ Creators & Builders
        </div>

        <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
          Type one sentence.<br />
          Get{" "}
          <span className="gradient-text inline-block min-w-[280px] transition-all duration-500 md:min-w-[400px]">
            {WORDS[index]}
          </span>
          <br />
          <span className="text-neutral-500">In minutes.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
          No duct-taping apps. No generic AI slop. Bodana builds finished movies, songs, websites, ads, and documents — ready to ship.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup" className="group relative overflow-hidden rounded-full bg-white px-10 py-5 text-base font-bold text-black shadow-2xl shadow-white/10 transition hover:scale-105">
            <span className="relative z-10">Start Creating Now →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-purple-200 opacity-0 transition group-hover:opacity-100" />
          </Link>
          <Link href="/pricing" className="rounded-full border border-white/20 px-10 py-5 text-base font-semibold backdrop-blur transition hover:bg-white/5">
            View Plans — from ₹499/mo
          </Link>
        </div>

        <p className="mt-4 text-xs text-neutral-600">Cancel anytime · 30-Day Money Back Guarantee · No credit card for trial</p>

        <div className="mt-16 flex flex-wrap justify-center gap-2">
          {["Movie trailers", "Hit songs", "Websites", "Commercials", "Novels", "Pitch decks", "UGC ads", "Mobile apps", "Audiobooks", "AI photos"].map((f) => (
            <span key={f} className="format-pill text-xs">{f}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
