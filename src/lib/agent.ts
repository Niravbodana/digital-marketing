import { AGENT_TOOLS, type AgentTool } from "./tools";
import { chatComplete } from "./ai-router";

export function pickToolForPrompt(prompt: string, studio?: string): AgentTool {
  const lower = prompt.toLowerCase();
  const pool = studio ? AGENT_TOOLS.filter((t) => t.studio === studio) : AGENT_TOOLS;

  const rules: Array<{ match: RegExp; type?: AgentTool["outputType"]; studio?: string }> = [
    { match: /image|logo|photo|thumbnail|banner|art|design|graphic/i, type: "image" },
    { match: /video|reel|trailer|commercial|cinematic|movie|ugc/i, type: "video" },
    { match: /song|music|voice|audio|podcast|narrat|jingle/i, type: "audio" },
    { match: /code|script|python|react|website|app|api|html/i, type: "code" },
    { match: /excel|csv|spreadsheet|data/i, type: "spreadsheet" },
    { match: /document|report|book|novel|deck|powerpoint|pdf|proposal/i, type: "document" },
    { match: /instagram|social|post|hashtag|caption|linkedin|twitter/i, studio: "social" },
    { match: /market|ad|campaign|funnel|email|ugc/i, studio: "marketing" },
  ];

  for (const rule of rules) {
    if (rule.match.test(lower)) {
      const found = pool.find((t) =>
        (rule.type ? t.outputType === rule.type : true) &&
        (rule.studio ? t.studio === rule.studio : true)
      );
      if (found) return found;
    }
  }

  return pool[0] || AGENT_TOOLS[0];
}

export async function pickToolWithAI(prompt: string, studio?: string): Promise<AgentTool> {
  const pool = (studio ? AGENT_TOOLS.filter((t) => t.studio === studio) : AGENT_TOOLS).slice(0, 30);
  const toolList = pool.map((t) => `${t.id}: ${t.name} (${t.outputType})`).join("\n");

  try {
    const result = await chatComplete([
      {
        role: "system",
        content: `You pick the best tool for a user request. Reply with ONLY the tool id, nothing else.\n\nTools:\n${toolList}`,
      },
      { role: "user", content: prompt },
    ], { timeoutMs: 15000 });

    const id = result.content.trim().split("\n")[0].trim();
    const found = AGENT_TOOLS.find((t) => t.id === id);
    if (found) return found;
  } catch {
    // fallback to rules
  }

  return pickToolForPrompt(prompt, studio);
}
