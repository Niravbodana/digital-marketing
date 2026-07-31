"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentMind, type AgentStep } from "@/components/studio/AgentMind";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { ChatRefinePanel } from "@/components/studio/ChatRefinePanel";
import { SchedulerPanel } from "@/components/studio/SchedulerPanel";
import { InstagramConnectModal } from "@/components/command-center/InstagramConnectModal";
import { AccountDetails } from "@/components/command-center/AccountDetails";
import { InstagramPreview } from "@/components/dashboard/InstagramPreview";
import { AGENT_TOOLS } from "@/lib/tools";
import type { ToolOutput } from "@/lib/tool-executor";

const SUGGESTIONS = [
  "Instagram post for my brand",
  "UGC ad script",
  "Logo design brief",
  "Python automation",
  "Pitch deck outline",
  "Product video script",
];

export default function StudioPage() {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [post, setPost] = useState<{ id: string; caption: string; hashtags?: string | null; imageUrl?: string | null; status: string } | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; username: string; displayName?: string | null; followers: number; following: number; postsCount: number; bio?: string | null; isDemo: boolean; createdAt: string }>>([]);
  const [showIg, setShowIg] = useState(false);
  const [panel, setPanel] = useState<"none" | "refine" | "schedule" | "publish">("none");
  const [user, setUser] = useState<{ name: string; role: string; credits: number; email?: string } | null>(null);
  const [agentOnline, setAgentOnline] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
    fetch("/api/status").then((r) => r.json()).then((d) => setAgentOnline(!!d.ai)).catch(() => null);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/instagram/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts || []));
    fetch("/api/posts").then((r) => r.json()).then((d) => { if (d.posts?.[0]) setPost(d.posts[0]); });
  }, [user]);

  const runAgent = useCallback(async (userInput: string) => {
    const text = userInput.trim();
    if (!text || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError("");
    setLastPrompt(text);
    setPanel("none");
    setSteps([
      { id: "t1", phase: "thinking", title: "Understanding your request", content: text.slice(0, 180), status: "running", order: 1 },
    ]);

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Agent failed");
        setSteps([{
          id: "err",
          phase: "complete",
          title: data.error === "Insufficient credits" ? "Need more credits" : "Failed",
          content: data.error === "Insufficient credits"
            ? `This task needs ${data.creditsNeeded} credits.`
            : String(data.error),
          status: "done",
          order: 1,
        }]);
        return;
      }

      if (data.run?.steps) setSteps(data.run.steps);
      if (data.output) setOutputs((prev) => [data.output, ...prev]);
      if (data.post) setPost(data.post);
      if (data.credits !== undefined) setUser((u) => u ? { ...u, credits: data.credits } : u);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Connection failed — add API keys in Admin.");
        setSteps([{ id: "err", phase: "complete", title: "Connection error", content: "Admin → API Key Vault → paste your key", status: "done", order: 1 }]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  function submit() {
    const text = prompt.trim();
    if (!text) return;
    runAgent(text);
    setPrompt("");
  }

  async function connectIg(username: string, password: string) {
    setLoading(true);
    await fetch("/api/instagram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setShowIg(false);
    setLoading(false);
    const a = await fetch("/api/instagram/accounts").then((r) => r.json());
    setAccounts(a.accounts || []);
  }

  async function publishPost() {
    if (!post) return;
    const res = await fetch("/api/posts/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 studio-gradient" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-5 py-4 lg:px-10">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Bodana <span className="text-orange-400">AI</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className={`hidden text-[11px] sm:inline ${agentOnline ? "text-emerald-400" : "text-neutral-500"}`}>
            {agentOnline ? "Agent online" : "Add API key"}
          </span>
          <Link href="/credits" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5">
            {user?.credits ?? 0} credits
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-300 hover:bg-orange-500/20">
              Admin
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 lg:px-8 lg:py-12">
        <div className="text-center">
          <div className={`agent-orb mx-auto mb-6 h-24 w-24 rounded-full ${loading ? "agent-orb-active" : ""}`} />
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            What should I <span className="gradient-text">create</span>?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            One agent · {AGENT_TOOLS.length} capabilities · all your API keys working together
          </p>
        </div>

        <div className="agent-input-glow relative mt-10 rounded-2xl border border-white/10 bg-black/50 p-1 backdrop-blur-xl">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Movie trailer, Instagram post, website, song, ad, code — anything..."
            rows={3}
            disabled={loading}
            className="w-full resize-none rounded-xl bg-transparent px-5 py-4 text-base leading-relaxed outline-none placeholder:text-neutral-600 disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
            <div className="hidden flex-wrap gap-1.5 sm:flex">
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  disabled={loading}
                  className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-neutral-500 hover:border-white/20 hover:text-neutral-300 disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !prompt.trim()}
              className="ml-auto rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-8 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Running..." : "Create"}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

        <div className="mt-8">
          <AgentMind steps={steps} active={loading} prompt={lastPrompt} />
        </div>

        {outputs.length > 0 && (
          <div className="mt-8 animate-slide-up">
            <OutputPanel outputs={outputs} />
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {(["refine", "schedule", "publish"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPanel(panel === p ? "none" : p)}
              className={`rounded-full border px-4 py-2 text-xs capitalize transition ${
                panel === p ? "border-white/30 bg-white/10 text-white" : "border-white/[0.08] text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {panel === "refine" && (
          <div className="mt-4 animate-slide-up">
            <ChatRefinePanel
              initialContent={outputs[0]?.content}
              onApply={(text) => setOutputs((prev) => prev.length ? [{ ...prev[0], content: text }, ...prev.slice(1)] : prev)}
            />
          </div>
        )}
        {panel === "schedule" && (
          <div className="mt-4 max-w-lg animate-slide-up">
            <SchedulerPanel postId={post?.id} caption={post?.caption} />
          </div>
        )}
        {panel === "publish" && (
          <div className="mt-4 grid gap-4 animate-slide-up md:grid-cols-2">
            <AccountDetails account={accounts[0] || null} />
            <InstagramPreview post={post} account={accounts[0]} />
            <button type="button" onClick={() => setShowIg(true)} className="rounded-xl border border-white/10 py-3 text-sm md:col-span-2 hover:bg-white/5">
              Connect Instagram
            </button>
            {post && (
              <button type="button" onClick={publishPost} className="rounded-xl bg-white py-3 text-sm font-medium text-black md:col-span-2 hover:bg-neutral-200">
                Publish
              </button>
            )}
          </div>
        )}
      </main>

      <InstagramConnectModal open={showIg} onClose={() => setShowIg(false)} onConnect={connectIg} loading={loading} />
    </div>
  );
}
