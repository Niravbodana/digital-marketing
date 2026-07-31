import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();

  if (body.id) {
    const plan = await prisma.subscriptionPlan.update({ where: { id: body.id }, data: body });
    return NextResponse.json({ plan });
  }

  const slug = body.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
  const plan = await prisma.subscriptionPlan.create({
    data: {
      name: body.name,
      slug,
      priceInr: body.priceInr,
      originalPriceInr: body.originalPriceInr,
      creditsPerMonth: body.creditsPerMonth,
      billingPeriod: body.billingPeriod || "monthly",
      badge: body.badge,
      features: body.features ? JSON.stringify(body.features) : null,
      popular: body.popular || false,
      active: true,
      sortOrder: body.sortOrder || 0,
    },
  });
  return NextResponse.json({ plan });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await req.json();
  await prisma.subscriptionPlan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
