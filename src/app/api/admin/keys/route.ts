import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

async function validateKey(provider: string, key: string): Promise<"online" | "offline"> {
  if (provider === "openai") {
    try {
      const client = new OpenAI({ apiKey: key });
      await client.models.list();
      return "online";
    } catch {
      return "offline";
    }
  }
  if (provider === "postiz") {
    try {
      const url = process.env.POSTIZ_URL || "http://localhost:4007";
      const res = await fetch(`${url}/api/public/v1/integrations`, {
        headers: { Authorization: key },
      });
      return res.ok ? "online" : "offline";
    } catch {
      return "offline";
    }
  }
  return key.length > 10 ? "online" : "offline";
}

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, provider: true, status: true, lastCheck: true, createdAt: true },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { provider, keyValue } = await req.json();
  if (!provider || !keyValue) {
    return NextResponse.json({ error: "Provider and key required" }, { status: 400 });
  }

  const status = await validateKey(provider, keyValue);

  const key = await prisma.apiKey.upsert({
    where: { userId_provider: { userId: user.id, provider } },
    create: { userId: user.id, provider, keyValue, status, lastCheck: new Date() },
    update: { keyValue, status, lastCheck: new Date() },
  });

  return NextResponse.json({ key: { id: key.id, provider: key.provider, status: key.status } });
}
