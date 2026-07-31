import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function GET() {
  const keys = ["app_name", "app_tagline", "brand_primary_color", "brand_secondary_color", "brand_logo_url", "footer_text", "feature_white_label"];
  const branding: Record<string, string> = {};
  for (const k of keys) branding[k] = await getConfig(k);
  return NextResponse.json({ branding });
}

export async function POST(req: NextRequest) {
  const { keys } = await req.json() as { keys: string[] };
  const { getAllConfig } = await import("@/lib/config");
  const configs = await getAllConfig(true);
  const filtered = configs.filter((c) => keys.includes(c.key));
  return NextResponse.json({ configs: filtered });
}
