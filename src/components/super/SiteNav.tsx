"use client";

import Link from "next/link";

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 text-sm shadow-lg shadow-orange-500/20">BD</span>
          <span className="hidden sm:block">Bodana <span className="text-orange-400">Digital</span></span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/features" className="text-sm text-neutral-400 transition hover:text-white">Features</Link>
          <Link href="/gallery" className="text-sm text-neutral-400 transition hover:text-white">Gallery</Link>
          <Link href="/tools" className="text-sm text-neutral-400 transition hover:text-white">94 Tools</Link>
          <Link href="/pricing" className="text-sm text-neutral-400 transition hover:text-white">Pricing</Link>
          <Link href="/studio" className="text-sm text-neutral-400 transition hover:text-white">Studio</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-neutral-400 hover:text-white sm:block">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/25 transition hover:opacity-90">
            Start Free →
          </Link>
        </div>
      </nav>
    </header>
  );
}
