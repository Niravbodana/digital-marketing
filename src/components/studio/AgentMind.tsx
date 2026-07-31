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

const PHASE_LABEL: Record<string, string> = {
  understand: "Understand",
  thinking: "Understand",
  gather: "Gather",
  planning: "Plan",
  create: "Create",
  executing: "Create",
  deliver: "Deliver",
  complete: "Deliver",
};

export function AgentMind({ steps, active, prompt }: { steps: AgentStep[]; active: boolean; prompt?: string }) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const hasActivity = sorted.length > 0 || active;

  return (
    <div className="agent-mind relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black/30 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] via-transparent to-purple-600/[0.03]" />
      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-500">Agent Mind</p>
          {active ? (
            <span className="flex items-center gap-2 text-[11px] text-orange-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-orange-500" />
              </span>
              Working
            </span>
          ) : sorted.length > 0 ? (
            <span className="text-[11px] text-emerald-400">Complete</span>
          ) : null}
        </div>

        {!hasActivity ? (
          <p className="py-8 text-center text-sm text-neutral-600">
            Thinking, planning, and execution appear here in one continuous flow.
          </p>
        ) : (
          <div className="mt-5">
            {prompt && active && sorted.length <= 1 && (
              <p className="mb-4 text-center text-xs text-neutral-500">&ldquo;{prompt.slice(0, 100)}{prompt.length > 100 ? "…" : ""}&rdquo;</p>
            )}
            <div className="relative mx-auto max-w-lg">
              <div className="absolute left-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-500/40 via-orange-500/40 to-emerald-500/40" />
              <div className="space-y-1">
                {sorted.map((step) => {
                  const isRunning = step.status === "running";
                  return (
                    <div key={step.id} className="relative flex gap-4 py-2">
                      <div className="relative z-10 mt-1.5 flex h-3 w-3 flex-shrink-0 items-center justify-center">
                        <PhaseDot phase={step.phase} />
                        {isRunning && <span className="absolute h-3 w-3 animate-ping rounded-full bg-orange-400/30" />}
                      </div>
                      <div className="min-w-0 flex-1 border-b border-white/[0.04] pb-3 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            {PHASE_LABEL[step.phase] || step.phase}
                          </span>
                          {isRunning && (
                            <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white/10 border-t-orange-400" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-neutral-200">{step.title}</p>
                        {step.content && (
                          <p className="mt-1 text-xs leading-relaxed text-neutral-500">{step.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
