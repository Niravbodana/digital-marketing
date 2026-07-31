import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const packages = await prisma.creditPackage.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, credits: true, priceInr: true },
  });
  return NextResponse.json({ packages });
}
