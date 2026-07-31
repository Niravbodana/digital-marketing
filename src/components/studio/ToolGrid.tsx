"use client";

import { AGENT_TOOLS } from "@/lib/tools";
import { TypeIcon } from "@/components/ui/Icons";
import { useState } from "react";

export function ToolGrid({
  onSelect,
  loading,
}: {
  onSelect: (toolId: string, name: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = AGENT_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] text-neutral-500">{filtered.length} capabilities available</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-44 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs outline-none focus:border-white/20"
        />
      </div>
      <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {filtered.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id, tool.name)}
            disabled={loading}
            className="group rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.04] disabled:opacity-40"
          >
            <div className="flex items-start gap-2">
              <TypeIcon type={tool.outputType} size={16} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-200 group-hover:text-white">{tool.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-neutral-600">{tool.description}</p>
                <span className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-neutral-500 bg-white/[0.04]">
                  {tool.outputType}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
