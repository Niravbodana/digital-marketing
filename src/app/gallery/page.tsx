"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/super/SiteNav";
import { SuperFooter } from "@/components/super/SuperSections";

type Item = { id: string; type: string; title: string; subtitle?: string; mediaUrl: string; thumbnailUrl?: string; badge?: string };

export default function GalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/showcase").then((r) => r.json()).then((d) => setItems(d.items || []));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteNav />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold">Creation Gallery</h1>
          <p className="mt-2 text-neutral-500">Real outputs from Bodana AI — videos, images, ads, and more.</p>
          <div className="mt-6 flex gap-2">
            {["all", "video", "image"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-xs font-medium capitalize ${filter === f ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-neutral-500"}`}>{f}</button>
            ))}
          </div>
          <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4">
            {filtered.map((item) => (
              <div key={item.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10">
                {item.type === "video" ? (
                  <video src={item.mediaUrl} poster={item.thumbnailUrl} muted loop playsInline autoPlay className="w-full" />
                ) : item.type === "testimonial" ? null : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.mediaUrl} alt={item.title} className="w-full" />
                )}
                <div className="p-4">
                  {item.badge && <span className="text-[10px] text-orange-400">{item.badge}</span>}
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-neutral-600">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/studio" className="rounded-full bg-white px-8 py-3 text-sm font-bold text-black">Create Yours →</Link>
          </div>
        </div>
      </main>
      <SuperFooter />
    </div>
  );
}
