"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GalaxyBackground } from "@/components/studio/GalaxyBackground";
import { BrainChat, type BrainMessage } from "@/components/studio/BrainChat";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { ToolGrid } from "@/components/studio/ToolGrid";
import { BRAND } from "@/lib/brand";
import { AGENT_TOOLS } from "@/lib/tools";
import type { ToolOutput } from "@/lib/tool-executor";

export function CreationMachine() {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<BrainMessage[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [user, setUser] = useState<{ name: string; role: string; credits: number } | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
    fetch("/api/status").then((r) => r.json()).then((d) => setAgentOnline(!!d.ai)).catch(() => null);
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, outputs]);

  const upsertMessage = useCallback((msg: BrainMessage) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msg.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = msg;
        return next;
      }
      return [...prev, msg];
    });
  }, []);

  const runBrain = useCallback(async (text: string, toolId?: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError("");
    setShowTools(false);

    const userMsg: BrainMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, toolId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Stream failed" }));
        throw new Error(err.error || "Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === "thinking") {
            upsertMessage({ id: "thinking", role: "thinking", content: data.content });
          } else if (data.type === "assistant") {
            upsertMessage({ id: `a-${Date.now()}`, role: "assistant", content: data.content });
          } else if (data.type === "search") {
            upsertMessage({ id: "search", role: "search", query: data.query, results: data.results });
          } else if (data.type === "plan") {
            upsertMessage({ id: "plan", role: "plan", steps: data.steps, reasoning: data.reasoning });
          } else if (data.type === "status") {
            upsertMessage({ id: "status", role: "status", content: data.content, active: data.active });
          } else if (data.type === "output") {
            setOutputs((prev) => [data.output, ...prev]);
            if (data.credits !== undefined) setUser((u) => (u ? { ...u, credits: data.credits } : u));
            upsertMessage({ id: "status", role: "status", content: "Done — your creation is ready below.", active: false });
          } else if (data.type === "error") {
            setError(data.error);
            if (data.creditsNeeded) setError(`Need ${data.creditsNeeded} credits`);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message || "Brain offline — add API keys in Admin");
      }
    } finally {
      setLoading(false);
    }
  }, [loading, upsertMessage]);

  function submit() {
    const t = input.trim();
    if (!t) return;
    runBrain(t);
    setInput("");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#030308] text-white">
      <GalaxyBackground />

      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.06] bg-black/20 px-5 py-3 backdrop-blur-md lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="brain-pulse flex h-8 w-8 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/10 text-[10px] font-bold text-violet-300">AI</span>
          {BRAND.product}
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className={agentOnline ? "text-emerald-400" : "text-neutral-600"}>
            {agentOnline ? "Brain online" : "Connect API key"}
          </span>
          <Link href="/credits" className="rounded-full border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white">
            {user?.credits ?? 0} credits
          </Link>
          <button type="button" onClick={() => setShowTools(true)} className="rounded-full border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white">
            {AGENT_TOOLS.length} tools
          </button>
          {user?.role === "admin" && (
            <Link href="/admin" className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-violet-300">
              Admin
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 lg:px-6">
        <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/30 p-4 backdrop-blur-md min-h-[50vh] max-h-[calc(100vh-220px)]">
          <BrainChat messages={messages} loading={loading} />
          {outputs.length > 0 && (
            <div className="mt-6 border-t border-white/[0.06] pt-6 animate-slide-up">
              <OutputPanel outputs={outputs} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}

        <div className="relative mt-4 rounded-2xl border border-violet-500/20 bg-black/50 p-1 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.08)]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Tell me what to create — I'll think, research, plan, then build it..."
            rows={2}
            disabled={loading}
            className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-600 disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-[10px] text-neutral-600">Shift+Enter new line · Think → Search → Plan → Create</p>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 px-6 py-2 text-sm font-semibold shadow-lg shadow-violet-500/20 disabled:opacity-40"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      </main>

      {showTools && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onClick={() => setShowTools(false)}>
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0a12]/95 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Capabilities</h2>
              <button type="button" onClick={() => setShowTools(false)} className="text-neutral-500 hover:text-white">Close</button>
            </div>
            <ToolGrid onSelect={(id) => runBrain(input || "my project", id)} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
