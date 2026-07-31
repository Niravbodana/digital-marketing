import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getConfig, getOpenAIClient } from "@/lib/config";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { content, title } = await req.json();

  const client = await getOpenAIClient();
  const dalleEnabled = await getConfig("dalle_enabled");

  if (client && dalleEnabled === "true") {
    try {
      const res = await client.images.generate({
        model: "dall-e-3",
        prompt: content.slice(0, 1000),
        n: 1,
        size: "1024x1024",
      });
      const url = res.data?.[0]?.url;
      if (url) return NextResponse.json({ imageUrl: url, source: "dall-e-3" });
    } catch (e) {
      console.error("DALL-E error:", e);
    }
  }

  const seed = encodeURIComponent((title || content).slice(0, 20));
  return NextResponse.json({ imageUrl: `https://picsum.photos/seed/${seed}/1024/1024`, source: "placeholder" });
}
