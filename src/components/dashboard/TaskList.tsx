"use client";

type Task = {
  id: string;
  title: string;
  prompt: string;
  status: string;
  result?: string | null;
  createdAt: string;
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return (
      <p className="text-sm text-slate-500">Koi task nahi — prompt se shuru karo</p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="rounded-xl border border-white/5 bg-white/5 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t.title}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                t.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : t.status === "running"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {t.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{t.prompt}</p>
          {t.result && (
            <p className="mt-2 text-xs text-indigo-300">{t.result}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
