import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateVideo } from "@/lib/video";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  const result = await generateVideo(prompt);
  if (!result.videoUrl) {
    return NextResponse.json({
      error: "Video generation unavailable. Add Replicate API key in Admin.",
      source: result.source,
      fallback: true,
    }, { status: 503 });
  }
  return NextResponse.json(result);
}
