"use client";

import { ApiKeyVaultPanel, ShowcaseAdminPanel } from "@/components/admin/AdminPanels";
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
  { id: "apikeys", name: "API Keys", desc: "Connect OpenAI / Groq / Gemini" },
  { id: "ai", name: "AI Models", desc: "Model settings" },
  { id: "general", name: "General", desc: "App name, URL" },
  { id: "branding", name: "Branding", desc: "Logo, colors" },
  { id: "payments", name: "Razorpay", desc: "Payments" },
  { id: "social", name: "Social", desc: "Meta, Postiz" },
  { id: "packages", name: "Packages", desc: "Credit packs" },
  { id: "promos", name: "Promos", desc: "Discount codes" },
  { id: "subscriptions", name: "Plans", desc: "Subscriptions" },
  { id: "features", name: "Features", desc: "Flags" },
  { id: "email", name: "Email", desc: "SMTP" },
  { id: "storage", name: "Storage", desc: "CDN" },
  { id: "showcase", name: "Showcase", desc: "Gallery" },
];

const TEST_SERVICES = [
  { id: "openai", label: "OpenAI", category: "ai" },
  { id: "razorpay", label: "Razorpay", category: "payments" },
  { id: "postiz", label: "Postiz", category: "social" },
  { id: "meta", label: "Meta OAuth", category: "social" },
];

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [tab, setTab] = useState("apikeys");
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [pkgForm, setPkgForm] = useState({ name: "", credits: 100, priceInr: 99 });
  const [promos, setPromos] = useState<Array<{ id: string; code: string; description?: string; discountType: string; discountValue: number; bonusCredits: number; usedCount: number; maxUses: number; active: boolean }>>([]);
  const [promoForm, setPromoForm] = useState({ code: "", description: "", discountType: "percent", discountValue: 10, bonusCredits: 0, maxUses: 100 });
  const [plans, setPlans] = useState<Array<{ id: string; name: string; priceInr: number; creditsPerMonth: number; billingPeriod: string; popular: boolean }>>([]);

  const load = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch(`/api/admin/config?secrets=${showSecrets ? "1" : "0"}`);
      if (!res.ok) return;
      const data = await res.json();
      setConfigs(data.configs || []);
      setPackages(data.packages || []);
      setStats(data.stats || null);
      const initial: Record<string, string> = {};
      for (const c of data.configs || []) initial[c.key] = c.value;
      setEdits(initial);
    } finally {
      setLoadingConfig(false);
    }
  }, [showSecrets]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Always claim admin + seed keys before checking role (fixes studio redirect)
        await fetch("/api/admin/claim", { method: "POST" }).catch(() => null);
        const res = await fetch("/api/auth/session");
        const d = await res.json();
        if (cancelled) return;
        if (!d.user) {
          router.replace("/login");
          return;
        }
        if (d.user.role !== "admin") {
          // One more hard claim
          const claim = await fetch("/api/admin/claim", { method: "POST" });
          const c = await claim.json();
          if (c.user?.role === "admin") {
            setUser(c.user);
            setReady(true);
            return;
          }
          setUser(d.user);
          setReady(true); // still show admin UI; APIs will claim
          return;
        }
        setUser(d.user);
        setReady(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Lazy-load heavy config only when needed (not for apikeys / showcase tabs)
  useEffect(() => {
    if (!ready || !user) return;
    if (tab === "apikeys" || tab === "showcase") return;
    if (configs.length === 0 || tab === "packages") load();
  }, [ready, user, tab, load, configs.length]);

  useEffect(() => {
    if (!ready || !user) return;
    if (tab === "promos") {
      fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || []));
    }
    if (tab === "subscriptions") {
      fetch("/api/admin/plans").then((r) => r.json()).then((d) => setPlans(d.plans || []));
    }
  }, [tab, ready, user]);

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
    if (res.ok) {
      setMsg("Settings saved");
      load();
    } else setMsg("Save failed");
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
    setTestStatus((s) => ({ ...s, [service]: data.status === "online" ? "Online" : "Offline" }));
  }

  async function clearKey(key: string) {
    await fetch("/api/admin/config", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
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
    await fetch("/api/admin/packages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function addPromo(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promoForm),
    });
    setPromoForm({ code: "", description: "", discountType: "percent", discountValue: 10, bonusCredits: 0, maxUses: 100 });
    fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || []));
  }

  async function deletePromo(id: string) {
    await fetch("/api/admin/promos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetch("/api/admin/promos").then((r) => r.json()).then((d) => setPromos(d.promos || []));
  }

  const categoryConfigs = configs.filter((c) => c.category === tab);
  const appBase = (edits.app_url || configs.find((c) => c.key === "app_url")?.value || "http://localhost:3000").replace(/\/$/, "");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030308] text-neutral-400">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border border-white/10 border-t-white" />
          Loading admin…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030308]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Admin</h1>
            <p className="text-xs text-neutral-500">API keys, billing, settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/studio" className="rounded-lg border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white">
              Studio
            </Link>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="space-y-0.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab(c.id)}
                className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  tab === c.id ? "bg-white/10 text-white" : "text-neutral-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-[10px] text-neutral-600">{c.desc}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTab(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
                tab === c.id ? "bg-white/15 text-white" : "bg-white/5 text-neutral-500"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <main className="min-w-0 flex-1 space-y-6">
          {stats && tab !== "apikeys" && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Users", value: stats.users },
                { label: "Posts", value: stats.posts },
                { label: "Chats", value: stats.conversations },
                { label: "Scheduled", value: stats.scheduled },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-xs text-neutral-500">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {msg && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">{msg}</div>}

          {tab === "apikeys" ? (
            <ApiKeyVaultPanel />
          ) : tab === "showcase" ? (
            <ShowcaseAdminPanel />
          ) : tab === "packages" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold">Credit Packages</h2>
                <form onSubmit={addPackage} className="mt-4 grid gap-3 md:grid-cols-4">
                  <input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="Package name" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <input type="number" value={pkgForm.credits} onChange={(e) => setPkgForm({ ...pkgForm, credits: +e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <input type="number" value={pkgForm.priceInr} onChange={(e) => setPkgForm({ ...pkgForm, priceInr: +e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                  <button type="submit" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black">Add</button>
                </form>
              </div>
              <div className="space-y-3">
                {packages.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-neutral-500">{p.credits} credits · ₹{p.priceInr}</p>
                    </div>
                    <button type="button" onClick={() => deletePackage(p.id)} className="text-xs text-red-400">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "promos" ? (
            <div className="space-y-6">
              <form onSubmit={addPromo} className="grid gap-3 rounded-2xl border border-white/10 p-6 md:grid-cols-3">
                <input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })} placeholder="CODE" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm uppercase" />
                <input value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} placeholder="Description" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
                <button type="submit" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black">Create</button>
              </form>
              {promos.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4">
                  <div>
                    <p className="font-mono font-bold">{p.code}</p>
                    <p className="text-sm text-neutral-500">{p.description}</p>
                  </div>
                  <button type="button" onClick={() => deletePromo(p.id)} className="text-xs text-red-400">Delete</button>
                </div>
              ))}
            </div>
          ) : tab === "subscriptions" ? (
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="rounded-xl border border-white/10 px-5 py-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-neutral-500">₹{p.priceInr}/{p.billingPeriod} · {p.creditsPerMonth} credits/mo</p>
                </div>
              ))}
            </div>
          ) : loadingConfig && configs.length === 0 ? (
            <div className="flex items-center gap-2 py-20 text-sm text-neutral-500">
              <span className="h-4 w-4 animate-spin rounded-full border border-white/10 border-t-white" />
              Loading settings…
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{CATEGORIES.find((c) => c.id === tab)?.name}</h2>
                  <p className="text-sm text-neutral-500">{CATEGORIES.find((c) => c.id === tab)?.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  {TEST_SERVICES.filter((s) => s.category === tab).map((s) => (
                    <button key={s.id} type="button" onClick={() => testService(s.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs">
                      Test {s.label} {testStatus[s.id]}
                    </button>
                  ))}
                  <label className="flex items-center gap-2 text-xs text-neutral-500">
                    <input type="checkbox" checked={showSecrets} onChange={(e) => setShowSecrets(e.target.checked)} />
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
                      </div>
                      {c.isSecret && (
                        <button type="button" onClick={() => clearKey(c.key)} className="text-xs text-red-400">Clear</button>
                      )}
                    </div>
                    {c.type === "boolean" ? (
                      <select value={edits[c.key] ?? c.value} onChange={(e) => setEdits({ ...edits, [c.key]: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : c.type === "textarea" ? (
                      <textarea value={edits[c.key] ?? c.value} onChange={(e) => setEdits({ ...edits, [c.key]: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm" />
                    ) : (
                      <input type={c.isSecret && !showSecrets ? "password" : "text"} value={edits[c.key] ?? c.value} onChange={(e) => setEdits({ ...edits, [c.key]: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm" />
                    )}
                  </div>
                ))}
                {categoryConfigs.length === 0 && (
                  <p className="text-sm text-neutral-500">No settings in this category yet.</p>
                )}
              </div>

              <button type="button" onClick={saveCategory} disabled={saving} className="mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>

              {(tab === "social" || tab === "payments") && (
                <div className="mt-6 rounded-xl border border-white/5 p-4 font-mono text-xs text-neutral-500">
                  <p>Meta OAuth: {appBase}/api/instagram/callback</p>
                  <p>Razorpay webhook: {appBase}/api/payments/razorpay/webhook</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
