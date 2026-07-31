"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Team = { id: string; name: string; slug: string; members: Array<{ id: string; name: string; email: string; role: string }> };

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
    load();
  }, [router]);

  async function load() {
    const res = await fetch("/api/teams");
    const data = await res.json();
    setTeams(data.teams || []);
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold">👥 Teams</h1>
          <Link href="/studio" className="text-sm text-orange-400 hover:underline">← Studio</Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <p className="text-sm text-neutral-500">Welcome {user?.name}. Create teams for collaborative content creation.</p>
        <form onSubmit={createTeam} className="flex gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" required className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm" />
          <button type="submit" className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold">Create Team</button>
        </form>
        <div className="space-y-4">
          {teams.map((t) => (
            <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-xs text-neutral-600">{t.slug} · {t.members.length} members</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.members.map((m) => (
                  <span key={m.id} className="rounded-full bg-white/5 px-3 py-1 text-xs">{m.name} ({m.role})</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
