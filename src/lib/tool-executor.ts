import { chatComplete } from "./ai-router";
import { generatePostContent } from "./ai";
import { generateVoice, isVoiceEnabled } from "./voice";
import { generateVideo, isVideoEnabled } from "./video";
import { getConfig, getOpenAIClient } from "./config";
import type { AgentTool } from "./tools";

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

async function aiGenerate(system: string, user: string): Promise<string> {
  try {
    const result = await chatComplete(
      [{ role: "system", content: system }, { role: "user", content: user }],
      { timeoutMs: 45000 }
    );
    return result.content;
  } catch {
    return `[Demo Output]\n\nRequest: ${user}\n\nAdd API key in Admin → API Key Vault (OpenAI, Groq, or Gemini). Key auto-detects and connects.\n\n---\nBodana Digital`;
  }
}

async function generateImage(prompt: string, title: string): Promise<string> {
  const client = await getOpenAIClient();
  const dalleEnabled = await getConfig("dalle_enabled");
  if (client && dalleEnabled === "true") {
    try {
      const res = await client.images.generate({
        model: "dall-e-3",
        prompt: prompt.slice(0, 1000),
        n: 1,
        size: "1024x1024",
      });
      const url = res.data?.[0]?.url;
      if (url) return url;
    } catch {
      // placeholder fallback
    }
  }
  const seed = encodeURIComponent((title || prompt).slice(0, 20));
  return `https://picsum.photos/seed/${seed}/1080/1080`;
}

export async function executeTool(tool: AgentTool, userInput: string): Promise<ToolOutput> {
  const topic = userInput.trim() || "your project";
  const fullPrompt = `${tool.prompt} ${topic}`;

  switch (tool.outputType) {
    case "image": {
      const promptDetail = await aiGenerate(
        "You are an expert image prompt engineer. Write a detailed image prompt. Return only the prompt.",
        fullPrompt
      );
      const imageUrl = await generateImage(promptDetail, tool.name);
      return {
        type: "image", title: tool.name, content: promptDetail,
        downloadName: `${tool.id}-prompt.txt`, mimeType: "text/plain",
        imageUrl, metadata: { prompt: promptDetail },
      };
    }
    case "video": {
      const script = await aiGenerate(
        "You are a video director. Write a complete video script with scenes and timing in markdown.",
        fullPrompt
      );
      let videoUrl = "";
      if (await isVideoEnabled()) {
        try {
          const vid = await Promise.race([
            generateVideo(`${tool.name}: ${topic}. ${script.slice(0, 300)}`),
            new Promise<{ videoUrl: string }>((resolve) => setTimeout(() => resolve({ videoUrl: "" }), 20000)),
          ]);
          videoUrl = vid.videoUrl;
        } catch { /* skip video, deliver script */ }
      }
      return {
        type: "video", title: tool.name, content: script,
        downloadName: `${tool.id}-script.md`, mimeType: "text/markdown",
        imageUrl: videoUrl ? undefined : `https://picsum.photos/seed/v${Date.now()}/1920/1080`,
        videoUrl: videoUrl || undefined,
        metadata: { format: videoUrl ? "mp4" : "script", source: videoUrl ? "replicate" : "ai-script" },
      };
    }
    case "audio": {
      const script = await aiGenerate(
        "Write a short audio/voice script under 150 words for TTS.",
        fullPrompt
      );
      let audioUrl = "";
      if (await isVoiceEnabled()) {
        try {
          const voice = await Promise.race([
            generateVoice(script.slice(0, 1500)),
            new Promise<{ audioUrl: string }>((resolve) => setTimeout(() => resolve({ audioUrl: "" }), 15000)),
          ]);
          audioUrl = voice.audioUrl;
        } catch { /* deliver script only */ }
      }
      return {
        type: "audio", title: tool.name, content: script,
        downloadName: audioUrl ? `${tool.id}.mp3` : `${tool.id}-script.md`,
        mimeType: audioUrl ? "audio/mpeg" : "text/markdown",
        audioUrl: audioUrl || undefined,
        metadata: { source: audioUrl ? "elevenlabs" : "script" },
      };
    }
    case "code": {
      const code = await aiGenerate("Write clean working code with comments in markdown code blocks.", fullPrompt);
      return { type: "code", title: tool.name, content: code, downloadName: `${tool.id}.md`, mimeType: "text/markdown" };
    }
    case "spreadsheet": {
      const data = await aiGenerate("Create CSV data with headers and 10 rows.", fullPrompt);
      return { type: "spreadsheet", title: tool.name, content: data, downloadName: `${tool.id}.csv`, mimeType: "text/csv" };
    }
    case "document": {
      const doc = await aiGenerate("Create a well-structured professional document in markdown.", fullPrompt);
      return { type: "document", title: tool.name, content: doc, downloadName: `${tool.id}-doc.md`, mimeType: "text/markdown" };
    }
    default: {
      if (tool.studio === "social") {
        const { caption, hashtags } = await generatePostContent(topic);
        const imageUrl = await generateImage(caption, tool.name);
        return {
          type: "text", title: tool.name,
          content: `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`,
          downloadName: `${tool.id}-post.txt`, mimeType: "text/plain", imageUrl,
        };
      }
      const text = await aiGenerate("Generate high-quality production-ready content.", fullPrompt);
      return { type: "text", title: tool.name, content: text, downloadName: `${tool.id}.txt`, mimeType: "text/plain" };
    }
  }
}
