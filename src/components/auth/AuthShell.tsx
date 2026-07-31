"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND, ROTATING_DELIVERABLES } from "@/lib/brand";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_DELIVERABLES.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 studio-gradient" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-orange-500/20 blur-[120px] auth-orb-drift" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[380px] w-[380px] rounded-full bg-purple-600/20 blur-[120px] auth-orb-drift-reverse" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      <div className="relative hidden w-1/2 flex-col justify-center px-12 lg:flex xl:px-20">
        <Link href="/" className="mb-12 text-sm font-semibold tracking-tight">
          {BRAND.name} <span className="text-orange-400">{BRAND.product}</span>
        </Link>
        <h1 className={`max-w-lg text-4xl font-bold leading-tight transition-all duration-700 xl:text-5xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          Type one sentence.<br />
          Get{" "}
          <span className="gradient-text inline-block min-w-[200px] transition-all duration-500">
            {ROTATING_DELIVERABLES[wordIndex]}
          </span>
          <br />
          <span className="text-neutral-500">In minutes.</span>
        </h1>
        <p className={`mt-6 max-w-md text-neutral-500 transition-all delay-150 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          {BRAND.subtagline}
        </p>
        <div className={`mt-10 flex gap-6 text-xs text-neutral-600 transition-all delay-300 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <span>94 capabilities</span>
          <span>·</span>
          <span>Multi-model AI</span>
          <span>·</span>
          <span>30-day guarantee</span>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center px-5 py-12 lg:w-1/2">
        <div className={`auth-card w-full max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 shadow-2xl backdrop-blur-xl ${mounted ? "auth-card-in" : "opacity-0"}`}>
          <div className="text-center lg:text-left">
            <div className="auth-logo mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-purple-600/20 lg:mx-0">
              <span className="text-lg font-bold gradient-text">CM</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-600 lg:hidden">
          <Link href="/" className="hover:text-neutral-400">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
