"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [groq, setGroq] = useState("");
  const [google, setGoogle] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/setup/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groq, google }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setMsg(`Saved keys.env · Groq: ${data.groq} · Gemini: ${data.google}`);
      setTimeout(() => router.push("/studio"), 1000);
    } catch {
      setError("Server nahi chal raha — pehle npm run dev karo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030308] px-4 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-widest text-neutral-500">Setup</p>
        <h1 className="mt-2 text-2xl font-semibold">API Keys Save Karo</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          <strong className="text-neutral-200">.env file ki zarurat nahi.</strong> Keys yahan paste
          karo → Save → automatically <span className="font-mono text-sky-300">keys.env</span> ban
          jayegi folder mein.
        </p>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-neutral-500">1) Groq key — gsk_ se start</label>
            <input
              value={groq}
              onChange={(e) => setGroq(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm outline-none focus:border-white/25"
              placeholder="gsk_...."
              autoComplete="off"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">2) Gemini key — AQ. ya AIza se start</label>
            <input
              value={google}
              onChange={(e) => setGoogle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm outline-none focus:border-white/25"
              placeholder="AQ.... or AIza..."
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!groq.trim() && !google.trim())}
            className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-40"
          >
            {loading ? "Saving…" : "Save keys & open Studio"}
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-emerald-400">{msg}</p>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-8 rounded-xl border border-white/5 bg-black/30 p-4 text-xs text-neutral-500">
          <p className="font-medium text-neutral-400">Agar form nahi chalega — CMD mein ye type karo:</p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-neutral-400">
            cd bodana-digital
            <br />
            notepad keys.env
          </p>
          <p className="mt-2">Notepad khulega → keys paste → Save → band karo → npm run dev</p>
        </div>

        <div className="mt-6 flex gap-4 text-xs text-neutral-500">
          <Link href="/login" className="hover:text-white">Login</Link>
          <Link href="/studio" className="hover:text-white">Studio</Link>
          <Link href="/admin" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </div>
  );
}
