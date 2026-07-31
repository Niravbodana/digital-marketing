import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const packages = await prisma.creditPackage.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  if (body.id) {
    const pkg = await prisma.creditPackage.update({ where: { id: body.id }, data: body });
    return NextResponse.json({ package: pkg });
  }
  const pkg = await prisma.creditPackage.create({
    data: { name: body.name, credits: body.credits, priceInr: body.priceInr, active: true, sortOrder: body.sortOrder || 0 },
  });
  return NextResponse.json({ package: pkg });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await req.json();
  await prisma.creditPackage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
