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
      <p className="mt-6 text-center text-sm text-neutral-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-orange-400 hover:underline">
          Start free
        </Link>
      </p>
    </AuthShell>
  );
}
