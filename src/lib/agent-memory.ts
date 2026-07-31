import { prisma } from "./prisma";

export type MemoryEntry = {
  key: string;
  value: string;
  updatedAt: string;
};

export type ConversationTurn = {
  role: "user" | "assistant" | "system";
  content: string;
};

const MEMORY_PREFIX = "agent_memory:";

/** Load long-term facts the agent remembers about this user */
export async function loadUserMemory(userId: string): Promise<MemoryEntry[]> {
  const rows = await prisma.siteConfig.findMany({
    where: { key: { startsWith: `${MEMORY_PREFIX}${userId}:` } },
  });
  return rows.map((r) => ({
    key: r.key.replace(`${MEMORY_PREFIX}${userId}:`, ""),
    value: r.value,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/** Persist a fact about the user (preferences, brand, style, past decisions) */
export async function saveUserMemory(userId: string, key: string, value: string): Promise<void> {
  const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const fullKey = `${MEMORY_PREFIX}${userId}:${cleanKey}`;
  await prisma.siteConfig.upsert({
    where: { key: fullKey },
    create: {
      key: fullKey,
      value: value.slice(0, 2000),
      category: "agent_memory",
      label: cleanKey,
      description: `Memory for user ${userId}`,
      type: "text",
      isSecret: false,
    },
    update: { value: value.slice(0, 2000) },
  });
}

/** Get or create the active conversation thread for this user */
export async function getOrCreateConversation(userId: string, title?: string) {
  const recent = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
  });

  // Reuse conversation if last message was within 2 hours
  if (recent) {
    const last = recent.messages[recent.messages.length - 1];
    const twoHours = 2 * 60 * 60 * 1000;
    if (last && Date.now() - last.createdAt.getTime() < twoHours) {
      return recent;
    }
  }

  return prisma.conversation.create({
    data: {
      userId,
      title: (title || "Agent session").slice(0, 120),
    },
    include: { messages: true },
  });
}

export async function appendMessage(
  conversationId: string,
  role: string,
  content: string,
  metadata?: object
) {
  await prisma.message.create({
    data: {
      conversationId,
      role,
      content: content.slice(0, 12000),
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

/** Recent turns for context window (Cursor-style chat memory) */
export async function loadRecentTurns(conversationId: string, limit = 12): Promise<ConversationTurn[]> {
  const msgs = await prisma.message.findMany({
    where: { conversationId, role: { in: ["user", "assistant"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return msgs
    .reverse()
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

/** Format memory block for system prompt */
export function formatMemoryForPrompt(entries: MemoryEntry[]): string {
  if (!entries.length) return "No long-term memories yet.";
  return entries.map((e) => `- ${e.key}: ${e.value}`).join("\n");
}

/** Extract memorable facts from a turn via simple heuristics + optional LLM later */
export function extractMemoryCandidates(userMessage: string, intentSummary: string): Array<{ key: string; value: string }> {
  const out: Array<{ key: string; value: string }> = [];
  const brand = userMessage.match(/(?:my|mera|hamara|our)\s+(?:brand|company|business|restaurant|shop|startup)\s+(?:is|hai|:)?\s*["']?([A-Za-z0-9 &.-]{2,40})/i);
  if (brand?.[1]) out.push({ key: "brand_name", value: brand[1].trim() });

  const style = userMessage.match(/(?:style|tone|vibe|look)\s*[:=]?\s*([a-zA-Z ,-]{3,60})/i);
  if (style?.[1]) out.push({ key: "preferred_style", value: style[1].trim() });

  if (intentSummary && !/greeting|casual|conversation/i.test(intentSummary)) {
    out.push({ key: "last_request", value: intentSummary.slice(0, 200) });
  }
  return out;
}

/** Self-reflective log after successful tasks (appends to rolling reflection memory) */
export async function appendReflection(userId: string, note: string): Promise<void> {
  const key = "reflections";
  const existing = await loadUserMemory(userId);
  const prev = existing.find((e) => e.key === key)?.value || "";
  const stamp = new Date().toISOString().slice(0, 16);
  const next = `${prev}\n[${stamp}] ${note}`.trim().slice(-1800);
  await saveUserMemory(userId, key, next);
}
