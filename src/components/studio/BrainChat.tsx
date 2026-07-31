"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Professional live action blocks — Cursor-style, no emojis */
export type BrainMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string }
  | { id: string; role: "thinking"; content: string; status: "running" | "done" }
  | { id: string; role: "tool"; name: string; detail: string; status: "running" | "done" | "error"; result?: string }
  | { id: string; role: "plan"; steps: string[]; reasoning: string; status: "running" | "done" }
  | { id: string; role: "memory"; content: string; status: "running" | "done" };

function StatusMark({ status }: { status: "running" | "done" | "error" }) {
  if (status === "running") {
    return (
      <span className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border border-white/15 border-t-sky-400" />
    );
  }
  if (status === "error") {
    return <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[9px] text-red-400">!</span>;
  }
  return (
    <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-400">
      ✓
    </span>
  );
}

function ActionShell({
  label,
  status,
  children,
  defaultOpen,
  accent = "neutral",
}: {
  label: string;
  status: "running" | "done" | "error";
  children: ReactNode;
  defaultOpen?: boolean;
  accent?: "neutral" | "sky" | "amber" | "violet";
}) {
  const [open, setOpen] = useState(defaultOpen ?? status === "running");

  useEffect(() => {
    if (status === "running") setOpen(true);
    else if (status === "done" && defaultOpen === false) setOpen(false);
  }, [status, defaultOpen]);

  const accents = {
    neutral: "border-white/[0.08] bg-white/[0.02]",
    sky: "border-sky-500/20 bg-sky-500/[0.04]",
    amber: "border-amber-500/15 bg-amber-500/[0.03]",
    violet: "border-violet-500/15 bg-violet-500/[0.03]",
  };

  return (
    <div className={`overflow-hidden rounded-xl border ${accents[accent]} transition-colors`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/[0.02]"
      >
        <StatusMark status={status} />
        <span className="text-[12px] font-medium tracking-wide text-neutral-200">{label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-neutral-600">
          {status}
        </span>
        <span className="text-[10px] text-neutral-600">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="border-t border-white/[0.05] px-3.5 py-3 text-[12px] leading-relaxed text-neutral-400">
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400">AI</span>
        </div>
        <p className="text-base font-medium text-neutral-200">Autonomous Agent</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
          I think, recall memory, search the web, plan, then create.
          Say what you need — or just say hi to start.
        </p>
        <div className="mt-6 grid w-full max-w-sm gap-2 text-left">
          {[
            "Design a logo for my cafe, modern minimal",
            "Write Instagram ad copy for a skincare launch",
            "Create a 30-sec product video script",
          ].map((ex) => (
            <p
              key={ex}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] text-neutral-500"
            >
              {ex}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.09] px-4 py-2.5 text-sm text-neutral-100">
                {m.content}
              </div>
            </div>
          );
        }

        if (m.role === "assistant") {
          return (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.07] bg-black/50 px-4 py-3 text-sm leading-relaxed text-neutral-200 shadow-sm">
                {m.content.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        if (m.role === "thinking") {
          return (
            <ActionShell key={m.id} label="Thinking" status={m.status} accent="sky" defaultOpen={m.status === "running"}>
              <pre className="whitespace-pre-wrap font-sans text-[12px] text-sky-100/70">{m.content}</pre>
            </ActionShell>
          );
        }

        if (m.role === "memory") {
          return (
            <ActionShell key={m.id} label="Memory" status={m.status} accent="amber" defaultOpen={false}>
              <pre className="whitespace-pre-wrap font-sans text-[12px] text-amber-100/60">{m.content}</pre>
            </ActionShell>
          );
        }

        if (m.role === "tool") {
          return (
            <ActionShell
              key={m.id}
              label={m.name}
              status={m.status}
              accent="violet"
              defaultOpen={m.status === "running"}
            >
              <div className="space-y-2">
                {m.detail && <p className="text-neutral-500">{m.detail}</p>}
                {m.result && (
                  <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap text-neutral-400">{m.result}</pre>
                )}
                {m.status === "running" && <p className="action-pulse text-sky-400/80">Running…</p>}
              </div>
            </ActionShell>
          );
        }

        if (m.role === "plan") {
          return (
            <ActionShell key={m.id} label="Plan" status={m.status} defaultOpen={m.status === "running"}>
              <ol className="list-decimal space-y-1.5 pl-4 text-neutral-300">
                {m.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              {m.reasoning && <p className="mt-3 text-[11px] text-neutral-600">{m.reasoning}</p>}
            </ActionShell>
          );
        }

        return null;
      })}

      {loading && (
        <div className="flex items-center gap-2.5 px-1 text-[12px] text-neutral-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/10 border-t-sky-400" />
          Agent working…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
