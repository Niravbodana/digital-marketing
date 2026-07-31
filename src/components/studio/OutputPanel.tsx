"use client";

import type { ToolOutput } from "@/lib/tool-executor";
import { IconDownload, IconOutput } from "@/components/ui/Icons";

export function OutputPanel({ outputs }: { outputs: ToolOutput[] }) {
  if (!outputs.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#0c0c0c] p-8 text-center">
        <IconOutput className="text-neutral-600" />
        <p className="mt-3 text-sm font-medium text-neutral-400">No outputs yet</p>
        <p className="mt-1 text-xs text-neutral-600">Run the agent — results appear here</p>
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
              {o.type === "video" && !o.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-md border border-white/20 bg-black/50 px-4 py-2 text-xs backdrop-blur">Video script ready</span>
                </div>
              )}
            </div>
          )}
          {o.videoUrl && (
            <div className="aspect-video bg-black">
              <video src={o.videoUrl} controls className="h-full w-full" />
            </div>
          )}
          {o.audioUrl && (
            <div className="border-b border-white/5 bg-neutral-900 p-4">
              <audio src={o.audioUrl} controls className="w-full" />
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
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => downloadFile(o)} className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-medium text-black hover:bg-neutral-200">
                <IconDownload />
                Download
              </button>
              <button onClick={() => exportFormat(o, "pdf")} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white">
                PDF
              </button>
              <button onClick={() => exportFormat(o, "docx")} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white">
                DOCX
              </button>
              <button onClick={() => navigator.clipboard.writeText(o.content)} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white">
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

async function exportFormat(o: ToolOutput, format: "pdf" | "docx") {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: o.title, content: o.content, format }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${o.title.replace(/[^a-zA-Z0-9]/g, "_")}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
