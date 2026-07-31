"use client";

import { useEffect, useRef } from "react";

export type BrainMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string }
  | { id: string; role: "thinking"; content: string; expanded?: boolean }
  | { id: string; role: "search"; query: string; results: string }
  | { id: string; role: "plan"; steps: string[]; reasoning: string }
  | { id: string; role: "status"; content: string; active?: boolean };

export function BrainChat({
  messages,
  loading,
}: {
  messages: BrainMessage[];
  loading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!messages.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="brain-pulse mb-4 h-16 w-16 rounded-full border border-violet-500/30 bg-violet-500/10" />
        <p className="text-sm text-neutral-400">AI Brain ready</p>
        <p className="mt-1 max-w-sm text-xs text-neutral-600">
          I&apos;ll think, research, plan, then create — like ChatGPT + Cursor combined.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white/10 px-4 py-3 text-sm text-neutral-100">
                {m.content}
              </div>
            </div>
          );
        }

        if (m.role === "assistant") {
          return (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-black/40 px-4 py-3 text-sm leading-relaxed text-neutral-300 backdrop-blur-sm">
                {m.content}
              </div>
            </div>
          );
        }

        if (m.role === "thinking") {
          return (
            <div key={m.id} className="brain-thinking rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                <span className="brain-dot h-2 w-2 rounded-full bg-violet-400" />
                Thinking
              </div>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-violet-200/80">{m.content}</pre>
            </div>
          );
        }

        if (m.role === "search") {
          return (
            <div key={m.id} className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Searching · {m.query}
              </div>
              <p className="mt-2 line-clamp-6 text-xs leading-relaxed text-cyan-100/70">{m.results || "Gathering sources…"}</p>
            </div>
          );
        }

        if (m.role === "plan") {
          return (
            <div key={m.id} className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Planning</div>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-blue-100/80">
                {m.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <p className="mt-2 text-[11px] text-neutral-500">{m.reasoning}</p>
            </div>
          );
        }

        if (m.role === "status") {
          return (
            <div key={m.id} className="flex items-center gap-2 text-xs text-orange-300/90">
              {m.active && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-400/20 border-t-orange-400" />
              )}
              {m.content}
            </div>
          );
        }

        return null;
      })}
      {loading && messages[messages.length - 1]?.role !== "status" && (
        <div className="flex items-center gap-2 text-xs text-violet-300">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
          Brain processing…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
