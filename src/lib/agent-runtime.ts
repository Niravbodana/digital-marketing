/**
 * Cursor-style agent runtime.
 * Mirrors how Cursor agents work: think → tool actions → observe → plan → act → reply.
 * No emojis. Live action events. Memory-aware.
 */

import { chatComplete, hasAnyLLMKey } from "./ai-router";
import { AGENT_TOOLS, type AgentTool } from "./tools";
import { executeTool, type ToolOutput } from "./tool-executor";
import {
  type ConversationTurn,
  type MemoryEntry,
  formatMemoryForPrompt,
  extractMemoryCandidates,
  saveUserMemory,
} from "./agent-memory";
import { searchWeb } from "./agent-brain";

export type AgentAction =
  | { type: "thinking"; id: string; content: string; status: "running" | "done" }
  | { type: "tool"; id: string; name: string; detail: string; status: "running" | "done" | "error"; result?: string }
  | { type: "plan"; id: string; steps: string[]; reasoning: string; status: "running" | "done" }
  | { type: "memory"; id: string; content: string; status: "running" | "done" }
  | { type: "assistant"; id: string; content: string }
  | { type: "output"; id: string; output: ToolOutput; tool: { id: string; name: string } }
  | { type: "error"; id: string; error: string }
  | { type: "done"; id: string };

export type EmitFn = (action: AgentAction) => void;

const SYSTEM_IDENTITY = `You are Bodana Agent — an autonomous AI coding/creation agent modeled after Cursor Agent and ChatGPT reasoning.

HOW YOU WORK (exactly like Cursor):
1. THINK first — silently reason about what the user needs, constraints, gaps.
2. RECALL memory — use known facts about this user/brand before asking again.
3. SEARCH when facts are missing or the request needs current info.
4. PLAN — list concrete steps before creating anything.
5. ACT — pick one best capability and execute carefully.
6. REPLY — clear, direct, no fluff. Match the user's language (Hindi/English/Hinglish).

STRICT RULES:
- Never use emojis.
- Never invent fake completion — say what you are doing.
- Prefer understanding the full requirement before creating.
- If the request is ambiguous, state your assumption and proceed with the best interpretation.
- Be specific. Avoid generic stock outputs.`;

function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function guessType(prompt: string): string {
  const l = prompt.toLowerCase();
  if (/image|logo|photo|thumbnail|banner|poster|graphic|design|art/i.test(l)) return "image";
  if (/video|reel|trailer|commercial|ugc|clip/i.test(l)) return "video";
  if (/song|music|voice|audio|podcast|tts/i.test(l)) return "audio";
  if (/code|python|react|website|app|api|html|script/i.test(l)) return "code";
  if (/excel|csv|spreadsheet|sheet/i.test(l)) return "spreadsheet";
  if (/document|report|book|deck|pdf|proposal|ppt/i.test(l)) return "document";
  return "text";
}

function pickTool(type: string, toolId?: string): AgentTool {
  if (toolId) {
    const t = AGENT_TOOLS.find((x) => x.id === toolId);
    if (t) return t;
  }
  return AGENT_TOOLS.find((t) => t.outputType === type) || AGENT_TOOLS[0];
}

type ThinkResult = {
  summary: string;
  deliverableType: string;
  tone: string;
  audience: string;
  keyRequirements: string[];
  needsWebResearch: boolean;
  researchQuery: string;
  suggestedApproach: string;
  replyToUser: string;
  thinkingTrace: string;
  assumptions: string[];
};

async function think(
  prompt: string,
  memory: MemoryEntry[],
  history: ConversationTurn[]
): Promise<ThinkResult> {
  const fallback: ThinkResult = {
    summary: prompt.slice(0, 200),
    deliverableType: guessType(prompt),
    tone: "professional",
    audience: "general",
    keyRequirements: [prompt.slice(0, 100)],
    needsWebResearch: /latest|current|today|news|trend|price|research/i.test(prompt),
    researchQuery: /latest|current|today|news|trend|price|research/i.test(prompt) ? prompt.slice(0, 80) : "",
    suggestedApproach: "Understand request, then generate the deliverable.",
    replyToUser: stripEmojis(`Got it. Working on: ${prompt.slice(0, 100)}`),
    thinkingTrace: "Parsing the request.\nChecking what output type fits.\nDeciding whether research is needed.",
    assumptions: [],
  };

  if (!(await hasAnyLLMKey())) return fallback;

  const historyBlock = history
    .slice(-8)
    .map((t) => `${t.role}: ${t.content.slice(0, 400)}`)
    .join("\n");

  try {
    const result = await chatComplete(
      [
        {
          role: "system",
          content: `${SYSTEM_IDENTITY}

You are in THINKING mode. Analyze deeply before acting.

Return ONLY valid JSON (no markdown):
{
  "summary": "one sentence of what user wants",
  "deliverableType": "image|video|audio|document|code|spreadsheet|text",
  "tone": "tone/style",
  "audience": "who it's for",
  "keyRequirements": ["req1","req2"],
  "needsWebResearch": true/false,
  "researchQuery": "query or empty",
  "suggestedApproach": "how you will execute",
  "replyToUser": "2-3 sentences acknowledging in user's language. NO EMOJIS.",
  "thinkingTrace": "first-person reasoning: what you notice, what is unclear, what you will do. 4-8 short lines.",
  "assumptions": ["assumption if any"]
}

Long-term memory about this user:
${formatMemoryForPrompt(memory)}

Recent conversation:
${historyBlock || "(new session)"}`,
        },
        { role: "user", content: prompt },
      ],
      { timeoutMs: 45000 }
    );

    const raw = result.content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(raw);
    return {
      summary: String(parsed.summary || fallback.summary),
      deliverableType: String(parsed.deliverableType || fallback.deliverableType),
      tone: String(parsed.tone || "professional"),
      audience: String(parsed.audience || "general"),
      keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements.map(String) : [],
      needsWebResearch: Boolean(parsed.needsWebResearch),
      researchQuery: String(parsed.researchQuery || ""),
      suggestedApproach: String(parsed.suggestedApproach || ""),
      replyToUser: stripEmojis(String(parsed.replyToUser || fallback.replyToUser)),
      thinkingTrace: stripEmojis(String(parsed.thinkingTrace || fallback.thinkingTrace)),
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map(String) : [],
    };
  } catch {
    return fallback;
  }
}

async function plan(
  prompt: string,
  thinkResult: ThinkResult,
  research: string
): Promise<{ steps: string[]; selectedToolId: string; selectedToolName: string; reasoning: string }> {
  const toolList = AGENT_TOOLS.map((t) => `${t.id}: ${t.name} [${t.outputType}] — ${t.description}`).join("\n");
  const fallbackTool = pickTool(thinkResult.deliverableType);

  if (await hasAnyLLMKey()) {
    try {
      const result = await chatComplete(
        [
          {
            role: "system",
            content: `${SYSTEM_IDENTITY}

You are in PLANNING mode — like Cursor writing a todo list before coding.

Return ONLY JSON:
{
  "steps": ["step1","step2","step3"],
  "selectedToolId": "exact id from tool list",
  "selectedToolName": "name",
  "reasoning": "why this tool and approach — no emojis"
}

Tools:
${toolList}`,
          },
          {
            role: "user",
            content: `Request: ${prompt}\n\nThink: ${JSON.stringify(thinkResult)}\n\nResearch:\n${research || "none"}`,
          },
        ],
        { timeoutMs: 35000 }
      );
      const raw = result.content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(raw);
      const tool =
        AGENT_TOOLS.find((t) => t.id === parsed.selectedToolId) ||
        AGENT_TOOLS.find((t) => String(parsed.selectedToolId || "").includes(t.id)) ||
        fallbackTool;
      return {
        steps: Array.isArray(parsed.steps) ? parsed.steps.map((s: unknown) => stripEmojis(String(s))) : ["Analyze", "Generate", "Deliver"],
        selectedToolId: tool.id,
        selectedToolName: tool.name,
        reasoning: stripEmojis(String(parsed.reasoning || tool.description)),
      };
    } catch {
      // fall through
    }
  }

  return {
    steps: [
      `Understand: ${thinkResult.summary}`,
      thinkResult.needsWebResearch ? `Research: ${thinkResult.researchQuery || "context"}` : "Use prompt + memory context",
      `Generate with ${fallbackTool.name}`,
      "Deliver finished output",
    ],
    selectedToolId: fallbackTool.id,
    selectedToolName: fallbackTool.name,
    reasoning: `Selected ${fallbackTool.name} for ${thinkResult.deliverableType} output.`,
  };
}

export type RuntimeInput = {
  userId: string;
  prompt: string;
  toolId?: string;
  memory: MemoryEntry[];
  history: ConversationTurn[];
  emit: EmitFn;
};

export type RuntimeResult = {
  think: ThinkResult;
  research: string;
  plan: { steps: string[]; selectedToolId: string; selectedToolName: string; reasoning: string };
  tool: AgentTool;
  output: ToolOutput;
  memoriesSaved: Array<{ key: string; value: string }>;
};

/** Full Cursor-style agent loop with live action emissions */
export async function runAgentLoop(input: RuntimeInput): Promise<RuntimeResult> {
  const { prompt, toolId, memory, history, emit, userId } = input;

  // 1. Memory recall (live action)
  const memId = uid("memory");
  emit({
    type: "memory",
    id: memId,
    content: memory.length
      ? `Recalling ${memory.length} facts about you…\n${formatMemoryForPrompt(memory)}`
      : "No prior memory for this user — starting fresh session.",
    status: "running",
  });
  emit({
    type: "memory",
    id: memId,
    content: memory.length
      ? `Loaded ${memory.length} memories.\n${formatMemoryForPrompt(memory)}`
      : "No prior memory — will learn preferences as we go.",
    status: "done",
  });

  // 2. Thinking (live action — like Cursor thinking block)
  const thinkId = uid("thinking");
  emit({
    type: "thinking",
    id: thinkId,
    content: "Reading your message.\nChecking conversation history.\nIdentifying requirements and gaps…",
    status: "running",
  });

  const thinkResult = await think(prompt, memory, history);
  emit({
    type: "thinking",
    id: thinkId,
    content: thinkResult.thinkingTrace + (thinkResult.assumptions.length ? `\n\nAssumptions:\n${thinkResult.assumptions.map((a) => `- ${a}`).join("\n")}` : ""),
    status: "done",
  });

  emit({
    type: "assistant",
    id: uid("assistant"),
    content: thinkResult.replyToUser,
  });

  // 3. Web search tool (if needed) — Cursor-style tool call card
  let research = "";
  if (thinkResult.needsWebResearch && thinkResult.researchQuery) {
    const searchId = uid("tool-search");
    emit({
      type: "tool",
      id: searchId,
      name: "WebSearch",
      detail: thinkResult.researchQuery,
      status: "running",
    });
    research = await searchWeb(thinkResult.researchQuery);
    emit({
      type: "tool",
      id: searchId,
      name: "WebSearch",
      detail: thinkResult.researchQuery,
      status: research ? "done" : "done",
      result: research || "No live results — using model knowledge.",
    });
  }

  // 4. Planning (like Cursor todos)
  const planId = uid("plan");
  emit({
    type: "plan",
    id: planId,
    steps: ["Building execution plan…"],
    reasoning: "Selecting the best capability for this request.",
    status: "running",
  });
  const planResult = await plan(prompt, thinkResult, research);
  emit({
    type: "plan",
    id: planId,
    steps: planResult.steps,
    reasoning: planResult.reasoning,
    status: "done",
  });

  const tool = pickTool(thinkResult.deliverableType, toolId || planResult.selectedToolId);

  // 5. Create (tool execution — live)
  const createId = uid("tool-create");
  emit({
    type: "tool",
    id: createId,
    name: tool.name,
    detail: `Executing ${tool.id} · ${tool.outputType}`,
    status: "running",
  });

  const output = await executeTool(tool, prompt, {
    intent: {
      summary: thinkResult.summary,
      deliverableType: thinkResult.deliverableType,
      tone: thinkResult.tone,
      audience: thinkResult.audience,
      keyRequirements: thinkResult.keyRequirements,
      needsWebResearch: thinkResult.needsWebResearch,
      researchQuery: thinkResult.researchQuery,
      suggestedApproach: thinkResult.suggestedApproach,
      replyToUser: thinkResult.replyToUser,
      thinkingTrace: thinkResult.thinkingTrace,
    },
    research,
    plan: planResult,
  });

  emit({
    type: "tool",
    id: createId,
    name: tool.name,
    detail: `Executing ${tool.id} · ${tool.outputType}`,
    status: "done",
    result: `Created: ${output.title} (${output.downloadName})`,
  });

  emit({
    type: "output",
    id: uid("output"),
    output,
    tool: { id: tool.id, name: tool.name },
  });

  // 6. Save memories (like my memory of the user)
  const candidates = extractMemoryCandidates(prompt, thinkResult.summary);
  for (const c of candidates) {
    await saveUserMemory(userId, c.key, c.value);
  }
  if (thinkResult.tone) await saveUserMemory(userId, "preferred_tone", thinkResult.tone);
  if (thinkResult.deliverableType) await saveUserMemory(userId, "last_deliverable_type", thinkResult.deliverableType);

  emit({
    type: "assistant",
    id: uid("assistant-final"),
    content: stripEmojis(
      `Done. Delivered via ${tool.name}.\n` +
        (thinkResult.assumptions.length ? `I assumed: ${thinkResult.assumptions.join("; ")}. Tell me if that is wrong and I will revise.` : "Say what to change and I will refine it.")
    ),
  });

  emit({ type: "done", id: uid("done") });

  return {
    think: thinkResult,
    research,
    plan: planResult,
    tool,
    output,
    memoriesSaved: candidates,
  };
}
