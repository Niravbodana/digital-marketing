import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { syncAdminRole } from "@/lib/admin-access";
import { setConfig } from "@/lib/config";
import { detectProviderFromKey } from "@/lib/ai-router";

export const maxDuration = 60;

/** Any logged-in user can paste a key to unlock the agent (admin promoted automatically for owners). */
export async function POST(req: NextRequest) {
  await ensureDatabase();
  let user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  user = await syncAdminRole(user);

  const body = await req.json();
  const keyValue = String(body.keyValue || "").trim();
  if (!keyValue || keyValue.length < 10) {
    return NextResponse.json({ error: "Paste a valid API key" }, { status: 400 });
  }

  try {
    const { smartAddKey } = await import("@/lib/ai-router");
    const result = await smartAddKey(keyValue);

    const provider = detectProviderFromKey(keyValue);
    if (provider === "openai") {
      await setConfig("openai_api_key", keyValue);
    }

    return NextResponse.json({
      success: true,
      ...result,
      role: user.role,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to connect key" },
      { status: 500 }
    );
  }
}
