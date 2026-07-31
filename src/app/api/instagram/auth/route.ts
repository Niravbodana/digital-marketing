import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getAuthUrl, isMetaConfigured } from "@/lib/instagram";

export async function GET() {
  if (!isMetaConfigured()) {
    return NextResponse.json({
      demo: true,
      message: "Meta app not configured — use demo connect instead",
      url: null,
    });
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.json({ url: getAuthUrl(state), demo: false });
}
