"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Cursor-style live action blocks — no emojis */
export type BrainMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string }
  | { id: string; role: "thinking"; content: string; status: "running" | "done" }
  | { id: string; role: "tool"; name: string; detail: string; status: "running" | "done" | "error"; result?: string }
  | { id: string; role: "plan"; steps: string[]; reasoning: string; status: "running" | "done" }
  | { id: string; role: "memory"; content: string; status: "running" | "done" };

function StatusDot({ status }: { status: "running" | "done" | "error" }) {
  if (status === "running") {
    return <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sky-400 action-pulse" />;
  }
  if (status === "error") {
    return <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />;
  }
  return <span className="mt-0.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-emerald-500/80 text-[7px] leading-none text-black">✓</span>;
}

function ActionShell({
  label,
  status,
  children,
  defaultOpen,
}: {
  label: string;
  status: "running" | "done" | "error";
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? status === "running");

  useEffect(() => {
    if (status === "running") setOpen(true);
  }, [status]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-white/[0.03]"
      >
        <StatusDot status={status} />
        <span className="font-mono text-[11px] font-medium tracking-wide text-neutral-300">{label}</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-neutral-600">
          {status === "running" ? "running" : status === "error" ? "error" : "done"}
        </span>
        <span className="text-[10px] text-neutral-600">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="border-t border-white/[0.05] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-neutral-400">
          {children}
        </div>
      )}
    </div>
  );
}

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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] tracking-widest text-neutral-500">
          AGENT
        </div>
        <p className="text-sm text-neutral-400">Ready — same loop as Cursor Agent</p>
        <p className="mt-2 max-w-sm font-mono text-[11px] leading-relaxed text-neutral-600">
          think → recall memory → search → plan → act → reply
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-white/[0.08] px-4 py-2.5 text-sm text-neutral-100">
                {m.content}
              </div>
            </div>
          );
        }

        if (m.role === "assistant") {
          return (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[92%] rounded-xl rounded-bl-sm border border-white/[0.06] bg-black/40 px-4 py-3 text-sm leading-relaxed text-neutral-300">
                {m.content}
              </div>
            </div>
          );
        }

        if (m.role === "thinking") {
          return (
            <ActionShell key={m.id} label="Thinking" status={m.status} defaultOpen>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-sky-200/70">{m.content}</pre>
            </ActionShell>
          );
        }

        if (m.role === "memory") {
          return (
            <ActionShell key={m.id} label="Memory" status={m.status}>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-amber-100/60">{m.content}</pre>
            </ActionShell>
          );
        }

        if (m.role === "tool") {
          return (
            <ActionShell
              key={m.id}
              label={`${m.name}${m.detail ? ` · ${m.detail.slice(0, 48)}` : ""}`}
              status={m.status}
              defaultOpen={m.status === "running"}
            >
              <div className="space-y-2">
                <p className="text-neutral-500">Input: {m.detail}</p>
                {m.result && (
                  <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap text-neutral-400">{m.result}</pre>
                )}
                {m.status === "running" && (
                  <p className="action-pulse text-sky-400/80">Executing…</p>
                )}
              </div>
            </ActionShell>
          );
        }

        if (m.role === "plan") {
          return (
            <ActionShell key={m.id} label="Plan" status={m.status} defaultOpen>
              <ol className="list-decimal space-y-1 pl-4 text-neutral-400">
                {m.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              {m.reasoning && <p className="mt-2 text-neutral-600">{m.reasoning}</p>}
            </ActionShell>
          );
        }

        return null;
      })}

      {loading && (
        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
          <span className="h-3 w-3 animate-spin rounded-full border border-white/10 border-t-sky-400" />
          agent running
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
