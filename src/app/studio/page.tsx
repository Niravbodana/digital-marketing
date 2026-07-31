"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentShell } from "@/components/studio/AgentShell";
import { ToolGrid } from "@/components/studio/ToolGrid";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { ChatRefinePanel } from "@/components/studio/ChatRefinePanel";
import { SchedulerPanel } from "@/components/studio/SchedulerPanel";
import { ThinkingPanel, type AgentStep } from "@/components/command-center/ThinkingPanel";
import { InstagramPreview } from "@/components/dashboard/InstagramPreview";
import { InstagramConnectModal } from "@/components/command-center/InstagramConnectModal";
import { AccountDetails } from "@/components/command-center/AccountDetails";
import { AGENT_TOOLS } from "@/lib/tools";
import { IconCredits, IconInstagram, IconSend } from "@/components/ui/Icons";
import type { ToolOutput } from "@/lib/tool-executor";

const QUICK_PROMPTS = [
  "Create an Instagram post for my brand",
  "Write a UGC ad script",
  "Design a logo concept",
  "Build a Python automation script",
];

const TABS = [
  { id: "workspace" as const, label: "Workspace" },
  { id: "refine" as const, label: "Refine" },
  { id: "schedule" as const, label: "Schedule" },
  { id: "publish" as const, label: "Publish" },
];

export default function StudioPage() {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [post, setPost] = useState<{ id: string; caption: string; hashtags?: string | null; imageUrl?: string | null; status: string } | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; username: string; displayName?: string | null; followers: number; following: number; postsCount: number; bio?: string | null; isDemo: boolean; createdAt: string }>>([]);
  const [showIg, setShowIg] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [tab, setTab] = useState<"workspace" | "refine" | "schedule" | "publish">("workspace");
  const [user, setUser] = useState<{ name: string; role: string; credits: number } | null>(null);
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

  const runAgent = useCallback(async (userInput: string, toolId?: string) => {
    if (!userInput.trim() || loading) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError("");
    setSteps([
      { id: "t1", phase: "thinking", title: "Analyzing request", content: userInput.slice(0, 150), status: "running", order: 1 },
    ]);

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput, toolId }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Agent failed");
        setSteps([{
          id: "err",
          phase: "complete",
          title: data.error === "Insufficient credits" ? "Insufficient credits" : "Error",
          content: data.error === "Insufficient credits"
            ? `Requires ${data.creditsNeeded} credits.`
            : data.error,
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
        setError("Connection failed. Add API keys in Admin.");
        setSteps([{ id: "err", phase: "complete", title: "Connection error", content: "Configure API keys in Admin panel.", status: "done", order: 1 }]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  async function runPrompt() {
    const text = prompt.trim();
    if (!text) return;
    await runAgent(text);
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
    <AgentShell user={user} agentOnline={agentOnline}>
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 lg:px-8">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Bodana AI Agent</h1>
          <p className="text-xs text-neutral-500">One agent — images, video, code, ads, documents, social</p>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/credits" className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-orange-400">
            <IconCredits size={12} />
            {user?.credits ?? 0}
          </Link>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-neutral-400">
            {AGENT_TOOLS.length} capabilities
          </span>
          <span className={`rounded-full border px-3 py-1 text-[11px] ${agentOnline ? "border-emerald-500/30 text-emerald-400" : "border-neutral-700 text-neutral-500"}`}>
            {agentOnline ? "Online" : "Offline"}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runPrompt(); } }}
              placeholder="Describe what you need — the agent selects the right capability automatically..."
              rows={3}
              disabled={loading}
              className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-neutral-600 disabled:opacity-50"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    disabled={loading}
                    className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10px] text-neutral-500 transition hover:border-white/20 hover:text-neutral-300 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={runPrompt}
                disabled={loading || !prompt.trim()}
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-40"
              >
                {loading ? "Processing..." : "Run Agent"}
                {!loading && <IconSend size={14} />}
              </button>
            </div>
            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          </div>

          <div className="mt-6 flex flex-wrap gap-1 border-b border-white/[0.06] pb-px">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-medium transition ${tab === t.id ? "border-b-2 border-white text-white" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "workspace" && (
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div>
                <ThinkingPanel steps={steps} active={loading} />
                <div className="mt-4">
                  <button
                    onClick={() => setShowCapabilities(!showCapabilities)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-xs text-neutral-400 transition hover:text-neutral-200"
                  >
                    <span>All capabilities ({AGENT_TOOLS.length})</span>
                    <span>{showCapabilities ? "Hide" : "Show"}</span>
                  </button>
                  {showCapabilities && (
                    <div className="mt-3">
                      <ToolGrid onSelect={(id) => runAgent(prompt || "my project", id)} loading={loading} />
                    </div>
                  )}
                </div>
              </div>
              <OutputPanel outputs={outputs} />
            </div>
          )}

          {tab === "refine" && (
            <div className="mt-6 max-w-2xl">
              <ChatRefinePanel
                initialContent={outputs[0]?.content}
                onApply={(text) => setOutputs((prev) => prev.length ? [{ ...prev[0], content: text }, ...prev.slice(1)] : prev)}
              />
            </div>
          )}

          {tab === "schedule" && (
            <div className="mt-6 max-w-lg">
              <SchedulerPanel postId={post?.id} caption={post?.caption} />
            </div>
          )}

          {tab === "publish" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <AccountDetails account={accounts[0] || null} />
              <InstagramPreview post={post} account={accounts[0]} />
              <button
                onClick={() => setShowIg(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.03] md:col-span-2"
              >
                <IconInstagram />
                Connect Instagram
              </button>
              {post && (
                <button
                  onClick={publishPost}
                  className="rounded-xl bg-white py-3 text-sm font-medium text-black transition hover:bg-neutral-200 md:col-span-2"
                >
                  Publish Post
                </button>
              )}
            </div>
          )}
        </div>

        {tab === "workspace" && (
          <aside className="hidden w-72 flex-shrink-0 border-l border-white/[0.06] bg-[#080808] p-5 xl:block">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Preview</h3>
            <div className="mt-3">
              <InstagramPreview post={post} account={accounts[0]} />
            </div>
          </aside>
        )}
      </div>

      <InstagramConnectModal open={showIg} onClose={() => setShowIg(false)} onConnect={connectIg} loading={loading} />
    </AgentShell>
  );
}
