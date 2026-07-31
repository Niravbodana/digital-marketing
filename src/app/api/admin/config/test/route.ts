import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { service } = await req.json();

  try {
    switch (service) {
      case "openai": {
        const key = await getConfig("openai_api_key");
        if (!key) return NextResponse.json({ status: "offline", error: "No key set" });
        const client = new OpenAI({ apiKey: key });
        await client.models.list();
        return NextResponse.json({ status: "online", message: "OpenAI connected" });
      }
      case "razorpay": {
        const keyId = await getConfig("razorpay_key_id");
        const keySecret = await getConfig("razorpay_key_secret");
        if (!keyId || !keySecret) return NextResponse.json({ status: "offline", error: "Keys missing" });
        const Razorpay = (await import("razorpay")).default;
        new Razorpay({ key_id: keyId, key_secret: keySecret });
        return NextResponse.json({ status: "online", message: "Razorpay keys valid format" });
      }
      case "postiz": {
        const url = await getConfig("postiz_url");
        const key = await getConfig("postiz_api_key");
        const res = await fetch(`${url}/api/public/v1/integrations`, {
          headers: { Authorization: key },
        }).catch(() => null);
        return NextResponse.json({ status: res?.ok ? "online" : "offline" });
      }
      case "meta": {
        const appId = await getConfig("meta_app_id");
        const secret = await getConfig("meta_app_secret");
        if (!appId || !secret) return NextResponse.json({ status: "offline", error: "Meta keys missing" });
        return NextResponse.json({ status: "online", message: "Meta credentials configured" });
      }
      default:
        return NextResponse.json({ status: "unknown" });
    }
  } catch (e) {
    return NextResponse.json({ status: "offline", error: e instanceof Error ? e.message : "Failed" });
  }
}
