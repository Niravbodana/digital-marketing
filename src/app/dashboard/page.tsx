"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InstagramPreview } from "@/components/dashboard/InstagramPreview";
import { ThinkingPanel, type AgentStep } from "@/components/command-center/ThinkingPanel";
import { AgentSidebar } from "@/components/command-center/AgentSidebar";
import { AccountDetails } from "@/components/command-center/AccountDetails";
import { InstagramConnectModal } from "@/components/command-center/InstagramConnectModal";

type Post = { id: string; caption: string; hashtags?: string | null; imageUrl?: string | null; status: string };
type Account = { id: string; username: string; displayName?: string | null; profilePicture?: string | null; followers: number; following: number; postsCount: number; bio?: string | null; isDemo: boolean; createdAt: string };
type User = { id: string; name: string; email: string; role: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [showIgModal, setShowIgModal] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);

  const loadData = useCallback(async () => {
    const [sessionRes, postsRes, accountsRes, statusRes] = await Promise.all([
      fetch("/api/auth/session"),
      fetch("/api/posts"),
      fetch("/api/instagram/accounts"),
      fetch("/api/status"),
    ]);
    const session = await sessionRes.json();
    if (!session.user) { router.push("/login"); return; }
    setUser(session.user);
    const posts = await postsRes.json();
    const acc = await accountsRes.json();
    const status = await statusRes.json();
    if (posts.posts?.[0]) setPost(posts.posts[0]);
    setAccounts(acc.accounts || []);
    setAiOnline(status.ai);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function runPrompt(text: string, toolId?: string) {
    setLoading(true);
    setMessage("");
    setSteps([
      { id: "1", phase: "thinking", title: "Understanding", content: text, status: "running", order: 1 },
    ]);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, toolId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.run?.steps) setSteps(data.run.steps);
      if (data.post) setPost(data.post);
      setMessage(data.reply);
      await loadData();
    } catch (e) {
      setMessage(`❌ ${e instanceof Error ? e.message : "Error"}`);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  }

  async function connectInstagram(username: string, password: string) {
    setLoading(true);
    const res = await fetch("/api/instagram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setShowIgModal(false);
    await loadData();
    setLoading(false);
  }

  async function publish() {
    if (!post) return;
    setPublishing(true);
    const res = await fetch("/api/posts/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setPublishing(false);
    await loadData();
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "POST" });
    router.push("/login");
  }

  const activeAccount = accounts[0] || null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      {/* Top Command Bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030712]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold shadow-lg shadow-violet-500/20">BD</span>
              <div>
                <p className="text-sm font-bold leading-none">Command Centre</p>
                <p className="text-[10px] text-slate-500">Bodana Digital AI</p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <StatusBadge label="AI" online={aiOnline} />
            <StatusBadge label="Instagram" online={accounts.length > 0} detail={activeAccount ? `@${activeAccount.username}` : undefined} />
            <StatusBadge label="DB" online />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white">⚙️ Admin</Link>
            <span className="hidden text-xs text-slate-400 sm:block">{user?.name}</span>
            <button onClick={logout} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-4">
        {message && (
          <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">{message}</div>
        )}

        {/* 3-column Command Centre */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* LEFT: Agent Tools */}
          <div className="lg:col-span-3">
            <AgentSidebar onSelectTool={(p, id) => { setPrompt(p + " "); runPrompt(p, id); }} />
          </div>

          {/* CENTER: Prompt + Thinking + Account */}
          <div className="space-y-4 lg:col-span-5">
            {/* Prompt Bar */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Command Prompt</label>
              <div className="flex gap-2">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && runPrompt(prompt)}
                  placeholder="Kuch bhi bolo... 'Instagram post banao', 'hashtags generate karo'"
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  disabled={loading}
                />
                <button onClick={() => runPrompt(prompt)} disabled={loading || !prompt.trim()} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500 disabled:opacity-40">
                  {loading ? "..." : "▶ Start"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Post banao", "Hashtags", "Schedule karo", "Publish"].map((s) => (
                  <button key={s} onClick={() => runPrompt(s)} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-slate-400 hover:bg-violet-500/20 hover:text-white">{s}</button>
                ))}
              </div>
            </div>

            <ThinkingPanel steps={steps} active={loading} />

            <AccountDetails account={activeAccount} />

            <button onClick={() => setShowIgModal(true)} className="w-full rounded-xl border border-pink-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 py-3 text-sm font-semibold text-pink-300 hover:from-purple-500/20 hover:to-pink-500/20">
              📸 + Connect Instagram Account
            </button>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">📱 Live Preview</h2>
                <div className="flex gap-2">
                  <button onClick={() => post && runPrompt(`Regenerate: ${post.caption}`)} disabled={!post || loading} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 hover:text-white disabled:opacity-30">🔄</button>
                  <button onClick={publish} disabled={!post || publishing} className="rounded-lg bg-emerald-600 px-4 py-1 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-30">
                    {publishing ? "..." : "🚀 Publish"}
                  </button>
                </div>
              </div>
              <InstagramPreview post={post} account={activeAccount} />
            </div>
          </div>
        </div>
      </div>

      <InstagramConnectModal open={showIgModal} onClose={() => setShowIgModal(false)} onConnect={connectInstagram} loading={loading} />
    </div>
  );
}

function StatusBadge({ label, online, detail }: { label: string; online: boolean; detail?: string }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium ${online ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-slate-600"}`} />
      {label} {detail && <span className="text-slate-500">· {detail}</span>}
    </span>
  );
}
