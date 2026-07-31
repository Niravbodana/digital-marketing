"use client";

import type { ToolOutput } from "@/lib/tool-executor";

export function OutputPanel({ outputs }: { outputs: ToolOutput[] }) {
  if (!outputs.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-4xl">📦</p>
        <p className="mt-3 text-sm font-medium text-neutral-400">No outputs yet</p>
        <p className="mt-1 text-xs text-neutral-600">Pick a tool or type a prompt — files appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-300">Your Creations</h3>
        <span className="text-xs text-neutral-500">{outputs.length} file(s)</span>
      </div>
      {outputs.map((o, i) => (
        <div key={i} className="animate-slide-up rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          {o.imageUrl && (
            <div className="relative aspect-video bg-neutral-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.imageUrl} alt={o.title} className="h-full w-full object-cover" />
              {o.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur">▶ Video Script Ready</span>
                </div>
              )}
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white">{o.title}</p>
                <p className="text-xs text-neutral-500">{o.downloadName} · {o.type}</p>
              </div>
              <TypeBadge type={o.type} />
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-400">{o.content.slice(0, 200)}...</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => downloadFile(o)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
              >
                ⬇ Download
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(o.content)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    image: "bg-pink-500/20 text-pink-400",
    video: "bg-red-500/20 text-red-400",
    audio: "bg-emerald-500/20 text-emerald-400",
    document: "bg-blue-500/20 text-blue-400",
    code: "bg-green-500/20 text-green-400",
    spreadsheet: "bg-cyan-500/20 text-cyan-400",
    text: "bg-violet-500/20 text-violet-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${colors[type] || "bg-neutral-500/20 text-neutral-400"}`}>
      {type}
    </span>
  );
}

function downloadFile(o: ToolOutput) {
  const blob = new Blob([o.content], { type: o.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = o.downloadName;
  a.click();
  URL.revokeObjectURL(url);
}
