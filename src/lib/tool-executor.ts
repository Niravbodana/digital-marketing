import { chatComplete } from "./ai-router";
import { generatePostContent } from "./ai";
import { generateVoice, isVoiceEnabled } from "./voice";
import { generateVideo, isVideoEnabled } from "./video";
import { getConfig, getOpenAIClient } from "./config";
import type { AgentTool } from "./tools";
import type { BrainContext } from "./agent-brain";

export type ToolOutput = {
  type: string;
  title: string;
  content: string;
  downloadName: string;
  mimeType: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  metadata?: Record<string, string>;
};

function hashSeed(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

async function aiGenerate(system: string, user: string, context?: string): Promise<string> {
  const sys = context ? `${system}\n\nContext from research and intent:\n${context}` : system;
  try {
    const result = await chatComplete(
      [{ role: "system", content: sys }, { role: "user", content: user }],
      { timeoutMs: 60000 }
    );
    return result.content;
  } catch {
    return `[Demo] Add API key in Admin → API Key Vault.\n\nRequest: ${user}`;
  }
}

async function generateImage(prompt: string, userPrompt: string): Promise<string> {
  const client = await getOpenAIClient();
  const dalleEnabled = await getConfig("dalle_enabled");
  const fullPrompt = `${prompt}\n\nUser request: ${userPrompt}`.slice(0, 1000);

  if (client && dalleEnabled === "true") {
    try {
      const res = await client.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      });
      const url = res.data?.[0]?.url;
      if (url) return url;
    } catch {
      // fallback
    }
  }

  const encoded = encodeURIComponent(fullPrompt.slice(0, 500));
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${hashSeed(fullPrompt)}`;
}

export async function executeTool(
  tool: AgentTool,
  userInput: string,
  brain?: Partial<BrainContext>
): Promise<ToolOutput> {
  const topic = userInput.trim();
  const ctxBlock = [
    brain?.intent ? `Intent: ${brain.intent.summary}\nTone: ${brain.intent.tone}\nAudience: ${brain.intent.audience}\nRequirements: ${brain.intent.keyRequirements.join(", ")}` : "",
    brain?.research ? `Research:\n${brain.research}` : "",
    brain?.plan ? `Plan: ${brain.plan.steps.join(" → ")}` : "",
  ].filter(Boolean).join("\n\n");

  const fullPrompt = `${tool.prompt}\n\nUser request: ${topic}\n${brain?.intent?.suggestedApproach || ""}`;

  switch (tool.outputType) {
    case "image": {
      const promptDetail = await aiGenerate(
        `You are an expert image director. Write a UNIQUE detailed image prompt specific to this exact user request. Include style, lighting, composition, colors, subject. Return ONLY the image prompt — no explanation.`,
        fullPrompt,
        ctxBlock
      );
      const imageUrl = await generateImage(promptDetail, topic);
      return {
        type: "image",
        title: tool.name,
        content: `Image prompt:\n${promptDetail}\n\n---\nBased on: ${topic}`,
        downloadName: `${tool.id}-image.txt`,
        mimeType: "text/plain",
        imageUrl,
        metadata: { prompt: promptDetail, brain: "true" },
      };
    }
    case "video": {
      const script = await aiGenerate(
        "You are a video director. Write a complete UNIQUE video script with scenes, timing, and visual direction in markdown. Match the user's exact request.",
        fullPrompt,
        ctxBlock
      );
      let videoUrl = "";
      if (await isVideoEnabled()) {
        try {
          const vid = await Promise.race([
            generateVideo(`${topic}. ${script.slice(0, 400)}`),
            new Promise<{ videoUrl: string }>((resolve) => setTimeout(() => resolve({ videoUrl: "" }), 25000)),
          ]);
          videoUrl = vid.videoUrl;
        } catch { /* script only */ }
      }
      const thumbPrompt = `${topic} cinematic frame ${brain?.intent?.tone || ""}`;
      return {
        type: "video",
        title: tool.name,
        content: script,
        downloadName: `${tool.id}-script.md`,
        mimeType: "text/markdown",
        imageUrl: videoUrl ? undefined : await generateImage(thumbPrompt, topic),
        videoUrl: videoUrl || undefined,
        metadata: { format: videoUrl ? "mp4" : "script" },
      };
    }
    case "audio": {
      const script = await aiGenerate(
        "Write a unique audio/voice script under 200 words matching the user's exact request. Include tone and pacing notes.",
        fullPrompt,
        ctxBlock
      );
      let audioUrl = "";
      if (await isVoiceEnabled()) {
        try {
          const voice = await Promise.race([
            generateVoice(script.slice(0, 1500)),
            new Promise<{ audioUrl: string }>((resolve) => setTimeout(() => resolve({ audioUrl: "" }), 18000)),
          ]);
          audioUrl = voice.audioUrl;
        } catch { /* script */ }
      }
      return {
        type: "audio",
        title: tool.name,
        content: script,
        downloadName: audioUrl ? `${tool.id}.mp3` : `${tool.id}-script.md`,
        mimeType: audioUrl ? "audio/mpeg" : "text/markdown",
        audioUrl: audioUrl || undefined,
      };
    }
    case "code": {
      const code = await aiGenerate(
        "Write clean, working code with comments. Match the user's exact requirements. Use markdown code blocks.",
        fullPrompt,
        ctxBlock
      );
      return { type: "code", title: tool.name, content: code, downloadName: `${tool.id}.md`, mimeType: "text/markdown" };
    }
    case "spreadsheet": {
      const data = await aiGenerate(
        "Create CSV data with headers and realistic rows specific to the user's request.",
        fullPrompt,
        ctxBlock
      );
      return { type: "spreadsheet", title: tool.name, content: data, downloadName: `${tool.id}.csv`, mimeType: "text/csv" };
    }
    case "document": {
      const doc = await aiGenerate(
        "Create a well-structured professional document in markdown. Fully customized to the user's request.",
        fullPrompt,
        ctxBlock
      );
      return { type: "document", title: tool.name, content: doc, downloadName: `${tool.id}-doc.md`, mimeType: "text/markdown" };
    }
    default: {
      if (tool.studio === "social") {
        const { caption, hashtags } = await generatePostContent(topic, brain?.intent?.tone || "engaging");
        const imageUrl = await generateImage(`${caption} social media visual`, topic);
        return {
          type: "text",
          title: tool.name,
          content: `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`,
          downloadName: `${tool.id}-post.txt`,
          mimeType: "text/plain",
          imageUrl,
        };
      }
      const text = await aiGenerate(
        "Generate high-quality, unique, production-ready content. Fully address the user's specific request — not generic.",
        fullPrompt,
        ctxBlock
      );
      return { type: "text", title: tool.name, content: text, downloadName: `${tool.id}.txt`, mimeType: "text/plain" };
    }
  }
}
