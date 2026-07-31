import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const [packages, plans] = await Promise.all([
    prisma.creditPackage.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({ packages, plans });
}
