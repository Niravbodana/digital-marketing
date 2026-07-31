"use client";

import { useEffect, useState } from "react";

type ApiKey = {
  id: string; provider: string; label: string; keyValue: string;
  status: string; priority: number; isActive: boolean; isCustom: boolean;
  endpoint?: string; lastCheck?: string;
};

type Provider = { id: string; name: string; icon: string };

export function ApiKeyVaultPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState({ total: 0, online: 0, active: 0 });
  const [form, setForm] = useState({ provider: "openai", label: "", keyValue: "", priority: 10, endpoint: "", isCustom: false });
  const [smartKey, setSmartKey] = useState("");
  const [smartLoading, setSmartLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/api-keys")
      .then((r) => r.json())
      .then((d) => {
        setKeys(d.keys || []);
        setProviders(d.providers || []);
        setStats(d.stats || { total: 0, online: 0, active: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function addKey(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(data.test?.status === "online" ? `${form.label} — ONLINE` : `${form.label} saved — ${data.test?.message || "test pending"}`);
    setForm({ provider: "openai", label: "", keyValue: "", priority: 10, endpoint: "", isCustom: false });
    load();
  }

  async function testKey(id: string) {
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test", id }),
    });
    const data = await res.json();
    setMsg(data.status === "online" ? "Key is online" : data.message || "Offline");
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    load();
  }

  async function deleteKey(id: string) {
    await fetch("/api/admin/api-keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  async function smartAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = smartKey.trim();
    if (!trimmed) return;
    setSmartLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "smart-add", keyValue: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to connect key");
      } else {
        setMsg(`${String(data.provider || "").toUpperCase()} connected · Model: ${data.model} · ${data.message}`);
        setSmartKey("");
      }
      load();
    } catch {
      setMsg("Connection failed — try again");
    } finally {
      setSmartLoading(false);
    }
  }

  const realKeys = keys.filter((k) => k.keyValue && k.keyValue.length > 3);
  const grouped = providers.map((p) => ({
    ...p,
    keys: realKeys.filter((k) => k.provider === p.id),
  })).filter((g) => g.keys.length > 0 || ["openai", "groq", "google", "anthropic"].includes(g.id));

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border border-white/10 border-t-white" />
        Loading keys…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Keys", value: stats.total },
          { label: "Online", value: stats.online },
          { label: "Active", value: stats.active },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {msg && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">{msg}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold">Quick Connect</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Paste OpenAI, Groq, Gemini, or Claude key. Provider auto-detects. Multiple keys = failover.
        </p>
        <form onSubmit={smartAdd} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={smartKey}
            onChange={(e) => setSmartKey(e.target.value)}
            placeholder="sk-... / gsk_... / AIza... / sk-ant-..."
            type="password"
            disabled={smartLoading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={smartLoading || !smartKey.trim()}
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-40"
          >
            {smartLoading ? "Connecting…" : "Connect"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 p-6">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex w-full items-center justify-between text-left">
          <div>
            <h2 className="text-lg font-semibold">Advanced</h2>
            <p className="mt-1 text-sm text-neutral-500">Custom provider, label, priority</p>
          </div>
          <span className="text-neutral-500">{showAdvanced ? "Hide" : "Show"}</span>
        </button>
        {showAdvanced && (
          <form onSubmit={addKey} className="mt-4 grid gap-3 md:grid-cols-2">
            <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value, isCustom: e.target.value === "custom" })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
            <input value={form.keyValue} onChange={(e) => setForm({ ...form, keyValue: e.target.value })} placeholder="API key" required type="password" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm md:col-span-2" />
            {form.isCustom && <input value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="Custom endpoint" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm md:col-span-2" />}
            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: +e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
            <button type="submit" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black">Add & Test</button>
          </form>
        )}
      </div>

      {grouped.map((group) => (
        <div key={group.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="font-semibold">{group.name} <span className="text-xs text-neutral-600">({group.keys.length})</span></h3>
          {group.keys.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-600">No keys yet</p>
          ) : (
            <div className="mt-3 space-y-2">
              {group.keys.map((k) => (
                <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{k.label}</p>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${k.status === "online" ? "bg-emerald-500/15 text-emerald-400" : k.status === "exhausted" ? "bg-amber-500/15 text-amber-400" : k.status === "offline" ? "bg-red-500/15 text-red-400" : "bg-neutral-500/15 text-neutral-500"}`}>
                        {k.status}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-neutral-600">
                      {showKey[k.id] ? k.keyValue : "••••" + (k.keyValue.slice(-4) || "")}
                      {" · "}P{k.priority}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowKey({ ...showKey, [k.id]: !showKey[k.id] })} className="rounded-lg border border-white/10 px-2 py-1 text-[10px]">Show</button>
                    <button type="button" onClick={() => testKey(k.id)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px]">Test</button>
                    <button type="button" onClick={() => toggleActive(k.id, k.isActive)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px]">{k.isActive ? "Disable" : "Enable"}</button>
                    <button type="button" onClick={() => deleteKey(k.id)} className="rounded-lg border border-red-500/30 px-2 py-1 text-[10px] text-red-400">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ShowcaseAdminPanel() {
  const [items, setItems] = useState<Array<{ id: string; type: string; title: string; subtitle?: string; mediaUrl: string; category: string; badge?: string }>>([]);
  const [form, setForm] = useState({ type: "image", title: "", subtitle: "", mediaUrl: "", category: "gallery", badge: "" });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/showcase").then((r) => r.json()).then((d) => setItems(d.items || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/showcase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ type: "image", title: "", subtitle: "", mediaUrl: "", category: "gallery", badge: "" });
    load();
  }

  async function del(id: string) {
    await fetch("/api/showcase", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  if (loading) {
    return <div className="py-16 text-sm text-neutral-500">Loading showcase…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold">Add Showcase Media</h2>
        <form onSubmit={add} className="mt-4 grid gap-3 md:grid-cols-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="testimonial">Testimonial</option>
          </select>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <option value="hero">Hero</option>
            <option value="gallery">Gallery</option>
            <option value="ad">Ad</option>
            <option value="testimonial">Testimonial</option>
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
          <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
          <input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="Media URL" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm md:col-span-2" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm md:col-span-2" />
          <button type="submit" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black md:col-span-2">Add</button>
        </form>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-white/10">
            {item.type === "video" ? (
              <video src={item.mediaUrl} className="aspect-video w-full object-cover" muted preload="none" />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.mediaUrl} alt={item.title} className="aspect-video w-full object-cover" loading="lazy" />
            )}
            <div className="flex justify-between p-3">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[10px] text-neutral-600">{item.category}</p>
              </div>
              <button type="button" onClick={() => del(item.id)} className="text-xs text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
