import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateVoice } from "@/lib/voice";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { text, voiceId } = await req.json();
  if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const result = await generateVoice(text, voiceId);
  if (!result.audioUrl) {
    return NextResponse.json({ error: "Voice generation unavailable. Add ElevenLabs key in Admin.", source: result.source }, { status: 503 });
  }
  return NextResponse.json(result);
}
