import crypto from "crypto";
import { getConfig } from "./config";

export async function getRazorpayKeys() {
  const [keyId, keySecret] = await Promise.all([
    getConfig("razorpay_key_id"),
    getConfig("razorpay_key_secret"),
  ]);
  return { keyId, keySecret };
}

export async function isRazorpayConfigured(): Promise<boolean> {
  const { keyId, keySecret } = await getRazorpayKeys();
  return Boolean(keyId && keySecret);
}

export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const { keySecret } = await getRazorpayKeys();
  if (!keySecret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expected === signature;
}

export async function verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
  const webhookSecret = await getConfig("razorpay_webhook_secret");
  if (!webhookSecret) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return expected === signature;
}
