import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ promos });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();

  if (body.id) {
    const promo = await prisma.promoCode.update({
      where: { id: body.id },
      data: {
        code: body.code?.toUpperCase(),
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        bonusCredits: body.bonusCredits,
        maxUses: body.maxUses,
        minPurchase: body.minPurchase,
        active: body.active,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json({ promo });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: body.code.toUpperCase(),
      description: body.description,
      discountType: body.discountType || "percent",
      discountValue: body.discountValue || 0,
      bonusCredits: body.bonusCredits || 0,
      maxUses: body.maxUses || 0,
      minPurchase: body.minPurchase || 0,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      active: true,
    },
  });
  return NextResponse.json({ promo });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await req.json();
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
