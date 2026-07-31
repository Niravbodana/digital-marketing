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
  const conversationIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<BrainMessage[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [user, setUser] = useState<{ name: string; role: string; credits: number } | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showKeyBox, setShowKeyBox] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keyConnecting, setKeyConnecting] = useState(false);
  const [keyMsg, setKeyMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) router.push("/login");
        else setUser(d.user);
      });
    // Seed keys + claim admin so agent/admin work after pull
    fetch("/api/admin/claim", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser((u) => (u ? { ...u, role: d.user.role } : { ...d.user, credits: d.user.credits ?? 0 }));
        return fetch("/api/status");
      })
      .then((r) => r?.json())
      .then((d) => {
        if (!d) return;
        setAgentOnline(!!d.ai);
        if (!d.ai) setShowKeyBox(true);
        else setShowKeyBox(false);
      })
      .catch(() => null);
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        setAgentOnline(!!d.ai);
        if (!d.ai) setShowKeyBox(true);
      })
      .catch(() => setShowKeyBox(true));
  }, [router]);

  async function connectKey(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    setKeyConnecting(true);
    setKeyMsg("");
    try {
      const res = await fetch("/api/agent/connect-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyValue: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setKeyMsg(data.error || "Failed");
      } else {
        setKeyMsg(`${String(data.provider || "AI").toUpperCase()} connected · ${data.model || ""}`);
        setApiKeyInput("");
        setAgentOnline(true);
        setShowKeyBox(false);
        if (data.role === "admin") {
          setUser((u) => (u ? { ...u, role: "admin" } : u));
        }
      }
    } catch {
      setKeyMsg("Connection failed");
    } finally {
      setKeyConnecting(false);
    }
  }

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

  const runBrain = useCallback(
    async (text: string, toolId?: string) => {
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
          body: JSON.stringify({
            prompt: trimmed,
            toolId,
            conversationId: conversationIdRef.current,
          }),
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

            if (data.type === "session" && data.conversationId) {
              conversationIdRef.current = data.conversationId;
            } else if (data.type === "thinking") {
              upsertMessage({
                id: data.id,
                role: "thinking",
                content: data.content,
                status: data.status,
              });
            } else if (data.type === "memory") {
              upsertMessage({
                id: data.id,
                role: "memory",
                content: data.content,
                status: data.status,
              });
            } else if (data.type === "tool") {
              upsertMessage({
                id: data.id,
                role: "tool",
                name: data.name,
                detail: data.detail,
                status: data.status,
                result: data.result,
              });
            } else if (data.type === "plan") {
              upsertMessage({
                id: data.id,
                role: "plan",
                steps: data.steps,
                reasoning: data.reasoning,
                status: data.status,
              });
            } else if (data.type === "assistant") {
              upsertMessage({ id: data.id, role: "assistant", content: data.content });
            } else if (data.type === "output") {
              setOutputs((prev) => [data.output, ...prev]);
            } else if (data.type === "credits" && data.credits !== undefined) {
              setUser((u) => (u ? { ...u, credits: data.credits } : u));
            } else if (data.type === "error") {
              setError(data.error);
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message || "Agent offline — add API keys in Admin");
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, upsertMessage]
  );

  function submit() {
    const t = input.trim();
    if (!t) return;
    runBrain(t);
    setInput("");
  }

  function newSession() {
    conversationIdRef.current = null;
    setMessages([]);
    setOutputs([]);
    setError("");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#030308] text-white">
      <GalaxyBackground />

      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.06] bg-black/20 px-5 py-3 backdrop-blur-md lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] font-mono text-[9px] tracking-wider text-neutral-400">
            AI
          </span>
          {BRAND.product}
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-mono ${agentOnline ? "text-emerald-400" : "text-neutral-600"}`}>
            {agentOnline ? "online" : "no api key"}
          </span>
          {!agentOnline && (
            <button
              type="button"
              onClick={() => setShowKeyBox(true)}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-200"
            >
              Add key
            </button>
          )}
          <button
            type="button"
            onClick={newSession}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white"
          >
            New chat
          </button>
          <Link
            href="/credits"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white"
          >
            {user?.credits ?? 0} credits
          </Link>
          <button
            type="button"
            onClick={() => setShowTools(true)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-neutral-400 hover:text-white"
          >
            {AGENT_TOOLS.length} tools
          </button>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-neutral-300"
            >
              Admin
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 lg:px-6">
        <div className="min-h-[50vh] max-h-[calc(100vh-220px)] flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/30 p-4 backdrop-blur-md">
          <BrainChat messages={messages} loading={loading} />
          {outputs.length > 0 && (
            <div className="mt-6 animate-slide-up border-t border-white/[0.06] pt-6">
              <OutputPanel outputs={outputs} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {error && <p className="mt-2 text-center font-mono text-xs text-red-400">{error}</p>}

        {(showKeyBox || !agentOnline) && (
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-amber-100">Connect API key to unlock full brain</p>
                <p className="mt-1 text-xs text-neutral-500">OpenAI (sk-…) · Groq (gsk_…) · Gemini (AIza…) · Claude (sk-ant-…)</p>
              </div>
              {agentOnline && (
                <button type="button" onClick={() => setShowKeyBox(false)} className="text-xs text-neutral-500">Hide</button>
              )}
            </div>
            <form onSubmit={connectKey} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your API key here…"
                disabled={keyConnecting}
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm outline-none"
              />
              <button
                type="submit"
                disabled={keyConnecting || !apiKeyInput.trim()}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
              >
                {keyConnecting ? "Connecting…" : "Connect"}
              </button>
            </form>
            {keyMsg && <p className="mt-2 text-xs text-neutral-400">{keyMsg}</p>}
          </div>
        )}

        <div className="relative mt-4 rounded-2xl border border-white/[0.1] bg-black/50 p-1 shadow-[0_0_40px_rgba(56,189,248,0.06)] backdrop-blur-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="What should I create? Or say hi to start…"
            rows={2}
            disabled={loading}
            className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-600 disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-[10px] text-neutral-600">
              Think · Memory · Search · Plan · Create
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-40"
            >
              {loading ? "Working…" : "Send"}
            </button>
          </div>
        </div>
      </main>

      {showTools && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
          onClick={() => setShowTools(false)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0a12]/95 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Capabilities</h2>
              <button
                type="button"
                onClick={() => setShowTools(false)}
                className="text-neutral-500 hover:text-white"
              >
                Close
              </button>
            </div>
            <ToolGrid onSelect={(id) => { void runBrain(input || "my project", id); }} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}
