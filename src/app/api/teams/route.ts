import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const teams = await prisma.team.findMany({ include: { members: { select: { id: true, name: true, email: true, role: true } } } });
  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { name } = await req.json();
  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
  const team = await prisma.team.create({ data: { name, slug, ownerId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { teamId: team.id } });
  return NextResponse.json({ team });
}
