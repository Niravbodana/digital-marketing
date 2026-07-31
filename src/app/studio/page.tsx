"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudioNav } from "@/components/studio/StudioNav";
import { ToolGrid } from "@/components/studio/ToolGrid";
import { OutputPanel } from "@/components/studio/OutputPanel";
import { ChatRefinePanel } from "@/components/studio/ChatRefinePanel";
import { SchedulerPanel } from "@/components/studio/SchedulerPanel";
import { ThinkingPanel, type AgentStep } from "@/components/command-center/ThinkingPanel";
import { InstagramPreview } from "@/components/dashboard/InstagramPreview";
import { InstagramConnectModal } from "@/components/command-center/InstagramConnectModal";
import { AccountDetails } from "@/components/command-center/AccountDetails";
import { AGENT_TOOLS } from "@/lib/tools";
import { VIDEO_TEMPLATES } from "@/lib/studios";
import type { ToolOutput } from "@/lib/tool-executor";

export default function StudioPage() {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const [studio, setStudio] = useState("creator");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [post, setPost] = useState<{ id: string; caption: string; hashtags?: string | null; imageUrl?: string | null; status: string } | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; username: string; displayName?: string | null; followers: number; following: number; postsCount: number; bio?: string | null; isDemo: boolean; createdAt: string }>>([]);
  const [showIg, setShowIg] = useState(false);
  const [tab, setTab] = useState<"create" | "account" | "chat" | "schedule">("create");
  const [user, setUser] = useState<{ name: string; role: string; credits: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
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
      { id: "t1", phase: "thinking", title: "Understanding request", content: userInput.slice(0, 150), status: "running", order: 1 },
    ]);

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput, toolId, studio }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Agent failed");
        if (data.error === "Insufficient credits") {
          setSteps([{ id: "err", phase: "complete", title: "Need more credits", content: `Requires ${data.creditsNeeded} credits. Go to Credits page.`, status: "done", order: 1 }]);
        } else {
          setSteps([{ id: "err", phase: "complete", title: "Error", content: data.error, status: "done", order: 1 }]);
        }
        return;
      }

      if (data.run?.steps) setSteps(data.run.steps);
      if (data.output) setOutputs((prev) => [data.output, ...prev]);
      if (data.post) setPost(data.post);
      if (data.credits !== undefined) setUser((u) => u ? { ...u, credits: data.credits } : u);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Connection failed. Check API keys in Admin.");
        setSteps([{ id: "err", phase: "complete", title: "Connection error", content: "Add OpenAI/Groq/Gemini key in Admin → API Key Vault", status: "done", order: 1 }]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, studio, user]);

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
    <div className="flex min-h-screen bg-[#050505] text-white">
      <aside className="hidden w-64 flex-shrink-0 border-r border-white/5 bg-[#0a0a0a] p-4 lg:block">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 text-xs font-bold">BD</span>
          <span className="font-bold">Bodana</span>
        </Link>
        <StudioNav active={studio} onSelect={setStudio} />
        <div className="mt-6 space-y-1 border-t border-white/5 pt-4">
          <Link href="/credits" className="block rounded-lg px-3 py-2 text-xs text-orange-400 hover:bg-white/5">💎 Credits ({user?.credits ?? 0})</Link>
          <Link href="/teams" className="block rounded-lg px-3 py-2 text-xs text-neutral-500 hover:text-white">👥 Teams</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="block rounded-lg px-3 py-2 text-xs text-neutral-500 hover:text-white">⚙️ Admin → API Keys</Link>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Creation Machine</h1>
            <p className="text-xs text-neutral-500">Type anything — agent picks the right tool automatically</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">💎 {user?.credits ?? 0}</span>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] text-emerald-400">{AGENT_TOOLS.length} Tools</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="glow-orange rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runPrompt(); } }}
                placeholder="Bolo kya banana hai — movie, song, website, ad, code, kuch bhi..."
                rows={3}
                disabled={loading}
                className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-600 disabled:opacity-50"
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {["Instagram post banao", "UGC ad script", "Logo design", "Python script"].map((s) => (
                    <button key={s} onClick={() => setPrompt(s)} disabled={loading} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-neutral-500 hover:border-orange-500/30 hover:text-white disabled:opacity-40">{s}</button>
                  ))}
                </div>
                <button onClick={runPrompt} disabled={loading || !prompt.trim()} className="rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                  {loading ? "Agent working..." : "Create →"}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            </div>

            {studio === "video" && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-neutral-400">Pick a format</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {VIDEO_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setPrompt(`Create a ${t.name}: `)} disabled={loading} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-orange-500/30 disabled:opacity-40">
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="mt-1 text-[10px] text-neutral-600">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {(["create", "chat", "schedule", "account"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-xs font-medium capitalize ${tab === t ? "bg-white/10 text-white" : "text-neutral-500"}`}>{t}</button>
              ))}
            </div>

            {tab === "create" && (
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div>
                  <ThinkingPanel steps={steps} active={loading} />
                  <div className="mt-4">
                    <ToolGrid studioId={studio} onSelect={(id) => runAgent(prompt || "my project", id)} loading={loading} />
                  </div>
                </div>
                <OutputPanel outputs={outputs} />
              </div>
            )}

            {tab === "chat" && (
              <div className="mt-4">
                <ChatRefinePanel initialContent={outputs[0]?.content} onApply={(text) => setOutputs((prev) => prev.length ? [{ ...prev[0], content: text }, ...prev.slice(1)] : prev)} />
              </div>
            )}

            {tab === "schedule" && (
              <div className="mt-4 max-w-lg"><SchedulerPanel postId={post?.id} caption={post?.caption} /></div>
            )}

            {tab === "account" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <AccountDetails account={accounts[0] || null} />
                <InstagramPreview post={post} account={accounts[0]} />
                <button onClick={() => setShowIg(true)} className="md:col-span-2 rounded-xl border border-pink-500/30 bg-pink-500/10 py-3 text-sm font-semibold text-pink-300">📸 Connect Instagram</button>
                {post && <button onClick={publishPost} className="md:col-span-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-sm font-semibold">🚀 Publish Post</button>}
              </div>
            )}
          </div>

          {tab === "create" && (
            <aside className="hidden w-80 flex-shrink-0 border-l border-white/5 bg-[#0a0a0a] p-4 xl:block">
              <h3 className="mb-3 text-sm font-semibold text-neutral-400">Live Preview</h3>
              <InstagramPreview post={post} account={accounts[0]} />
            </aside>
          )}
        </div>
      </div>

      <InstagramConnectModal open={showIg} onClose={() => setShowIg(false)} onConnect={connectIg} loading={loading} />
    </div>
  );
}
