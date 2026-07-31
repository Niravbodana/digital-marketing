import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDemoAccount } from "@/lib/instagram";

export async function GET() {
  const accounts = await prisma.connectedAccount.findMany({
    where: { platform: "instagram" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      profilePicture: true,
      isDemo: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ accounts });
}

export async function POST(req: Request) {
  const { demo } = await req.json();

  if (demo) {
    const data = createDemoAccount();
    const existing = await prisma.connectedAccount.findFirst({
      where: { username: data.username, isDemo: true },
    });
    if (existing) return NextResponse.json({ account: existing });

    const account = await prisma.connectedAccount.create({ data });
    return NextResponse.json({ account });
  }

  return NextResponse.json({ error: "Use GET /api/instagram/auth for real OAuth" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.connectedAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
