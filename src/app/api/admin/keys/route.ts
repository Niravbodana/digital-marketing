import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllConfig } from "@/lib/config";

/** Legacy route — redirects to new config-based admin system */
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const configs = await getAllConfig(false);
  const keys = configs
    .filter((c) => c.isSecret || ["openai_api_key", "postiz_api_key", "meta_app_secret", "razorpay_key_id"].includes(c.key))
    .map((c) => ({
      id: c.key,
      provider: c.key.replace(/_api_key|_key_id|_app_secret/g, "").replace(/_/g, " "),
      status: c.value && c.value !== "••••••••" ? "online" : "offline",
      lastCheck: c.updatedAt,
    }));

  return NextResponse.json({ keys, message: "Use /api/admin/config for full management" });
}

export async function POST() {
  return NextResponse.json(
    { error: "API keys are now managed via Admin Panel → Settings. Use POST /api/admin/config" },
    { status: 410 }
  );
}
