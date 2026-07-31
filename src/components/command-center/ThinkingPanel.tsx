"use client";

export type AgentStep = {
  id: string;
  phase: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

const phaseIcon: Record<string, string> = {
  thinking: "🧠",
  planning: "📋",
  executing: "⚡",
  complete: "✅",
};

const phaseColor: Record<string, string> = {
  thinking: "border-violet-500/40 bg-violet-500/10",
  planning: "border-blue-500/40 bg-blue-500/10",
  executing: "border-amber-500/40 bg-amber-500/10",
  complete: "border-emerald-500/40 bg-emerald-500/10",
};

export function ThinkingPanel({ steps, active }: { steps: AgentStep[]; active: boolean }) {
  if (!steps.length && !active) {
    return (
      <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="flex h-2 w-2 rounded-full bg-slate-600" />
          Agent ready — prompt bhejo to thinking start hogi
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Agent Intelligence</h3>
        {active && (
          <span className="flex items-center gap-1.5 text-xs text-violet-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            Live
          </span>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`rounded-xl border p-3 ${phaseColor[step.phase] || "border-white/10 bg-white/5"}`}
          >
            <div className="flex items-center gap-2">
              <span>{phaseIcon[step.phase] || "•"}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {step.phase}
              </span>
              {step.status === "running" && (
                <span className="ml-auto h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-white">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{step.content}</p>
          </div>
        ))}

        {active && steps.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
            <span className="text-xs text-violet-300">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
