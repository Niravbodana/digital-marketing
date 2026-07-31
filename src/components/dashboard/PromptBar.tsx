"use client";

import { useState } from "react";

const SUGGESTIONS = [
  "Instagram ke liye fitness tips post banao",
  "Kal subah 10 baje motivational post schedule karo",
  "Digital marketing ke 20 hashtags generate karo",
  "Mere Instagram account connect karo",
  "Latest post publish karo",
];

export function PromptBar({
  onSubmit,
  loading,
}: {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmit(prompt.trim());
    setPrompt("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Kuch bhi bolo... jaise: 'Instagram par brand launch post banao'"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? "..." : "Start"}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSubmit(s)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 transition hover:border-indigo-500/50 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
