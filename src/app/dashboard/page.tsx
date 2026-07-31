"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PromptBar } from "@/components/dashboard/PromptBar";
import { TaskList } from "@/components/dashboard/TaskList";
import { InstagramPreview } from "@/components/dashboard/InstagramPreview";
import { AccountConnect } from "@/components/dashboard/AccountConnect";
import { ToolsPanel } from "@/components/dashboard/ToolsPanel";

type Post = {
  id: string;
  caption: string;
  hashtags?: string | null;
  imageUrl?: string | null;
  status: string;
};

type Task = {
  id: string;
  title: string;
  prompt: string;
  status: string;
  result?: string | null;
  createdAt: string;
};

type Account = {
  id: string;
  username: string;
  displayName?: string | null;
  profilePicture?: string | null;
  isDemo: boolean;
};

type Status = {
  ai: boolean;
  instagram: boolean;
  demoMode: boolean;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"prompt" | "accounts" | "tools">("prompt");

  const loadData = useCallback(async () => {
    const [tasksRes, postsRes, accountsRes, statusRes] = await Promise.all([
      fetch("/api/ai"),
      fetch("/api/posts"),
      fetch("/api/instagram/accounts"),
      fetch("/api/status"),
    ]);
    const tasksData = await tasksRes.json();
    const postsData = await postsRes.json();
    const accountsData = await accountsRes.json();
    const statusData = await statusRes.json();
    setTasks(tasksData.tasks || []);
    if (postsData.posts?.[0]) setPost(postsData.posts[0]);
    setAccounts(accountsData.accounts || []);
    setStatus(statusData);
  }, []);

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      setMessage(`✅ ${params.get("connected")} Instagram account(s) connected!`);
      window.history.replaceState({}, "", "/dashboard");
    }
    if (params.get("error")) {
      setMessage(`❌ Error: ${params.get("error")}`);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [loadData]);

  async function handlePrompt(prompt: string) {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.post) setPost(data.post);
      setMessage(data.reply || "Done!");
      await loadData();
    } catch (e) {
      setMessage(`❌ ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(topic: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.post) setPost(data.post);
      setMessage("✅ Post generated — preview dekho!");
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!post) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage(data.message || "Published!");
      await loadData();
    } catch (e) {
      setMessage(`❌ ${e instanceof Error ? e.message : "Publish failed"}`);
    } finally {
      setPublishing(false);
    }
  }

  async function connectDemo() {
    setLoading(true);
    await fetch("/api/instagram/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo: true }),
    });
    await loadData();
    setMessage("✅ Demo Instagram account connected!");
    setLoading(false);
  }

  async function connectReal() {
    setLoading(true);
    const res = await fetch("/api/instagram/auth");
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setMessage("⚠️ Meta App ID not set — Demo Connect use karo ya .env mein META_APP_ID add karo.");
      setLoading(false);
    }
  }

  async function disconnect(id: string) {
    await fetch("/api/instagram/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadData();
  }

  const activeAccount = accounts[0] || null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold">
                BD
              </span>
              <span className="font-semibold">
                Bodana <span className="text-indigo-400">Digital</span>
              </span>
            </Link>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
              AI Studio
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`rounded-full px-2 py-1 ${status?.ai ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              AI {status?.ai ? "ON" : "Mock"}
            </span>
            <span className={`rounded-full px-2 py-1 ${accounts.length ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
              IG {accounts.length ? `@${accounts[0].username}` : "Not connected"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Status message */}
        {message && (
          <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left panel */}
          <div className="space-y-6 lg:col-span-5">
            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-white/5 p-1">
              {(["prompt", "accounts", "tools"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "prompt" ? "💬 Prompt" : tab === "accounts" ? "📸 Accounts" : "🛠 Tools"}
                </button>
              ))}
            </div>

            {activeTab === "prompt" && (
              <>
                <PromptBar onSubmit={handlePrompt} loading={loading} />
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-400">Recent Tasks</h3>
                  <TaskList tasks={tasks} />
                </div>
              </>
            )}

            {activeTab === "accounts" && (
              <AccountConnect
                accounts={accounts}
                onConnectDemo={connectDemo}
                onConnectReal={connectReal}
                onDisconnect={disconnect}
                loading={loading}
              />
            )}

            {activeTab === "tools" && (
              <ToolsPanel
                onGenerate={handleGenerate}
                onPublish={handlePublish}
                publishing={publishing}
                hasPost={!!post}
              />
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Live Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => post && handleGenerate(post.caption)}
                  disabled={!post || loading}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40"
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!post || publishing}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-40"
                >
                  {publishing ? "..." : "🚀 Publish"}
                </button>
              </div>
            </div>
            <InstagramPreview post={post} account={activeAccount} />
          </div>
        </div>
      </div>
    </div>
  );
}
