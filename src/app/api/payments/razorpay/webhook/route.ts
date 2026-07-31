import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { addCredits } from "@/lib/config";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!(await verifyWebhookSignature(body, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const notes = payment.notes || {};
    if (notes.userId && notes.credits) {
      await addCredits(notes.userId, parseInt(notes.credits), "purchase", payment.id);
    }
  }

  return NextResponse.json({ received: true });
}
