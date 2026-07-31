"use client";

import { useCallback, useEffect, useState } from "react";
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
import { AGENT_TOOLS, getToolsByStudio } from "@/lib/tools";
import { VIDEO_TEMPLATES } from "@/lib/studios";
import type { ToolOutput } from "@/lib/tool-executor";

export default function StudioPage() {
  const router = useRouter();
  const [studio, setStudio] = useState("creator");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [post, setPost] = useState<{ id: string; caption: string; hashtags?: string | null; imageUrl?: string | null; status: string } | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; username: string; displayName?: string | null; followers: number; following: number; postsCount: number; bio?: string | null; isDemo: boolean; createdAt: string }>>([]);
  const [showIg, setShowIg] = useState(false);
  const [tab, setTab] = useState<"create" | "account" | "chat" | "schedule">("create");
  const [user, setUser] = useState<{ name: string; role: string; credits: number } | null>(null);

  const load = useCallback(async () => {
    const [s, p, a] = await Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/posts").then((r) => r.json()),
      fetch("/api/instagram/accounts").then((r) => r.json()),
    ]);
    if (!s.user) { router.push("/login"); return; }
    setUser(s.user);
    if (p.posts?.[0]) setPost(p.posts[0]);
    setAccounts(a.accounts || []);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function runTool(toolId: string, input: string) {
    setLoading(true);
    setSteps([{ id: "1", phase: "thinking", title: "Starting", content: input, status: "running", order: 1 }]);
    const res = await fetch("/api/tools/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, input }),
    });
    const data = await res.json();
    if (data.error === "Insufficient credits") {
      setSteps([{ id: "err", phase: "complete", title: "Insufficient Credits", content: `Need ${data.creditsNeeded} credits. Buy more in Credits page.`, status: "done", order: 1 }]);
    } else {
      if (data.run?.steps) setSteps(data.run.steps);
      if (data.output) setOutputs((prev) => [data.output, ...prev]);
      if (data.post) setPost(data.post);
      if (data.credits !== undefined) setUser((u) => u ? { ...u, credits: data.credits } : u);
    }
    setLoading(false);
    load();
  }

  async function runPrompt() {
    if (!prompt.trim()) return;
    const firstTool = getToolsByStudio(studio)[0];
    if (firstTool) await runTool(firstTool.id, prompt);
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
    load();
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
    load();
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
            <Link href="/admin" className="block rounded-lg px-3 py-2 text-xs text-neutral-500 hover:text-white">⚙️ Admin Panel</Link>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Creation Machine</h1>
            <p className="text-xs text-neutral-500">Movies, music, docs, images, code — anything from a single prompt</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/credits" className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400 hover:bg-orange-500/30">
              💎 {user?.credits ?? 0} credits
            </Link>
            <span className="hidden text-xs text-neutral-500 sm:block">{user?.name}</span>
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-medium text-purple-400">{AGENT_TOOLS.length} Tools</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="glow-orange rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe anything you want to create..."
                rows={3}
                className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-600"
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {["Create a pitch deck", "UGC ad script", "Python automation", "Instagram post"].map((s) => (
                    <button key={s} onClick={() => setPrompt(s)} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-neutral-500 hover:border-orange-500/30 hover:text-white">{s}</button>
                  ))}
                </div>
                <button onClick={runPrompt} disabled={loading || !prompt.trim()} className="rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                  {loading ? "Creating..." : "Create →"}
                </button>
              </div>
            </div>

            {studio === "video" && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-neutral-400">Pick a format. Make a short.</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {VIDEO_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setPrompt(`Create a ${t.name} video: `)} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-orange-500/30">
                      {t.popular && <span className="text-[10px] text-orange-400">Popular</span>}
                      <p className="mt-1 text-sm font-medium">{t.name}</p>
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
                    <ToolGrid studioId={studio} onSelect={(id) => runTool(id, prompt || "my project")} loading={loading} />
                  </div>
                </div>
                <OutputPanel outputs={outputs} />
              </div>
            )}

            {tab === "chat" && (
              <div className="mt-4">
                <ChatRefinePanel
                  initialContent={outputs[0]?.content}
                  onApply={(text) => setOutputs((prev) => prev.length ? [{ ...prev[0], content: text }, ...prev.slice(1)] : prev)}
                />
              </div>
            )}

            {tab === "schedule" && (
              <div className="mt-4 max-w-lg">
                <SchedulerPanel postId={post?.id} caption={post?.caption} />
              </div>
            )}

            {tab === "account" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <AccountDetails account={accounts[0] || null} />
                <InstagramPreview post={post} account={accounts[0]} />
                <button onClick={() => setShowIg(true)} className="md:col-span-2 rounded-xl border border-pink-500/30 bg-pink-500/10 py-3 text-sm font-semibold text-pink-300">
                  📸 Connect Instagram Account
                </button>
                {post && (
                  <button onClick={publishPost} className="md:col-span-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-sm font-semibold">
                    🚀 Publish Post
                  </button>
                )}
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
