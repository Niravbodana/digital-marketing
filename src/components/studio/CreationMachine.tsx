"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentMind, type AgentStep } from "@/components/studio/AgentMind";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { ToolGrid } from "@/components/studio/ToolGrid";
import { ChatRefinePanel } from "@/components/studio/ChatRefinePanel";
import { BRAND, ROTATING_DELIVERABLES } from "@/lib/brand";
import { AGENT_TOOLS } from "@/lib/tools";
import { FORMAT_PILLS } from "@/lib/studios";
import type { ToolOutput } from "@/lib/tool-executor";

const SUGGESTIONS = [
  "Make a cinematic promo video for my brand",
  "Write a full business book chapter",
  "Build a landing page with copy and design",
  "Produce a song with vocals",
];

export function CreationMachine() {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [user, setUser] = useState<{ name: string; role: string; credits: number } | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showRefine, setShowRefine] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING_DELIVERABLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
    fetch("/api/status").then((r) => r.json()).then((d) => setAgentOnline(!!d.ai)).catch(() => null);
  }, [router]);

  const runAgent = useCallback(async (text: string, toolId?: string) => {
    const input = text.trim();
    if (!input || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError("");
    setLastPrompt(input);
    setShowTools(false);
    setSteps([{ id: "live", phase: "understand", title: "Understanding your request", content: input.slice(0, 160), status: "running", order: 1 }]);

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, toolId }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed");
        setSteps([{ id: "err", phase: "deliver", title: "Error", content: String(data.error), status: "done", order: 1 }]);
        return;
      }

      if (data.run?.steps) setSteps(data.run.steps);
      if (data.output) setOutputs((prev) => [data.output, ...prev]);
      if (data.credits !== undefined) setUser((u) => (u ? { ...u, credits: data.credits } : u));
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Connection failed — add API keys in Admin");
        setSteps([{ id: "err", phase: "deliver", title: "Offline", content: "Admin → API Key Vault", status: "done", order: 1 }]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  function submit() {
    const t = prompt.trim();
    if (!t) return;
    runAgent(t);
    setPrompt("");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#030303]">
      <div className="pointer-events-none absolute inset-0 studio-gradient" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.05] px-5 py-3 lg:px-10">
        <Link href="/" className="text-sm font-semibold">
          {BRAND.name} <span className="text-orange-400">{BRAND.product}</span>
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className={`hidden sm:inline ${agentOnline ? "text-emerald-400" : "text-neutral-600"}`}>
            {agentOnline ? "Online" : "Add API key"}
          </span>
          <Link href="/credits" className="rounded-full border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white">
            {user?.credits ?? 0} cr
          </Link>
          <button
            type="button"
            onClick={() => setShowTools(!showTools)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white"
          >
            {AGENT_TOOLS.length} tools
          </button>
          {user?.role === "admin" && (
            <Link href="/admin" className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 font-medium text-orange-300">
              Admin
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6 lg:py-10">
        <div className="text-center">
          <div className={`agent-orb mx-auto mb-5 h-20 w-20 rounded-full transition-all ${loading ? "agent-orb-active scale-110" : ""}`} />
          {!loading && !steps.length && (
            <p className="text-xs text-neutral-600">
              Get <span className="gradient-text font-medium">{ROTATING_DELIVERABLES[wordIdx]}</span>
            </p>
          )}
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {loading ? "Creating..." : "What should I make?"}
          </h1>
        </div>

        <div className="agent-input-glow relative mt-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Describe anything — movie, song, site, ad, deck, code..."
            rows={2}
            disabled={loading}
            className="w-full resize-none rounded-t-2xl bg-transparent px-5 py-4 text-base outline-none placeholder:text-neutral-600 disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3">
            <div className="hidden flex-wrap gap-1 sm:flex">
              {SUGGESTIONS.slice(0, 2).map((s) => (
                <button key={s} type="button" onClick={() => setPrompt(s)} disabled={loading} className="rounded-full border border-white/[0.06] px-2 py-0.5 text-[10px] text-neutral-500 hover:text-neutral-300 disabled:opacity-40">
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !prompt.trim()}
              className="ml-auto rounded-xl bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-40"
            >
              {loading ? "..." : "Create"}
            </button>
          </div>
        </div>

        {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}

        <div className="mt-6">
          <AgentMind steps={steps} active={loading} prompt={lastPrompt} />
        </div>

        {outputs.length > 0 && (
          <div className="mt-6 animate-slide-up">
            <OutputPanel outputs={outputs} />
            <button
              type="button"
              onClick={() => setShowRefine(!showRefine)}
              className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-xs text-neutral-400 hover:bg-white/[0.03]"
            >
              {showRefine ? "Hide refine" : "Refine with AI"}
            </button>
            {showRefine && (
              <div className="mt-3">
                <ChatRefinePanel
                  initialContent={outputs[0]?.content}
                  onApply={(text) => setOutputs((prev) => (prev.length ? [{ ...prev[0], content: text }, ...prev.slice(1)] : prev))}
                />
              </div>
            )}
          </div>
        )}

        {!loading && !steps.length && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FORMAT_PILLS.slice(0, 8).map((f) => (
              <button key={f} type="button" onClick={() => setPrompt(`Create ${f.toLowerCase()} for `)} className="format-pill text-[10px]">
                {f}
              </button>
            ))}
          </div>
        )}
      </main>

      {showTools && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setShowTools(false)}>
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0a0a] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Capabilities</h2>
              <button type="button" onClick={() => setShowTools(false)} className="text-neutral-500 hover:text-white">Close</button>
            </div>
            <ToolGrid onSelect={(id) => runAgent(prompt || "my project", id)} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
