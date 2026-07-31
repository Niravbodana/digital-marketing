import { NextResponse } from "next/server";
import { hasAiConfigured } from "@/lib/ai";
import { isMetaConfigured } from "@/lib/instagram";

export async function GET() {
  return NextResponse.json({
    ai: await hasAiConfigured(),
    instagram: isMetaConfigured(),
    demoMode: !isMetaConfigured(),
    postiz: !!(process.env.POSTIZ_API_KEY && process.env.POSTIZ_URL),
  });
}
