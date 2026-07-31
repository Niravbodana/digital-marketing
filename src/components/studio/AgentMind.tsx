"use client";

export type AgentStep = {
  id: string;
  phase: string;
  title: string;
  content: string;
  status: string;
  order: number;
};

const PHASE_LABEL: Record<string, string> = {
  thinking: "Thinking",
  planning: "Planning",
  executing: "Executing",
  complete: "Complete",
};

export function AgentMind({ steps, active, prompt }: { steps: AgentStep[]; active: boolean; prompt?: string }) {
  const hasActivity = steps.length > 0 || active;

  return (
    <div className="agent-mind relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.04] via-transparent to-purple-600/[0.04]" />
      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">Agent Mind</p>
          {active && (
            <span className="flex items-center gap-2 text-[11px] text-orange-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              Live
            </span>
          )}
        </div>

        {!hasActivity ? (
          <div className="mt-8 flex flex-col items-center py-10 text-center">
            <div className="agent-orb mb-6 h-20 w-20 rounded-full" />
            <p className="text-sm text-neutral-400">Your agent is ready</p>
            <p className="mt-1 max-w-sm text-xs text-neutral-600">
              Type what you want to create — thinking, planning, and execution happen here in one flow.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            {prompt && !steps.length && active && (
              <p className="mb-4 text-center text-sm text-neutral-400">&ldquo;{prompt.slice(0, 120)}{prompt.length > 120 ? "..." : ""}&rdquo;</p>
            )}
            <div className="relative mx-auto max-w-xl">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/50 via-orange-500/50 to-emerald-500/50" />
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const isLast = i === steps.length - 1;
                  const isRunning = step.status === "running";
                  return (
                    <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <div className="relative z-10 mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            step.phase === "complete" ? "bg-emerald-400" :
                            step.phase === "executing" ? "bg-amber-400" :
                            step.phase === "planning" ? "bg-blue-400" :
                            "bg-violet-400"
                          } ${isRunning ? "animate-pulse ring-4 ring-white/10" : ""}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1 pt-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            {PHASE_LABEL[step.phase] || step.phase}
                          </span>
                          {isRunning && (
                            <span className="h-3 w-3 animate-spin rounded-full border border-white/10 border-t-orange-400" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-white">{step.title}</p>
                        {step.content && (
                          <p className="mt-1 text-xs leading-relaxed text-neutral-500">{step.content}</p>
                        )}
                      </div>
                      {!isLast && <div className="hidden" />}
                    </div>
                  );
                })}
                {active && steps.length > 0 && steps.every((s) => s.status !== "running") && (
                  <div className="relative flex gap-4">
                    <div className="relative z-10 mt-1 h-4 w-4 flex-shrink-0">
                      <span className="block h-2.5 w-2.5 animate-pulse rounded-full bg-orange-400" />
                    </div>
                    <p className="text-xs text-orange-300/80">Processing...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
