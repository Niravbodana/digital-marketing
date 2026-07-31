import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const cleanUsername = String(username).replace("@", "");

  const account = await prisma.connectedAccount.create({
    data: {
      userId: user?.id,
      platform: "instagram",
      username: cleanUsername,
      displayName: cleanUsername,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      accountId: `ig_${cleanUsername}_${Date.now()}`,
      accessToken: `secured_${Buffer.from(password).toString("base64").slice(0, 32)}`,
      bio: `✨ @${cleanUsername} · Digital Creator\n📍 India\n🔗 Managed via Bodana Digital`,
      followers: Math.floor(Math.random() * 5000) + 500,
      following: Math.floor(Math.random() * 800) + 100,
      postsCount: Math.floor(Math.random() * 200) + 20,
      isDemo: true,
    },
  });

  return NextResponse.json({
    account,
    message: `✅ @${cleanUsername} connected! Full dashboard access enabled.`,
  });
}
