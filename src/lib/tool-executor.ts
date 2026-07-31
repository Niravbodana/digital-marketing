import { getConfig, getOpenAIClient, isFeatureEnabled } from "./config";
import { generatePostContent } from "./ai";
import { generateVoice, isVoiceEnabled } from "./voice";
import { generateVideo, isVideoEnabled } from "./video";
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
  const client = await getOpenAIClient();
  if (client) {
    const model = (await getConfig("openai_model")) || "gpt-4o-mini";
    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.8,
    });
    return res.choices[0]?.message?.content || "";
  }
  return `[AI Mock Output]\n\nGenerated content for: ${user}\n\nAdd OpenAI API key in Admin Panel → AI & Models for full generation.\n\n---\nBodana Digital Creation Engine`;
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
      // fall through to placeholder
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
        "You are an expert image prompt engineer. Write a detailed DALL-E/Midjourney style prompt. Return only the prompt, no explanation.",
        fullPrompt
      );
      const imageUrl = await generateImage(promptDetail, tool.name);
      return {
        type: "image",
        title: tool.name,
        content: promptDetail,
        downloadName: `${tool.id}-prompt.txt`,
        mimeType: "text/plain",
        imageUrl,
        metadata: { prompt: promptDetail },
      };
    }
    case "video": {
      const script = await aiGenerate(
        "You are a video director. Write a complete video script with scenes, dialogue, camera directions, and timing. Use markdown format.",
        fullPrompt
      );
      let videoUrl = "";
      if (await isVideoEnabled()) {
        const vid = await generateVideo(`${tool.name}: ${topic}. ${script.slice(0, 500)}`);
        videoUrl = vid.videoUrl;
      }
      return {
        type: "video",
        title: tool.name,
        content: script,
        downloadName: `${tool.id}-script.md`,
        mimeType: "text/markdown",
        imageUrl: videoUrl ? undefined : `https://picsum.photos/seed/v${Date.now()}/1920/1080`,
        videoUrl: videoUrl || undefined,
        metadata: { format: videoUrl ? "mp4" : "script-only", duration: "60s", source: videoUrl ? "replicate" : "script" },
      };
    }
    case "audio": {
      const script = await aiGenerate(
        "You are an audio producer. Write complete audio script with timing, voice direction, music cues, and sound effects notes. Keep narration under 200 words for TTS.",
        fullPrompt
      );
      let audioUrl = "";
      if (await isVoiceEnabled()) {
        const voice = await generateVoice(script.slice(0, 2000));
        audioUrl = voice.audioUrl;
      }
      return {
        type: "audio",
        title: tool.name,
        content: script,
        downloadName: audioUrl ? `${tool.id}.mp3` : `${tool.id}-audio-script.md`,
        mimeType: audioUrl ? "audio/mpeg" : "text/markdown",
        audioUrl: audioUrl || undefined,
        metadata: { format: audioUrl ? "mp3" : "script-only", source: audioUrl ? "elevenlabs" : "script" },
      };
    }
    case "code": {
      const code = await aiGenerate(
        "You are an expert developer. Write clean, working code with comments. Return only code in markdown code blocks.",
        fullPrompt
      );
      return {
        type: "code",
        title: tool.name,
        content: code,
        downloadName: `${tool.id}.md`,
        mimeType: "text/markdown",
      };
    }
    case "spreadsheet": {
      const data = await aiGenerate(
        "You are a data analyst. Create CSV-formatted spreadsheet data with headers and 10 rows of realistic sample data.",
        fullPrompt
      );
      return {
        type: "spreadsheet",
        title: tool.name,
        content: data,
        downloadName: `${tool.id}.csv`,
        mimeType: "text/csv",
      };
    }
    case "document": {
      const doc = await aiGenerate(
        "You are a professional document writer. Create a well-structured document with headings, bullet points, and professional formatting in markdown.",
        fullPrompt
      );
      return {
        type: "document",
        title: tool.name,
        content: doc,
        downloadName: `${tool.id}-document.md`,
        mimeType: "text/markdown",
      };
    }
    default: {
      if (tool.studio === "social") {
        const { caption, hashtags } = await generatePostContent(topic);
        const imageUrl = await generateImage(caption, tool.name);
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
        "You are a creative AI assistant. Generate high-quality, production-ready content.",
        fullPrompt
      );
      return {
        type: "text",
        title: tool.name,
        content: text,
        downloadName: `${tool.id}.txt`,
        mimeType: "text/plain",
      };
    }
  }
}
