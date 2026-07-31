import { prisma } from "./prisma";

export type PromoResult = {
  valid: boolean;
  discountType: string;
  discountValue: number;
  bonusCredits: number;
  finalPrice?: number;
  message: string;
};

export async function validatePromo(code: string, userId: string, purchaseAmount = 0): Promise<PromoResult> {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo || !promo.active) {
    return { valid: false, discountType: "", discountValue: 0, bonusCredits: 0, message: "Invalid promo code" };
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false, discountType: "", discountValue: 0, bonusCredits: 0, message: "Promo code expired" };
  }
  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
    return { valid: false, discountType: "", discountValue: 0, bonusCredits: 0, message: "Promo code fully redeemed" };
  }
  if (promo.minPurchase > 0 && purchaseAmount < promo.minPurchase) {
    return { valid: false, discountType: "", discountValue: 0, bonusCredits: 0, message: `Minimum purchase ₹${promo.minPurchase} required` };
  }

  const existing = await prisma.promoRedemption.findFirst({
    where: { userId, promoId: promo.id },
  });
  if (existing && promo.discountType !== "bonus_credits") {
    return { valid: false, discountType: "", discountValue: 0, bonusCredits: 0, message: "You already used this code" };
  }

  let finalPrice = purchaseAmount;
  if (promo.discountType === "percent" && purchaseAmount > 0) {
    finalPrice = Math.max(0, Math.round(purchaseAmount * (1 - promo.discountValue / 100)));
  } else if (promo.discountType === "fixed" && purchaseAmount > 0) {
    finalPrice = Math.max(0, purchaseAmount - promo.discountValue);
  }

  return {
    valid: true,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    bonusCredits: promo.bonusCredits,
    finalPrice,
    message: promo.description || "Promo applied!",
  };
}

export async function redeemPromo(code: string, userId: string): Promise<PromoResult> {
  const result = await validatePromo(code, userId);
  if (!result.valid) return result;

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo) return { valid: false, discountType: "", discountValue: 0, bonusCredits: 0, message: "Invalid code" };

  if (promo.discountType === "bonus_credits" && promo.bonusCredits > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: promo.bonusCredits } },
    });
    await prisma.creditTransaction.create({
      data: { userId, amount: promo.bonusCredits, type: "bonus", description: `Promo: ${promo.code}` },
    });
  }

  await prisma.promoRedemption.create({ data: { userId, promoId: promo.id } });
  await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });

  return { ...result, message: `✅ ${promo.bonusCredits ? promo.bonusCredits + " bonus credits added!" : "Promo applied!"}` };
}

export async function applyPromoToOrder(code: string, userId: string, amount: number): Promise<{ finalAmount: number; promoId?: string }> {
  const result = await validatePromo(code, userId, amount);
  if (!result.valid) throw new Error(result.message);
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  return { finalAmount: result.finalPrice ?? amount, promoId: promo?.id };
}

export async function markPromoUsed(promoId: string, userId: string) {
  await prisma.promoRedemption.create({ data: { userId, promoId } });
  await prisma.promoCode.update({ where: { id: promoId }, data: { usedCount: { increment: 1 } } });
}
