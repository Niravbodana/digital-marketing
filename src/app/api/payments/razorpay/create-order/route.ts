import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const keyId = await getConfig("razorpay_key_id");
  const keySecret = await getConfig("razorpay_key_secret");
  const enabled = await getConfig("razorpay_enabled");

  if (enabled !== "true" || !keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured in Admin Panel" }, { status: 400 });
  }

  const { packageId } = await req.json();
  const { prisma } = await import("@/lib/prisma");
  const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const Razorpay = (await import("razorpay")).default;
  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

  const order = await rzp.orders.create({
    amount: pkg.priceInr * 100,
    currency: "INR",
    receipt: `credits_${user.id}_${Date.now()}`,
    notes: { userId: user.id, packageId: pkg.id, credits: String(pkg.credits) },
  });

  return NextResponse.json({ orderId: order.id, amount: pkg.priceInr, credits: pkg.credits, keyId });
}
