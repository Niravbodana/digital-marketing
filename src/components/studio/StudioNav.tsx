"use client";

import { STUDIOS } from "@/lib/studios";

export function StudioNav({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">Studios</p>
      {STUDIOS.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
            active === s.id
              ? "bg-white/10 text-white"
              : "text-neutral-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="text-xl">{s.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{s.name}</p>
            <p className="text-[10px] text-neutral-600 truncate">{s.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
