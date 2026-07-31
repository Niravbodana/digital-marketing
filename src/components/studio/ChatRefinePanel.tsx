"use client";

import { useEffect, useRef, useState } from "react";

type Message = { id: string; role: string; content: string };

export function ChatRefinePanel({ initialContent, onApply }: { initialContent?: string; onApply?: (text: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContent && messages.length === 0) {
      setMessages([{ id: "init", role: "assistant", content: `Current content ready to refine:\n\n${initialContent.slice(0, 300)}...` }]);
    }
  }, [initialContent, messages.length]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg, conversationId, title: "Studio Refine" }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.conversation) setConversationId(data.conversation.id);
    if (data.reply) {
      setMessages((m) => [...m, { id: data.message?.id || Date.now().toString(), role: "assistant", content: data.reply }]);
    } else if (data.error) {
      setMessages((m) => [...m, { id: "err", role: "assistant", content: `Error: ${data.error}` }]);
    }
  }

  return (
    <div className="flex h-80 flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold">💬 Chat Refine</h3>
        <p className="text-[10px] text-neutral-600">AI se content improve karo — iterative editing</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-xl px-3 py-2 text-xs ${m.role === "user" ? "ml-8 bg-orange-500/10 text-orange-100" : "mr-8 bg-white/5 text-neutral-300"}`}>
            {m.content}
            {m.role === "assistant" && onApply && (
              <button onClick={() => onApply(m.content)} className="mt-2 block text-[10px] text-orange-400 hover:underline">Apply to output →</button>
            )}
          </div>
        ))}
        {loading && <p className="text-xs text-neutral-500 animate-pulse">Thinking...</p>}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-white/5 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Make it shorter, add emojis, change tone..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
        />
        <button onClick={send} disabled={loading} className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold disabled:opacity-40">Send</button>
      </div>
    </div>
  );
}
