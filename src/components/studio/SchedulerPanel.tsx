"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  platform: string;
  scheduledAt: string;
  status: string;
  payload: string;
};

export function SchedulerPanel({ postId, caption }: { postId?: string; caption?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [platform, setPlatform] = useState("instagram");
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/scheduler");
    const data = await res.json();
    setJobs(data.jobs || []);
  }

  async function schedule() {
    if (!date) { setMsg("Date select karo"); return; }
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    const res = await fetch("/api/scheduler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, platform, scheduledAt, caption }),
    });
    if (res.ok) { setMsg("✅ Scheduled!"); load(); }
    else setMsg("❌ Failed");
    setTimeout(() => setMsg(""), 3000);
  }

  async function cancel(id: string) {
    await fetch("/api/scheduler", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-sm font-semibold">📅 Post Scheduler</h3>
      <p className="text-[10px] text-neutral-600">Posts schedule karo — auto-publish via Postiz/Meta</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs" />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter/X</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>
      <button onClick={schedule} className="mt-3 w-full rounded-lg bg-purple-600/80 py-2 text-xs font-semibold hover:bg-purple-500">Schedule Post</button>
      {msg && <p className="mt-2 text-xs text-emerald-400">{msg}</p>}

      <div className="mt-4 space-y-2">
        {jobs.length === 0 ? (
          <p className="text-xs text-neutral-600">No scheduled posts</p>
        ) : jobs.map((j) => (
          <div key={j.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
            <div>
              <p className="text-xs font-medium capitalize">{j.platform}</p>
              <p className="text-[10px] text-neutral-500">{new Date(j.scheduledAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] ${j.status === "pending" ? "text-yellow-400" : "text-emerald-400"}`}>{j.status}</span>
              <button onClick={() => cancel(j.id)} className="text-[10px] text-red-400">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
