"use client";

import { AGENT_TOOLS, getToolsByStudio } from "@/lib/tools";
import { useState } from "react";

export function ToolGrid({
  studioId,
  onSelect,
  loading,
}: {
  studioId: string;
  onSelect: (toolId: string, name: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const tools = studioId === "all" ? AGENT_TOOLS : getToolsByStudio(studioId);
  const filtered = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-neutral-500">{filtered.length} tools</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {filtered.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id, tool.name)}
            disabled={loading}
            className="group rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-orange-500/30 hover:bg-orange-500/5 disabled:opacity-40"
          >
            <span className="text-lg">{tool.icon}</span>
            <p className="mt-1 text-xs font-medium text-white group-hover:text-orange-300">{tool.name}</p>
            <p className="mt-0.5 text-[10px] text-neutral-600 line-clamp-2">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
