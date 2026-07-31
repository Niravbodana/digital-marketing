"use client";

import { PhaseDot } from "@/components/ui/Icons";

export type AgentStep = {
  id: string;
  phase: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

const phaseColor: Record<string, string> = {
  thinking: "border-violet-500/30 bg-violet-500/[0.06]",
  planning: "border-blue-500/30 bg-blue-500/[0.06]",
  executing: "border-amber-500/30 bg-amber-500/[0.06]",
  complete: "border-emerald-500/30 bg-emerald-500/[0.06]",
};

export function ThinkingPanel({ steps, active }: { steps: AgentStep[]; active: boolean }) {
  if (!steps.length && !active) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span className="h-2 w-2 rounded-full bg-neutral-600" />
          Agent ready — enter a prompt to begin
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Agent Activity</h3>
        {active && (
          <span className="flex items-center gap-1.5 text-[11px] text-violet-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            Running
          </span>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`rounded-lg border p-3 ${phaseColor[step.phase] || "border-white/[0.06] bg-white/[0.02]"}`}
          >
            <div className="flex items-center gap-2">
              <PhaseDot phase={step.phase} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                {step.phase}
              </span>
              {step.status === "running" && (
                <span className="ml-auto h-3 w-3 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
              )}
            </div>
            <p className="mt-1.5 text-sm font-medium text-neutral-200">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">{step.content}</p>
          </div>
        ))}

        {active && steps.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] p-3">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
            <span className="text-xs text-violet-300">Processing request...</span>
          </div>
        )}
      </div>
    </div>
  );
}
