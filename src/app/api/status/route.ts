import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { hasAnyLLMKey } from "@/lib/ai-router";
import { isMetaConfigured } from "@/lib/instagram";

export async function GET() {
  await ensureDatabase();
  const ai = await hasAnyLLMKey();
  return NextResponse.json({
    ai,
    instagram: isMetaConfigured(),
    demoMode: !isMetaConfigured(),
    postiz: !!(process.env.POSTIZ_API_KEY && process.env.POSTIZ_URL),
  });
}
