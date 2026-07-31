import Link from "next/link";
import { SiteNav } from "@/components/super/SiteNav";
import { SuperFooter } from "@/components/super/SuperSections";
import { AGENT_TOOLS, TOOL_STUDIOS } from "@/lib/tools";
import { STUDIOS } from "@/lib/studios";

export default function ToolsPage() {
  const byStudio = TOOL_STUDIOS.map((studio) => ({
    studio,
    info: STUDIOS.find((s) => s.id === studio),
    tools: AGENT_TOOLS.filter((t) => t.studio === studio),
  }));

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteNav />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl font-bold">{AGENT_TOOLS.length} AI Tools</h1>
          <p className="mt-4 text-neutral-500">8 studios · Every creative workflow your business needs</p>
        </div>
        <div className="mx-auto mt-16 max-w-6xl space-y-12 px-6">
          {byStudio.map(({ studio, info, tools }) => (
            <div key={studio}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{info?.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{info?.name || studio}</h2>
                  <p className="text-sm text-neutral-500">{tools.length} tools · {info?.description}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => (
                  <Link key={t.id} href="/studio" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-orange-500/30">
                    <span className="text-xl">{t.icon}</span>
                    <p className="mt-2 font-medium">{t.name}</p>
                    <p className="text-xs text-neutral-600">{t.description}</p>
                    <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-neutral-500">{t.outputType}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link href="/signup" className="rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-10 py-4 text-sm font-bold">Try All Tools Free →</Link>
        </div>
      </main>
      <SuperFooter />
    </div>
  );
}
