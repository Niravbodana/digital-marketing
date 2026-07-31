import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await ensureDatabase();
  const category = req.nextUrl.searchParams.get("category");
  const items = await prisma.showcaseItem.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();

  if (body.id) {
    const item = await prisma.showcaseItem.update({ where: { id: body.id }, data: body });
    return NextResponse.json({ item });
  }

  const item = await prisma.showcaseItem.create({ data: body });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await req.json();
  await prisma.showcaseItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
