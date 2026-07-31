"use client";

export function ToolsPanel({
  onGenerate,
  onPublish,
  publishing,
  hasPost,
}: {
  onGenerate: (topic: string) => void;
  onPublish: () => void;
  publishing: boolean;
  hasPost: boolean;
}) {
  const tools = [
    { label: "📝 Caption", topic: "Engaging Instagram caption for my brand" },
    { label: "#️⃣ Hashtags", topic: "20 trending hashtags for digital marketing" },
    { label: "🎯 CTA Post", topic: "Call-to-action post for free consultation" },
    { label: "📊 Tips", topic: "5 quick marketing tips carousel caption" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Quick Tools
      </p>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((t) => (
          <button
            key={t.label}
            onClick={() => onGenerate(t.topic)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10"
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        onClick={onPublish}
        disabled={!hasPost || publishing}
        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
      >
        {publishing ? "Publishing..." : "🚀 Publish Now"}
      </button>
    </div>
  );
}
