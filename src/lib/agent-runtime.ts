/**
 * Autonomous AI Agent runtime — professional Cursor-grade loop.
 * Identity from system architecture prompt. Chat vs create gating.
 * No emojis. Live actions. Persistent memory.
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
  appendReflection,
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
  | { type: "done"; id: string; created: boolean };

export type EmitFn = (action: AgentAction) => void;

export const AGENT_IDENTITY = `# IDENTITY & CORE ARCHITECTURE
You are an Autonomous AI Agent equipped with self-directed web execution, persistent system-level memory, and deep step-by-step reasoning capabilities.

## 1. AUTONOMOUS INTERNET EXECUTION LOOP
When presented with a prompt, query, or technical challenge, DO NOT rely solely on static training weights. Execute:
1. SEARCH & DISCOVER — precise web queries for live docs, APIs, real-time updates.
2. VERIFY & VALIDATE — cross-examine across multiple reliable sources.
3. EXECUTE & RETRY — on failure, parse errors, search solutions, adjust, re-execute.

## 2. SYSTEM-LEVEL MEMORY MANAGEMENT
- EPISODIC MEMORY: save preferences, project context, past decisions.
- SELF-REFLECTIVE LOGGING: after successful tasks, summarize learnings into long-term memory.
- MEMORY RECALL: before any new task, query memory first.

## 3. DEEP THINKING & REASONING
Before acting:
- Deconstruct the request into explicit sub-tasks.
- Trace execution in an inner monologue.
- Identify dependencies (APIs, tools, missing info).

## 4. EXECUTION RULES
- Never give up on first failure.
- Keep state clean.
- Output production-ready results.
- NEVER use emojis.
- CRITICAL: If the user is only greeting, chatting, asking a question, or clarifying — DO NOT create files or run creation tools. Reply conversationally and wait for a real creation request.
- Only create when the user clearly asks for a deliverable (image, video, ad copy, document, code, etc.).
- Match the user's language (Hindi / English / Hinglish).
- Be professional, direct, and human — not a template bot.`;

function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Detect greetings / chat that must NOT trigger creation */
export function isCasualChat(prompt: string): boolean {
  const t = prompt.trim().toLowerCase();
  if (t.length <= 2) return true;
  if (/^(hi|hii|hiii|hello|hey|yo|sup|namaste|namaskar|hola|good\s*(morning|evening|afternoon)|kaise\s*ho|kya\s*haal|whats?\s*up|how\s*are\s*you)[\s!.?]*$/i.test(t)) {
    return true;
  }
  if (/^(thanks|thank\s*you|ok|okay|haan|han|yes|no|nahi|cool|great|nice|awesome)[\s!.?]*$/i.test(t)) {
    return true;
  }
  // Very short with no creation verbs
  if (t.length < 12 && !/\b(create|make|generate|write|design|build|banao|likho|image|video|logo|ad|post|code|document)\b/i.test(t)) {
    return true;
  }
  return false;
}

function looksLikeCreationRequest(prompt: string): boolean {
  return /\b(create|make|generate|write|design|build|banao|banaiye|likho|draft|produce|draw|compose|edit|fix|improve|image|logo|video|reel|ad|caption|post|document|report|code|website|script|song|voice)\b/i.test(
    prompt
  );
}

function guessType(prompt: string): string {
  const l = prompt.toLowerCase();
  if (/image|logo|photo|thumbnail|banner|poster|graphic|design|art/i.test(l)) return "image";
  if (/video|reel|trailer|commercial|ugc|clip/i.test(l)) return "video";
  if (/song|music|voice|audio|podcast|tts/i.test(l)) return "audio";
  if (/code|python|react|website|app|api|html|script/i.test(l)) return "code";
  if (/excel|csv|spreadsheet|sheet/i.test(l)) return "spreadsheet";
  if (/document|report|book|deck|pdf|proposal|ppt/i.test(l)) return "document";
  if (/ad|caption|copy|post|hashtag|email|linkedin/i.test(l)) return "text";
  return "text";
}

function pickTool(type: string, toolId?: string): AgentTool {
  if (toolId) {
    const t = AGENT_TOOLS.find((x) => x.id === toolId);
    if (t) return t;
  }
  // Prefer a sensible default per type — never blindly first tool in list
  const preferred: Record<string, string[]> = {
    image: ["creator-images-0", "creator-images-1"],
    video: [],
    audio: [],
    code: [],
    document: [],
    spreadsheet: [],
    text: [],
  };
  for (const id of preferred[type] || []) {
    const t = AGENT_TOOLS.find((x) => x.id === id);
    if (t) return t;
  }
  const byType = AGENT_TOOLS.filter((t) => t.outputType === type);
  // Prefer generic "AI Image" / general writers over niche Facebook Ad when ambiguous
  const generic = byType.find((t) => /generator|general|writer|assistant|copywriter/i.test(t.name));
  return generic || byType[0] || AGENT_TOOLS[0];
}

export type Mode = "chat" | "clarify" | "create";

type ThinkResult = {
  mode: Mode;
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
  clarifyingQuestion: string;
};

function casualFallback(prompt: string): ThinkResult {
  const isHi = /^(hi|hii|hello|hey|namaste)/i.test(prompt.trim());
  return {
    mode: "chat",
    summary: "Casual greeting / conversation",
    deliverableType: "none",
    tone: "friendly-professional",
    audience: "user",
    keyRequirements: [],
    needsWebResearch: false,
    researchQuery: "",
    suggestedApproach: "Respond conversationally. Do not create any file.",
    replyToUser: isHi
      ? "Hi — I'm your Creation Machine agent. Tell me what you want to build: image, video, ad copy, logo, document, code — whatever you need. I'll think it through, research if needed, plan, then create."
      : "Got it. What would you like me to create or help with?",
    thinkingTrace:
      "Message looks like a greeting or casual chat.\nNo deliverable requested.\nI should reply warmly and wait for a real task.\nI will NOT run creation tools.",
    assumptions: [],
    clarifyingQuestion: "",
  };
}

async function think(
  prompt: string,
  memory: MemoryEntry[],
  history: ConversationTurn[],
  forcedToolId?: string
): Promise<ThinkResult> {
  if (!forcedToolId && isCasualChat(prompt) && !looksLikeCreationRequest(prompt)) {
    return casualFallback(prompt);
  }

  const fallbackMode: Mode = looksLikeCreationRequest(prompt) || forcedToolId ? "create" : "clarify";
  const fallback: ThinkResult = {
    mode: fallbackMode,
    summary: prompt.slice(0, 200),
    deliverableType: fallbackMode === "create" ? guessType(prompt) : "none",
    tone: "professional",
    audience: "general",
    keyRequirements: fallbackMode === "create" ? [prompt.slice(0, 100)] : [],
    needsWebResearch: /latest|current|today|news|trend|price|research|compare/i.test(prompt),
    researchQuery: /latest|current|today|news|trend|price|research|compare/i.test(prompt) ? prompt.slice(0, 80) : "",
    suggestedApproach:
      fallbackMode === "create"
        ? "Understand request, then generate the deliverable."
        : "Ask what they want created before running tools.",
    replyToUser:
      fallbackMode === "create"
        ? stripEmojis(`Understood. I'll work on: ${prompt.slice(0, 120)}`)
        : "I can help — what should I create? For example: logo, Instagram post, video script, ad copy, or a document.",
    thinkingTrace:
      fallbackMode === "create"
        ? "Clear creation request detected.\nIdentifying output type.\nChecking if research is needed."
        : "Request is ambiguous.\nI should clarify before creating anything.",
    assumptions: [],
    clarifyingQuestion:
      fallbackMode === "clarify" ? "What deliverable do you want (image, video, ad, document, code)?" : "",
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
          content: `${AGENT_IDENTITY}

You are in THINKING mode. Deconstruct the request. Decide mode carefully.

MODE RULES:
- "chat" = greeting, thanks, small talk, general question with no deliverable
- "clarify" = user wants something but critical details missing — ask ONE clear question
- "create" = clear request to produce a deliverable

Return ONLY valid JSON:
{
  "mode": "chat|clarify|create",
  "summary": "one sentence",
  "deliverableType": "none|image|video|audio|document|code|spreadsheet|text",
  "tone": "tone",
  "audience": "audience",
  "keyRequirements": ["..."],
  "needsWebResearch": true/false,
  "researchQuery": "query or empty",
  "suggestedApproach": "approach",
  "replyToUser": "professional reply in user's language. NO EMOJIS. For chat/clarify this IS the full answer.",
  "thinkingTrace": "inner monologue, 4-8 short lines, first person",
  "assumptions": [],
  "clarifyingQuestion": "one question if mode=clarify else empty"
}

Long-term memory:
${formatMemoryForPrompt(memory)}

Recent conversation:
${historyBlock || "(new session)"}
${forcedToolId ? `\nUser forced tool id: ${forcedToolId} — prefer mode=create` : ""}`,
        },
        { role: "user", content: prompt },
      ],
      { timeoutMs: 45000 }
    );

    const raw = result.content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(raw);
    let mode = String(parsed.mode || fallback.mode) as Mode;
    if (!["chat", "clarify", "create"].includes(mode)) mode = fallback.mode;
    if (forcedToolId) mode = "create";
    // Hard safety: casual prompts never create even if LLM misfires
    if (!forcedToolId && isCasualChat(prompt) && !looksLikeCreationRequest(prompt)) {
      return casualFallback(prompt);
    }

    return {
      mode,
      summary: String(parsed.summary || fallback.summary),
      deliverableType: mode === "create" ? String(parsed.deliverableType || guessType(prompt)) : "none",
      tone: String(parsed.tone || "professional"),
      audience: String(parsed.audience || "general"),
      keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements.map(String) : [],
      needsWebResearch: mode === "create" && Boolean(parsed.needsWebResearch),
      researchQuery: String(parsed.researchQuery || ""),
      suggestedApproach: String(parsed.suggestedApproach || ""),
      replyToUser: stripEmojis(String(parsed.replyToUser || fallback.replyToUser)),
      thinkingTrace: stripEmojis(String(parsed.thinkingTrace || fallback.thinkingTrace)),
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map(String) : [],
      clarifyingQuestion: stripEmojis(String(parsed.clarifyingQuestion || "")),
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
            content: `${AGENT_IDENTITY}

PLANNING mode. Pick the BEST matching tool for this exact request. Do not pick a random text ad tool unless the user asked for ads.

Return ONLY JSON:
{
  "steps": ["step1","step2","step3"],
  "selectedToolId": "exact id from list",
  "selectedToolName": "name",
  "reasoning": "why — no emojis"
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
        AGENT_TOOLS.find((t) => t.id === String(parsed.selectedToolId || "").toLowerCase()) ||
        fallbackTool;
      return {
        steps: Array.isArray(parsed.steps)
          ? parsed.steps.map((s: unknown) => stripEmojis(String(s)))
          : ["Analyze requirements", `Generate with ${tool.name}`, "Polish and deliver"],
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
      thinkResult.needsWebResearch ? `Research: ${thinkResult.researchQuery}` : "Use prompt + memory",
      `Generate with ${fallbackTool.name}`,
      "Deliver finished output",
    ],
    selectedToolId: fallbackTool.id,
    selectedToolName: fallbackTool.name,
    reasoning: `Selected ${fallbackTool.name} for ${thinkResult.deliverableType}.`,
  };
}

async function multiSearch(query: string, emit: EmitFn): Promise<string> {
  const searchId = uid("tool-search");
  emit({
    type: "tool",
    id: searchId,
    name: "WebSearch",
    detail: query,
    status: "running",
  });

  const primary = await searchWeb(query);
  // Second pass — alternate phrasing for verify/validate
  let secondary = "";
  if (primary && query.split(" ").length > 2) {
    const alt = `${query} overview facts`;
    secondary = await searchWeb(alt);
  }

  const combined = [primary, secondary].filter(Boolean).join("\n\n---\n\n").slice(0, 2000);
  emit({
    type: "tool",
    id: searchId,
    name: "WebSearch",
    detail: query,
    status: "done",
    result: combined || "No live results — continuing with model knowledge and memory.",
  });
  return combined;
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
  plan: { steps: string[]; selectedToolId: string; selectedToolName: string; reasoning: string } | null;
  tool: AgentTool | null;
  output: ToolOutput | null;
  created: boolean;
  memoriesSaved: Array<{ key: string; value: string }>;
};

/** Full autonomous agent loop */
export async function runAgentLoop(input: RuntimeInput): Promise<RuntimeResult> {
  const { prompt, toolId, memory, history, emit, userId } = input;

  // 1. Memory recall
  const memId = uid("memory");
  emit({
    type: "memory",
    id: memId,
    content: memory.length
      ? `Querying episodic memory (${memory.length} entries)…`
      : "No episodic memory yet — new session.",
    status: "running",
  });
  emit({
    type: "memory",
    id: memId,
    content: memory.length
      ? `Recalled:\n${formatMemoryForPrompt(memory)}`
      : "Memory empty. I'll learn preferences as we work.",
    status: "done",
  });

  // 2. Deep thinking
  const thinkId = uid("thinking");
  emit({
    type: "thinking",
    id: thinkId,
    content: "Deconstructing the request…\nChecking memory and conversation…\nDeciding mode: chat / clarify / create…",
    status: "running",
  });

  const thinkResult = await think(prompt, memory, history, toolId);
  emit({
    type: "thinking",
    id: thinkId,
    content:
      thinkResult.thinkingTrace +
      `\n\nMode: ${thinkResult.mode}` +
      (thinkResult.assumptions.length
        ? `\nAssumptions:\n${thinkResult.assumptions.map((a) => `- ${a}`).join("\n")}`
        : ""),
    status: "done",
  });

  // Chat or clarify — stop here, no tools, no fake files
  if (thinkResult.mode === "chat" || thinkResult.mode === "clarify") {
    const reply =
      thinkResult.mode === "clarify" && thinkResult.clarifyingQuestion
        ? `${thinkResult.replyToUser}\n\n${thinkResult.clarifyingQuestion}`
        : thinkResult.replyToUser;

    emit({ type: "assistant", id: uid("assistant"), content: stripEmojis(reply) });
    emit({ type: "done", id: uid("done"), created: false });

    return {
      think: thinkResult,
      research: "",
      plan: null,
      tool: null,
      output: null,
      created: false,
      memoriesSaved: [],
    };
  }

  // Create mode acknowledgment
  emit({
    type: "assistant",
    id: uid("assistant"),
    content: thinkResult.replyToUser,
  });

  // 3. Web search if needed
  let research = "";
  if (thinkResult.needsWebResearch && thinkResult.researchQuery) {
    research = await multiSearch(thinkResult.researchQuery, emit);
  }

  // 4. Plan
  const planId = uid("plan");
  emit({
    type: "plan",
    id: planId,
    steps: ["Building execution plan…"],
    reasoning: "Selecting the best capability.",
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

  // 5. Execute (with one retry on failure)
  const createId = uid("tool-create");
  emit({
    type: "tool",
    id: createId,
    name: tool.name,
    detail: `${tool.outputType} · ${tool.id}`,
    status: "running",
  });

  let output: ToolOutput;
  try {
    output = await executeTool(tool, prompt, {
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Execution failed";
    emit({
      type: "tool",
      id: createId,
      name: tool.name,
      detail: `${tool.outputType} · ${tool.id}`,
      status: "error",
      result: `Error: ${msg}. Searching for a fix and retrying…`,
    });

    // Autonomous retry after quick research on the error
    if (thinkResult.researchQuery || msg) {
      research = (await multiSearch(`${tool.name} ${msg}`.slice(0, 100), emit)) || research;
    }
    output = await executeTool(tool, prompt, {
      intent: {
        summary: thinkResult.summary,
        deliverableType: thinkResult.deliverableType,
        tone: thinkResult.tone,
        audience: thinkResult.audience,
        keyRequirements: thinkResult.keyRequirements,
        needsWebResearch: true,
        researchQuery: thinkResult.researchQuery,
        suggestedApproach: `Retry after error: ${msg}. ${thinkResult.suggestedApproach}`,
        replyToUser: thinkResult.replyToUser,
        thinkingTrace: thinkResult.thinkingTrace,
      },
      research,
      plan: planResult,
    });
  }

  emit({
    type: "tool",
    id: createId,
    name: tool.name,
    detail: `${tool.outputType} · ${tool.id}`,
    status: "done",
    result: `Created ${output.title} → ${output.downloadName}`,
  });

  emit({
    type: "output",
    id: uid("output"),
    output,
    tool: { id: tool.id, name: tool.name },
  });

  // 6. Memory write + self-reflective log
  const candidates = extractMemoryCandidates(prompt, thinkResult.summary);
  for (const c of candidates) {
    await saveUserMemory(userId, c.key, c.value);
  }
  if (thinkResult.tone) await saveUserMemory(userId, "preferred_tone", thinkResult.tone);
  await saveUserMemory(userId, "last_deliverable_type", thinkResult.deliverableType);
  await appendReflection(
    userId,
    `Completed ${tool.name} for: ${thinkResult.summary.slice(0, 120)}. Type=${thinkResult.deliverableType}.`
  );

  emit({
    type: "assistant",
    id: uid("assistant-final"),
    content: stripEmojis(
      `Ready — delivered with ${tool.name}.` +
        (thinkResult.assumptions.length
          ? `\nAssumption: ${thinkResult.assumptions.join("; ")}. Correct me if needed.`
          : "\nTell me what to refine.")
    ),
  });

  emit({ type: "done", id: uid("done"), created: true });

  return {
    think: thinkResult,
    research,
    plan: planResult,
    tool,
    output,
    created: true,
    memoriesSaved: candidates,
  };
}
