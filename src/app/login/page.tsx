"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groq, setGroq] = useState("");
  const [google, setGoogle] = useState("");
  const [keyMsg, setKeyMsg] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }
    router.push("/studio");
  }

  async function saveKeys(e: React.FormEvent) {
    e.preventDefault();
    setKeyLoading(true);
    setKeyMsg("");
    try {
      const res = await fetch("/api/setup/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groq, google }),
      });
      if (res.status === 404) {
        setKeyMsg("Purana code chal raha hai. Branch pull karo: cursor/real-ai-brain-galaxy-1726");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setKeyMsg(data.error || "Save failed");
        return;
      }
      setKeyMsg(`Keys saved (${data.groq}/${data.google}). Ab login karke Studio kholo.`);
    } catch {
      setKeyMsg("Server band hai — pehle npm run dev chalao");
    } finally {
      setKeyLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle={`Sign in to ${BRAND.product}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 py-3.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-sm font-medium text-neutral-200">Step 1 — API keys (env file ki zarurat nahi)</p>
        <p className="mt-1 text-xs text-neutral-500">Groq + Gemini paste karo, Save dabao. File auto banegi: keys.env</p>
        <form onSubmit={saveKeys} className="mt-3 space-y-2">
          <input
            value={groq}
            onChange={(e) => setGroq(e.target.value)}
            placeholder="Groq key (gsk_...)"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs outline-none"
          />
          <input
            value={google}
            onChange={(e) => setGoogle(e.target.value)}
            placeholder="Gemini key (AQ... or AIza...)"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs outline-none"
          />
          <button
            type="submit"
            disabled={keyLoading || (!groq.trim() && !google.trim())}
            className="w-full rounded-lg bg-white/10 py-2 text-xs font-semibold hover:bg-white/15 disabled:opacity-40"
          >
            {keyLoading ? "Saving…" : "Save API keys"}
          </button>
        </form>
        {keyMsg && <p className="mt-2 text-xs text-amber-200/90">{keyMsg}</p>}
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-orange-400 hover:underline">
          Start free
        </Link>
        {" · "}
        <Link href="/setup" className="font-medium text-neutral-400 hover:underline">
          Setup page
        </Link>
      </p>
    </AuthShell>
  );
}
