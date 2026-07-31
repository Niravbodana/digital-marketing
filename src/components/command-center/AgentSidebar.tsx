"use client";

import { useState } from "react";
import { AGENT_TOOLS, TOOL_CATEGORIES } from "@/lib/tools";

export function AgentSidebar({ onSelectTool }: { onSelectTool: (prompt: string, toolId: string) => void }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = AGENT_TOOLS.filter((t) => {
    const matchCat = category === "All" || t.category === category;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-slate-900/50">
      <div className="border-b border-white/5 p-4">
        <h3 className="text-sm font-semibold">🤖 Agent Tools</h3>
        <p className="text-xs text-slate-500">{AGENT_TOOLS.length} tools available</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-violet-500"
        />
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/5 p-2">
        {["All", ...TOOL_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${
              category === c ? "bg-violet-500 text-white" : "text-slate-400 hover:bg-white/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[calc(100vh-320px)]">
        {filtered.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.prompt, tool.id)}
            className="flex w-full items-start gap-2 rounded-lg p-2.5 text-left transition hover:bg-violet-500/10"
          >
            <span className="text-lg">{tool.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{tool.name}</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">{tool.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
