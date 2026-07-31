"use client";

import Link from "next/link";
import { IconAgent, IconCredits, IconSettings, IconUsers } from "@/components/ui/Icons";
import { AGENT_TOOLS } from "@/lib/tools";

export function AgentShell({
  children,
  user,
  agentOnline,
}: {
  children: React.ReactNode;
  user: { name: string; role: string; credits: number } | null;
  agentOnline?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#080808] lg:flex">
        <div className="border-b border-white/[0.06] p-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
              <IconAgent className="text-orange-400" size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Bodana AI</p>
              <p className="text-[10px] text-neutral-500">Unified Agent</p>
            </div>
          </Link>
        </div>

        <div className="border-b border-white/[0.06] p-5">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${agentOnline ? "bg-emerald-400" : "bg-neutral-600"}`} />
              <span className="text-xs font-medium text-neutral-300">
                {agentOnline ? "Agent Online" : "Awaiting API Key"}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
              One agent. All API keys. {AGENT_TOOLS.length} capabilities built in.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <Link href="/credits" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-neutral-400 transition hover:bg-white/[0.04] hover:text-white">
            <IconCredits />
            <span>Credits</span>
            <span className="ml-auto font-medium text-orange-400">{user?.credits ?? 0}</span>
          </Link>
          <Link href="/teams" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-neutral-400 transition hover:bg-white/[0.04] hover:text-white">
            <IconUsers />
            <span>Teams</span>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-neutral-400 transition hover:bg-white/[0.04] hover:text-white">
              <IconSettings />
              <span>Admin & API Keys</span>
            </Link>
          )}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <p className="truncate text-xs font-medium text-neutral-300">{user?.name}</p>
          <p className="text-[10px] text-neutral-600">Single AI workspace</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
