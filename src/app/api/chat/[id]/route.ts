import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const conv = await prisma.conversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json({ conversation: conv });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await req.json();
  await prisma.conversation.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
