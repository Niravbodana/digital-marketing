"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PROVIDERS = [
  { id: "openai", name: "OpenAI API", placeholder: "sk-..." },
  { id: "postiz", name: "Postiz API", placeholder: "your-postiz-key" },
  { id: "meta", name: "Meta App Secret", placeholder: "app-secret" },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [keys, setKeys] = useState<Array<{ id: string; provider: string; status: string; lastCheck: string | null }>>([]);
  const [form, setForm] = useState({ provider: "openai", keyValue: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
    loadKeys();
  }, [router]);

  async function loadKeys() {
    const res = await fetch("/api/admin/keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys || []);
    }
  }

  async function saveKey(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`✅ ${form.provider} key saved — Status: ${data.key.status.toUpperCase()}`);
      setForm({ ...form, keyValue: "" });
      loadKeys();
    } else {
      setMsg(`❌ ${data.error}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold">⚙️ Admin Panel</h1>
          <Link href="/dashboard" className="text-sm text-indigo-400 hover:underline">← Dashboard</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <p className="text-sm text-slate-400">Welcome, {user?.name}. API keys manage karo — working key = <span className="text-emerald-400">ONLINE</span> status.</p>

        {msg && <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm">{msg}</div>}

        <form onSubmit={saveKey} className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-4">
          <h2 className="font-semibold">Add API Key</h2>
          <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input value={form.keyValue} onChange={(e) => setForm({ ...form, keyValue: e.target.value })} placeholder="Paste API key..." required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono" />
          <button type="submit" className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-400">Validate & Save</button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
          <h2 className="mb-4 font-semibold">API Status</h2>
          {keys.length === 0 ? (
            <p className="text-sm text-slate-500">No keys added yet</p>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-sm font-medium capitalize">{k.provider}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${k.status === "online" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {k.status === "online" ? "● ONLINE" : "○ OFFLINE"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
