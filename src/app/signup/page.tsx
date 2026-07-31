"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { BRAND } from "@/lib/brand";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      setLoading(false);
      return;
    }
    router.push("/studio");
  }

  return (
    <AuthShell title="Start creating" subtitle="Free credits · No card required">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
        />
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
          placeholder="Password (6+ characters)"
          required
          minLength={6}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 py-3.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-neutral-600">
        By signing up you agree to create with {BRAND.name} {BRAND.product}.
      </p>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Have an account?{" "}
        <Link href="/login" className="font-medium text-orange-400 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
