import Link from "next/link";
import { SiteNav } from "@/components/super/SiteNav";
import { SuperFooter } from "@/components/super/SuperSections";
import { AGENT_TOOLS } from "@/lib/tools";

const CATEGORIES = [
  { id: "image", label: "Image & Design" },
  { id: "video", label: "Video & Motion" },
  { id: "audio", label: "Audio & Voice" },
  { id: "document", label: "Documents" },
  { id: "code", label: "Code & Apps" },
  { id: "text", label: "Copy & Content" },
  { id: "spreadsheet", label: "Data & Spreadsheets" },
] as const;

export default function ToolsPage() {
  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    tools: AGENT_TOOLS.filter((t) => t.outputType === cat.id),
  })).filter((g) => g.tools.length > 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteNav />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl font-bold">{AGENT_TOOLS.length} AI Capabilities</h1>
          <p className="mt-4 text-neutral-500">One unified agent — every creative workflow built in</p>
        </div>
        <div className="mx-auto mt-16 max-w-6xl space-y-12 px-6">
          {byCategory.map(({ id, label, tools }) => (
            <div key={id}>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold">{label}</h2>
                  <p className="text-sm text-neutral-500">{tools.length} capabilities</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => (
                  <Link key={t.id} href="/studio" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20">
                    <p className="font-medium">{t.name}</p>
                    <p className="mt-1 text-xs text-neutral-600">{t.description}</p>
                    <span className="mt-2 inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500 bg-white/5">{t.outputType}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link href="/signup" className="rounded-full bg-white px-10 py-4 text-sm font-bold text-black hover:bg-neutral-200">Open AI Agent</Link>
        </div>
      </main>
      <SuperFooter />
    </div>
  );
}
