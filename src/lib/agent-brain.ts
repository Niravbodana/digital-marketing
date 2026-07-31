import { chatComplete, hasAnyLLMKey } from "./ai-router";
import { AGENT_TOOLS, type AgentTool } from "./tools";

export type IntentAnalysis = {
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
};

export type BrainPlan = {
  steps: string[];
  selectedToolId: string;
  selectedToolName: string;
  reasoning: string;
};

export type BrainContext = {
  intent: IntentAnalysis;
  research: string;
  plan: BrainPlan;
};

const DEFAULT_INTENT: IntentAnalysis = {
  summary: "",
  deliverableType: "text",
  tone: "professional",
  audience: "general",
  keyRequirements: [],
  needsWebResearch: false,
  researchQuery: "",
  suggestedApproach: "",
  replyToUser: "",
  thinkingTrace: "",
};

export async function thinkAboutRequest(prompt: string): Promise<IntentAnalysis> {
  if (!(await hasAnyLLMKey())) {
    return {
      ...DEFAULT_INTENT,
      summary: prompt.slice(0, 200),
      replyToUser: `I understand you want: ${prompt.slice(0, 120)}. I'll work on this using available capabilities.`,
      thinkingTrace: "Analyzing prompt structure and keywords…",
      deliverableType: guessTypeFromPrompt(prompt),
    };
  }

  try {
    const result = await chatComplete([
      {
        role: "system",
        content: `You are an advanced AI brain like ChatGPT/Cursor. Before creating anything, deeply understand the user request.

Return ONLY valid JSON:
{
  "summary": "one sentence what user wants",
  "deliverableType": "image|video|audio|document|code|spreadsheet|text",
  "tone": "tone/style",
  "audience": "target audience",
  "keyRequirements": ["req1", "req2"],
  "needsWebResearch": true/false,
  "researchQuery": "search query if needed else empty",
  "suggestedApproach": "how you will execute",
  "replyToUser": "2-3 sentences acknowledging user in their language (Hindi/English mix ok). NO EMOJIS.",
  "thinkingTrace": "your internal reasoning stream — what you're noticing, questioning, deciding (3-5 lines, first person). NO EMOJIS."
}`,
      },
      { role: "user", content: prompt },
    ], { timeoutMs: 45000 });

    const strip = (s: string) => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "").trim();
    const raw = result.content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(raw);
    return {
      summary: String(parsed.summary || prompt.slice(0, 150)),
      deliverableType: String(parsed.deliverableType || "text"),
      tone: String(parsed.tone || "professional"),
      audience: String(parsed.audience || "general"),
      keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements.map(String) : [],
      needsWebResearch: Boolean(parsed.needsWebResearch),
      researchQuery: String(parsed.researchQuery || ""),
      suggestedApproach: String(parsed.suggestedApproach || ""),
      replyToUser: strip(String(parsed.replyToUser || `Got it — working on: ${prompt.slice(0, 100)}`)),
      thinkingTrace: strip(String(parsed.thinkingTrace || "Processing request…")),
    };
  } catch {
    return {
      ...DEFAULT_INTENT,
      summary: prompt.slice(0, 200),
      deliverableType: guessTypeFromPrompt(prompt),
      replyToUser: `Samajh gaya — "${prompt.slice(0, 80)}" ke liye plan bana raha hoon.`,
      thinkingTrace: "Parsing intent from your message…\nIdentifying output type and constraints…",
    };
  }
}

function guessTypeFromPrompt(prompt: string): string {
  const l = prompt.toLowerCase();
  if (/image|logo|photo|thumbnail|banner|art|design|graphic|poster/i.test(l)) return "image";
  if (/video|reel|trailer|commercial|movie|ugc/i.test(l)) return "video";
  if (/song|music|voice|audio|podcast/i.test(l)) return "audio";
  if (/code|python|react|website|app|api|html|script/i.test(l)) return "code";
  if (/excel|csv|spreadsheet/i.test(l)) return "spreadsheet";
  if (/document|report|book|deck|pdf|proposal/i.test(l)) return "document";
  return "text";
}

export async function searchWeb(query: string): Promise<string> {
  if (!query.trim()) return "";
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("search failed");
    const data = await res.json();
    const parts: string[] = [];
    if (data.AbstractText) parts.push(data.AbstractText);
    if (data.Heading) parts.push(`Topic: ${data.Heading}`);
    const topics = (data.RelatedTopics || [])
      .filter((t: { Text?: string }) => t.Text)
      .slice(0, 4)
      .map((t: { Text: string }) => `• ${t.Text}`);
    if (topics.length) parts.push(topics.join("\n"));
    if (parts.length) return parts.join("\n\n").slice(0, 1200);

    const wiki = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.split(" ").slice(0, 3).join("_"))}`
    );
    if (wiki.ok) {
      const w = await wiki.json();
      if (w.extract) return String(w.extract).slice(0, 1000);
    }
  } catch {
    // fallback to LLM knowledge
  }

  if (await hasAnyLLMKey()) {
    try {
      const r = await chatComplete([
        { role: "system", content: "Provide 4 bullet points of relevant factual context for this query. Be concise." },
        { role: "user", content: query },
      ], { timeoutMs: 25000 });
      return r.content.slice(0, 1000);
    } catch {
      return "";
    }
  }
  return "";
}

export async function buildPlan(prompt: string, intent: IntentAnalysis, research: string): Promise<BrainPlan> {
  const toolList = AGENT_TOOLS.map((t) => `${t.id}: ${t.name} [${t.outputType}] — ${t.description}`).join("\n");

  if (await hasAnyLLMKey()) {
    try {
      const result = await chatComplete([
        {
          role: "system",
          content: `You are planning execution like Cursor AI. Given intent and research, pick the BEST tool and list 3-5 execution steps.

Return ONLY JSON:
{
  "steps": ["step1", "step2", ...],
  "selectedToolId": "exact tool id from list",
  "selectedToolName": "name",
  "reasoning": "why this tool and approach"
}

Tools:\n${toolList}`,
        },
        {
          role: "user",
          content: `User request: ${prompt}\n\nIntent: ${JSON.stringify(intent)}\n\nResearch:\n${research || "none"}`,
        },
      ], { timeoutMs: 35000 });

      const raw = result.content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(raw);
      const tool = AGENT_TOOLS.find((t) => t.id === parsed.selectedToolId)
        || AGENT_TOOLS.find((t) => parsed.selectedToolId && t.id.includes(String(parsed.selectedToolId)))
        || pickToolByType(intent.deliverableType);

      return {
        steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : ["Analyze", "Generate", "Polish"],
        selectedToolId: tool.id,
        selectedToolName: tool.name,
        reasoning: String(parsed.reasoning || tool.description),
      };
    } catch {
      // fallback
    }
  }

  const tool = pickToolByType(intent.deliverableType);
  return {
    steps: [
      `Understand: ${intent.summary}`,
      intent.needsWebResearch ? `Research: ${intent.researchQuery || "context"}` : "Use prompt context",
      `Generate with ${tool.name}`,
      "Deliver finished output",
    ],
    selectedToolId: tool.id,
    selectedToolName: tool.name,
    reasoning: `Selected ${tool.name} for ${intent.deliverableType} output.`,
  };
}

function pickToolByType(type: string): AgentTool {
  const match = AGENT_TOOLS.find((t) => t.outputType === type);
  return match || AGENT_TOOLS[0];
}

export function getToolFromPlan(plan: BrainPlan, toolId?: string): AgentTool {
  if (toolId) {
    const t = AGENT_TOOLS.find((x) => x.id === toolId);
    if (t) return t;
  }
  return AGENT_TOOLS.find((t) => t.id === plan.selectedToolId) || AGENT_TOOLS[0];
}
