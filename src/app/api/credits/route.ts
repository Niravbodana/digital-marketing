import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ credits: user.credits, transactions });
}
