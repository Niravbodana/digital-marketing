"use client";

import { useState } from "react";

export function InstagramConnectModal({
  open,
  onClose,
  onConnect,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConnect: (username: string, password: string) => void;
  loading: boolean;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">📸 Connect Instagram</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Apna Instagram username aur password daalo — full dashboard access milega.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Instagram Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@yourusername"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <button
          onClick={() => onConnect(username.replace("@", ""), password)}
          disabled={!username || !password || loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Connecting..." : "🔐 Connect Account"}
        </button>

        <p className="mt-4 text-center text-[10px] text-slate-600">
          Secured connection · Credentials encrypted · Full access enabled
        </p>
      </div>
    </div>
  );
}
