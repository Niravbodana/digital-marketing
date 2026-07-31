"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ConfigItem = {
  id: string;
  key: string;
  value: string;
  category: string;
  label: string;
  description?: string | null;
  type: string;
  isSecret: boolean;
  sortOrder: number;
};

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  active: boolean;
  sortOrder: number;
};

type Stats = { users: number; posts: number; conversations: number; scheduled: number };

const CATEGORIES = [
  { id: "general", name: "General", icon: "⚙️", desc: "App name, URL, support" },
  { id: "branding", name: "Branding", icon: "🎨", desc: "Logo, colors, white-label" },
  { id: "ai", name: "AI & Models", icon: "🤖", desc: "OpenAI, DALL-E, Replicate" },
  { id: "payments", name: "Razorpay", icon: "💳", desc: "Payment gateway & credits" },
  { id: "social", name: "Social", icon: "📱", desc: "Meta, Postiz, LinkedIn" },
  { id: "email", name: "Email", icon: "📧", desc: "SMTP configuration" },
  { id: "storage", name: "Storage", icon: "☁️", desc: "S3, R2, CDN" },
  { id: "features", name: "Features", icon: "🚩", desc: "Feature flags" },
  { id: "packages", name: "Credit Packages", icon: "💎", desc: "Pricing plans" },
  { id: "promos", name: "Promo Codes", icon: "🎟️", desc: "Discounts & offers" },
  { id: "subscriptions", name: "Subscriptions", icon: "📋", desc: "Monthly/yearly plans" },
];

const TEST_SERVICES = [
  { id: "openai", label: "OpenAI", category: "ai" },
  { id: "razorpay", label: "Razorpay", category: "payments" },
  { id: "postiz", label: "Postiz", category: "social" },
  { id: "meta", label: "Meta OAuth", category: "social" },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [tab, setTab] = useState("general");
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [pkgForm, setPkgForm] = useState({ name: "", credits: 100, priceInr: 99 });
  const [promos, setPromos] = useState<Array<{ id: string; code: string; description?: string; discountType: string; discountValue: number; bonusCredits: number; usedCount: number; maxUses: number; active: boolean }>>([]);
  const [promoForm, setPromoForm] = useState({ code: "", description: "", discountType: "percent", discountValue: 10, bonusCredits: 0, maxUses: 100 });
  const [plans, setPlans] = useState<Array<{ id: string; name: string; priceInr: number; creditsPerMonth: number; billingPeriod: string; popular: boolean }>>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/config?secrets=${showSecrets ? "1" : "0"}`);
    if (!res.ok) return;
    const data = await res.json();
    setConfigs(data.configs || []);
    setPackages(data.packages || []);
    setStats(data.stats || null);
    const initial: Record<string, string> = {};
    for (const c of data.configs || []) initial[c.key] = c.value;
    setEdits(initial);
  }, [showSecrets]);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else if (d.user.role !== "admin") router.push("/studio");
      else setUser(d.user);
    });
  }, [router]);

  useEffect(() => { if (user) load(); }, [user, load]);

  useEffect(() => {
    if (tab === "promos" && user) {
      fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || []));
    }
    if (tab === "subscriptions" && user) {
      fetch("/api/admin/plans").then((r) => r.json()).then((d) => setPlans(d.plans || []));
    }
  }, [tab, user]);

  async function saveCategory() {
    setSaving(true);
    const items = configs
      .filter((c) => c.category === tab)
      .map((c) => ({ key: c.key, value: edits[c.key] ?? c.value }));
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk", items }),
    });
    setSaving(false);
    if (res.ok) { setMsg("✅ Settings saved successfully"); load(); }
    else setMsg("❌ Save failed");
    setTimeout(() => setMsg(""), 3000);
  }

  async function testService(service: string) {
    setTestStatus((s) => ({ ...s, [service]: "testing..." }));
    const res = await fetch("/api/admin/config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service }),
    });
    const data = await res.json();
    setTestStatus((s) => ({ ...s, [service]: data.status === "online" ? "● Online" : "○ Offline" }));
  }

  async function clearKey(key: string) {
    await fetch("/api/admin/config", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
    setEdits((e) => ({ ...e, [key]: "" }));
    load();
  }

  async function addPackage(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pkgForm),
    });
    setPkgForm({ name: "", credits: 100, priceInr: 99 });
    load();
  }

  async function deletePackage(id: string) {
    await fetch("/api/admin/packages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  async function addPromo(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/promos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(promoForm) });
    setPromoForm({ code: "", description: "", discountType: "percent", discountValue: 10, bonusCredits: 0, maxUses: 100 });
    fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || []));
  }

  async function deletePromo(id: string) {
    await fetch("/api/admin/promos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || []));
  }

  const categoryConfigs = configs.filter((c) => c.category === tab);

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030308]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 text-sm font-bold">⚡</span>
            <div>
              <h1 className="text-lg font-bold">Command Center Admin</h1>
              <p className="text-xs text-neutral-500">All settings — no file edits needed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/studio" className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white">← Studio</Link>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        {/* Sidebar */}
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <nav className="space-y-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setTab(c.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  tab === c.id ? "bg-gradient-to-r from-orange-500/20 to-purple-600/20 text-white" : "text-neutral-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{c.icon}</span>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[10px] text-neutral-600">{c.desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setTab(c.id)} className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs ${tab === c.id ? "bg-orange-500/30 text-orange-300" : "bg-white/5 text-neutral-500"}`}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 space-y-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Users", value: stats.users, color: "text-blue-400" },
                { label: "Posts", value: stats.posts, color: "text-pink-400" },
                { label: "Chats", value: stats.conversations, color: "text-purple-400" },
                { label: "Scheduled", value: stats.scheduled, color: "text-orange-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-xs text-neutral-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {msg && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">{msg}</div>}

          {/* Credit Packages tab */}
          {tab === "packages" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
                <h2 className="text-lg font-semibold">Credit Packages</h2>
                <p className="mt-1 text-sm text-neutral-500">Razorpay se credits becho — packages yahan manage karo</p>
                <form onSubmit={addPackage} className="mt-4 grid gap-3 md:grid-cols-4">
                  <input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="Package name" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <input type="number" value={pkgForm.credits} onChange={(e) => setPkgForm({ ...pkgForm, credits: +e.target.value })} placeholder="Credits" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <input type="number" value={pkgForm.priceInr} onChange={(e) => setPkgForm({ ...pkgForm, priceInr: +e.target.value })} placeholder="Price (₹)" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <button type="submit" className="rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-3 text-sm font-semibold">+ Add Package</button>
                </form>
              </div>
              <div className="space-y-3">
                {packages.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-neutral-500">{p.credits} credits · ₹{p.priceInr}</p>
                    </div>
                    <button onClick={() => deletePackage(p.id)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "promos" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
                <h2 className="text-lg font-semibold">Promo Codes & Offers</h2>
                <form onSubmit={addPromo} className="mt-4 grid gap-3 md:grid-cols-3">
                  <input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })} placeholder="CODE" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono uppercase" />
                  <input value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} placeholder="Description" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <select value={promoForm.discountType} onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <option value="percent">Percent off</option>
                    <option value="fixed">Fixed ₹ off</option>
                    <option value="bonus_credits">Bonus credits</option>
                  </select>
                  <input type="number" value={promoForm.discountValue} onChange={(e) => setPromoForm({ ...promoForm, discountValue: +e.target.value })} placeholder="Discount value" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <input type="number" value={promoForm.bonusCredits} onChange={(e) => setPromoForm({ ...promoForm, bonusCredits: +e.target.value })} placeholder="Bonus credits" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <button type="submit" className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold">+ Create Promo</button>
                </form>
              </div>
              <div className="space-y-3">
                {promos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
                    <div>
                      <p className="font-mono font-bold text-orange-400">{p.code}</p>
                      <p className="text-sm text-neutral-500">{p.description} · {p.discountType} {p.discountValue}{p.bonusCredits ? ` +${p.bonusCredits} credits` : ""}</p>
                      <p className="text-xs text-neutral-600">Used {p.usedCount}{p.maxUses ? `/${p.maxUses}` : ""} times</p>
                    </div>
                    <button onClick={() => deletePromo(p.id)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "subscriptions" ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">Subscription plans shown on /pricing page. Seeded on first run.</p>
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
                  <div>
                    <p className="font-semibold">{p.name} {p.popular && <span className="text-xs text-orange-400">Popular</span>}</p>
                    <p className="text-sm text-neutral-500">₹{p.priceInr}/{p.billingPeriod} · {p.creditsPerMonth} credits/mo</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{CATEGORIES.find((c) => c.id === tab)?.name} Settings</h2>
                  <p className="text-sm text-neutral-500">{CATEGORIES.find((c) => c.id === tab)?.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  {TEST_SERVICES.filter((s) => s.category === tab).map((s) => (
                    <button key={s.id} onClick={() => testService(s.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                      Test {s.label} {testStatus[s.id] && <span className="ml-1">{testStatus[s.id]}</span>}
                    </button>
                  ))}
                  <label className="flex items-center gap-2 text-xs text-neutral-500">
                    <input type="checkbox" checked={showSecrets} onChange={(e) => setShowSecrets(e.target.checked)} className="rounded" />
                    Show secrets
                  </label>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {categoryConfigs.map((c) => (
                  <div key={c.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium">{c.label}</label>
                        {c.description && <p className="text-xs text-neutral-600">{c.description}</p>}
                        <p className="mt-0.5 font-mono text-[10px] text-neutral-700">{c.key}</p>
                      </div>
                      {c.isSecret && (
                        <button onClick={() => clearKey(c.key)} className="text-xs text-red-400 hover:underline">Clear</button>
                      )}
                    </div>
                    {c.type === "boolean" ? (
                      <select
                        value={edits[c.key] ?? c.value}
                        onChange={(e) => setEdits({ ...edits, [c.key]: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : c.type === "textarea" ? (
                      <textarea
                        value={edits[c.key] ?? c.value}
                        onChange={(e) => setEdits({ ...edits, [c.key]: e.target.value })}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm"
                      />
                    ) : (
                      <input
                        type={c.isSecret && !showSecrets ? "password" : "text"}
                        value={edits[c.key] ?? c.value}
                        onChange={(e) => setEdits({ ...edits, [c.key]: e.target.value })}
                        placeholder={c.isSecret ? "Paste key here..." : ""}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={saveCategory}
                disabled={saving}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 py-3.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : `Save ${CATEGORIES.find((c) => c.id === tab)?.name} Settings`}
              </button>
            </div>
          )}

          {/* Quick links */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-sm font-semibold text-neutral-400">Quick Reference — OAuth Redirect URLs</h3>
            <div className="mt-3 space-y-2 font-mono text-xs text-neutral-500">
              <p>Meta OAuth: <span className="text-orange-400">{typeof window !== "undefined" ? window.location.origin : ""}/api/instagram/callback</span></p>
              <p>Razorpay Webhook: <span className="text-orange-400">{typeof window !== "undefined" ? window.location.origin : ""}/api/payments/razorpay/webhook</span></p>
              <p>Postiz: Admin → Social → postiz_url + postiz_api_key</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
