"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Package = { id: string; name: string; credits: number; priceInr: number };
type Transaction = { id: string; amount: number; type: string; description: string | null; createdAt: string };

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; credits: number } | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/packages").then((r) => r.json()),
      fetch("/api/credits").then((r) => r.json()),
    ]).then(([session, pkgData, creditData]) => {
      if (!session.user) { router.push("/login"); return; }
      setUser(session.user);
      setPackages(pkgData.packages || []);
      setTransactions(creditData.transactions || []);
    });

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [router]);

  async function buy(pkg: Package) {
    if (!user) return;
    setLoading(pkg.id);

    const orderRes = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: pkg.id }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) { alert(orderData.error || "Payment not available"); setLoading(null); return; }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100,
      currency: "INR",
      name: "Bodana Digital",
      description: `${pkg.credits} Credits — ${pkg.name}`,
      order_id: orderData.orderId,
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            userId: user.id,
            credits: pkg.credits,
          }),
        });
        const updated = await fetch("/api/credits").then((r) => r.json());
        setUser((u) => u ? { ...u, credits: updated.credits } : u);
        setTransactions(updated.transactions || []);
        setLoading(null);
        alert(`✅ ${pkg.credits} credits added!`);
      },
      prefill: { name: user.name },
      theme: { color: "#f97316" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold">💎 Credits</h1>
          <Link href="/studio" className="text-sm text-orange-400 hover:underline">← Back to Studio</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-purple-600/10 p-8 text-center">
          <p className="text-sm text-neutral-400">Your Balance</p>
          <p className="mt-2 text-5xl font-bold text-orange-400">{user?.credits ?? "—"}</p>
          <p className="mt-2 text-xs text-neutral-500">Credits power AI generation, images, and chat refine</p>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Buy Credits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {packages.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-orange-500/30 transition">
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-1 text-3xl font-bold text-orange-400">{p.credits} <span className="text-sm text-neutral-500">credits</span></p>
                <p className="mt-2 text-lg">₹{p.priceInr}</p>
                <button
                  onClick={() => buy(p)}
                  disabled={loading === p.id}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {loading === p.id ? "Processing..." : "Buy Now"}
                </button>
              </div>
            ))}
          </div>
          {packages.length === 0 && (
            <p className="text-sm text-neutral-500">No packages yet. Admin can add them in Admin Panel → Credit Packages.</p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm">{t.description || t.type}</p>
                  <p className="text-[10px] text-neutral-600">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <span className={`font-semibold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </span>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-sm text-neutral-600">No transactions yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
