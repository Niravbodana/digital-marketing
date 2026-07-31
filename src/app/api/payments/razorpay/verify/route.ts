import { NextRequest, NextResponse } from "next/server";
import { getConfig, addCredits } from "@/lib/config";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, credits } = body;

  const secret = await getConfig("razorpay_key_secret");
  const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await addCredits(userId, parseInt(credits), "purchase", razorpay_payment_id);
  return NextResponse.json({ success: true, credits });
}
