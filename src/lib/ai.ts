import { z } from "zod";
import { chatComplete, hasAnyLLMKey } from "./ai-router";

const TaskIntentSchema = z.object({
  action: z.enum([
    "generate_post",
    "schedule_post",
    "connect_instagram",
    "list_accounts",
    "publish_post",
    "generate_hashtags",
    "general",
  ]),
  title: z.string(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  topic: z.string().optional(),
  tone: z.string().optional(),
  scheduleHint: z.string().optional(),
  reply: z.string(),
});

export type TaskIntent = z.infer<typeof TaskIntentSchema>;

export async function hasAiConfigured() {
  return hasAnyLLMKey();
}

export async function parsePrompt(prompt: string): Promise<TaskIntent> {
  const systemPrompt = `You are Bodana Digital AI assistant. Parse user marketing prompts into structured actions.
Return JSON only with: action, title, caption (optional), hashtags (array, optional), topic, tone, scheduleHint, reply (friendly confirmation message in same language as user).
Actions: generate_post, schedule_post, connect_instagram, list_accounts, publish_post, generate_hashtags, general`;

  if (await hasAnyLLMKey()) {
    try {
      const result = await chatComplete([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ], { timeoutMs: 30000 });
      const parsed = JSON.parse(result.content || "{}");
      return TaskIntentSchema.parse(parsed);
    } catch {
      // fall through to rule-based
    }
  }

  return ruleBasedParse(prompt);
}

function ruleBasedParse(prompt: string): TaskIntent {
  const lower = prompt.toLowerCase();

  if (lower.includes("connect") && lower.includes("instagram")) {
    return {
      action: "connect_instagram",
      title: "Connect Instagram Account",
      reply: "Instagram connect kar raha hoon — Connect Accounts section kholo.",
    };
  }
  if (lower.includes("publish") || lower.includes("post karo") || lower.includes("daalo")) {
    return {
      action: "publish_post",
      title: "Publish Post to Instagram",
      reply: "Post publish karne ke liye preview check karo aur Publish dabao.",
    };
  }
  if (lower.includes("hashtag")) {
    return {
      action: "generate_hashtags",
      title: "Generate Hashtags",
      topic: prompt,
      reply: "Hashtags generate ho rahe hain...",
    };
  }
  if (lower.includes("schedule") || lower.includes("kal") || lower.includes("tomorrow")) {
    return {
      action: "schedule_post",
      title: "Schedule Instagram Post",
      topic: prompt,
      scheduleHint: prompt,
      reply: "Post schedule kar raha hoon — preview mein dekho.",
    };
  }

  return {
    action: "generate_post",
    title: "Generate Instagram Post",
    topic: prompt,
    tone: "engaging",
    reply: "Aapke liye post generate kar raha hoon — preview dekho!",
  };
}

export async function generatePostContent(topic: string, tone = "engaging") {
  if (await hasAnyLLMKey()) {
    try {
      const result = await chatComplete([
        {
          role: "system",
          content:
            "Generate Instagram post content. Return JSON: { caption: string (max 2200 chars, include emojis), hashtags: string[] (15-20 relevant tags without #) }",
        },
        { role: "user", content: `Topic: ${topic}\nTone: ${tone}` },
      ], { timeoutMs: 45000 });
      const raw = JSON.parse(result.content || "{}");
      return {
        caption: String(raw.caption || ""),
        hashtags: (raw.hashtags as string[]) || [],
      };
    } catch {
      // fallback
    }
  }

  return mockGenerate(topic);
}

export async function generateHashtags(topic: string) {
  const { hashtags } = await generatePostContent(topic);
  return hashtags.length ? hashtags : mockGenerate(topic).hashtags;
}

function mockGenerate(topic: string) {
  const base = topic.split(/\s+/).slice(0, 3).map((w) => w.replace(/[^a-zA-Z0-9]/g, ""));
  const tags = [
    ...base,
    "digitalmarketing",
    "instagram",
    "bodanadigital",
    "growth",
    "branding",
    "socialmedia",
    "contentcreator",
    "marketingtips",
    "entrepreneur",
    "india",
    "viral",
    "trending",
    "reels",
    "explore",
    "business",
  ].filter(Boolean);
  const caption = `✨ ${topic}\n\nReady to grow your brand? Let's make it happen! 🚀\n\nDrop a 🔥 if you agree!\n\n— Bodana Digital`;

  return { caption, hashtags: [...new Set(tags)].slice(0, 20) };
}
