import OpenAI from "openai";
import { generatePostContent } from "./ai";
import type { AgentTool } from "./tools";

export type ToolOutput = {
  type: string;
  title: string;
  content: string;
  downloadName: string;
  mimeType: string;
  imageUrl?: string;
  metadata?: Record<string, string>;
};

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith("sk-your")) return null;
  return new OpenAI({ apiKey: key });
}

async function aiGenerate(system: string, user: string): Promise<string> {
  const client = getClient();
  if (client) {
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.8,
    });
    return res.choices[0]?.message?.content || "";
  }
  return `[AI Mock Output]\n\nGenerated content for: ${user}\n\nThis is a production-ready draft. Add OPENAI_API_KEY for full AI generation.\n\n---\nBodana Digital Creation Engine`;
}

export async function executeTool(
  tool: AgentTool,
  userInput: string
): Promise<ToolOutput> {
  const topic = userInput.trim() || "your project";
  const fullPrompt = `${tool.prompt} ${topic}`;

  switch (tool.outputType) {
    case "image": {
      const promptDetail = await aiGenerate(
        "You are an expert image prompt engineer. Write a detailed DALL-E/Midjourney style prompt. Return only the prompt, no explanation.",
        fullPrompt
      );
      const seed = encodeURIComponent(topic.slice(0, 20));
      return {
        type: "image",
        title: tool.name,
        content: promptDetail,
        downloadName: `${tool.id}-prompt.txt`,
        mimeType: "text/plain",
        imageUrl: `https://picsum.photos/seed/${seed}/1080/1080`,
        metadata: { prompt: promptDetail },
      };
    }
    case "video": {
      const script = await aiGenerate(
        "You are a video director. Write a complete video script with scenes, dialogue, camera directions, and timing. Use markdown format.",
        fullPrompt
      );
      return {
        type: "video",
        title: tool.name,
        content: script,
        downloadName: `${tool.id}-script.md`,
        mimeType: "text/markdown",
        imageUrl: `https://picsum.photos/seed/v${Date.now()}/1920/1080`,
        metadata: { format: "mp4-ready", duration: "60s" },
      };
    }
    case "audio": {
      const script = await aiGenerate(
        "You are an audio producer. Write complete audio script with timing, voice direction, music cues, and sound effects notes.",
        fullPrompt
      );
      return {
        type: "audio",
        title: tool.name,
        content: script,
        downloadName: `${tool.id}-audio-script.md`,
        mimeType: "text/markdown",
        metadata: { format: "mp3-ready" },
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
        return {
          type: "text",
          title: tool.name,
          content: `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`,
          downloadName: `${tool.id}-post.txt`,
          mimeType: "text/plain",
          imageUrl: `https://picsum.photos/seed/s${Date.now()}/1080/1080`,
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
