import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  const accounts = await prisma.connectedAccount.findMany({
    where: user ? { userId: user.id } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ accounts });
}

export async function DELETE(req: Request) {
  await ensureDatabase();
  const { id } = await req.json();
  await prisma.connectedAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
