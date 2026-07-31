import { seedConfig } from "./config";
import { prisma } from "./prisma";

const DEFAULT_PACKAGES = [
  { name: "Starter", credits: 100, priceInr: 99, originalPriceInr: 199, badge: null, billingPeriod: "one-time", highlight: false, sortOrder: 1, features: ["100 AI generations", "Image & text tools", "PDF export"] },
  { name: "Pro", credits: 500, priceInr: 399, originalPriceInr: 799, badge: "Popular", billingPeriod: "one-time", highlight: true, sortOrder: 2, features: ["500 credits", "DALL-E images", "Voice generation", "Chat refine"] },
  { name: "Agency", credits: 2000, priceInr: 1299, originalPriceInr: 2499, badge: "Best Value", billingPeriod: "one-time", highlight: false, sortOrder: 3, features: ["2000 credits", "Video generation", "Post scheduler", "Teams"] },
  { name: "Enterprise", credits: 10000, priceInr: 4999, originalPriceInr: 9999, badge: "Unlimited Power", billingPeriod: "one-time", highlight: false, sortOrder: 4, features: ["10000 credits", "All studios", "White-label", "Priority support"] },
];

const DEFAULT_PLANS = [
  { name: "Creator", slug: "creator-monthly", priceInr: 499, originalPriceInr: 999, creditsPerMonth: 300, billingPeriod: "monthly", badge: null, popular: false, sortOrder: 1, features: ["300 credits/month", "All text & image tools", "PDF/DOCX export", "Chat refine"] },
  { name: "Pro", slug: "pro-monthly", priceInr: 999, originalPriceInr: 1999, creditsPerMonth: 1000, billingPeriod: "monthly", badge: "Most Popular", popular: true, sortOrder: 2, features: ["1000 credits/month", "DALL-E + Voice + Video", "Post scheduler", "Social publishing"] },
  { name: "Agency", slug: "agency-monthly", priceInr: 2499, originalPriceInr: 4999, creditsPerMonth: 5000, billingPeriod: "monthly", badge: "For Teams", popular: false, sortOrder: 3, features: ["5000 credits/month", "Teams & white-label", "Autonomous agents", "Priority support"] },
  { name: "Annual Pro", slug: "pro-annual", priceInr: 7999, originalPriceInr: 11988, creditsPerMonth: 1000, billingPeriod: "yearly", badge: "Save 33%", popular: false, sortOrder: 4, features: ["12000 credits/year", "Everything in Pro", "2 months free", "Annual billing"] },
];

const DEFAULT_PROMOS = [
  { code: "WELCOME50", description: "50% off first purchase", discountType: "percent", discountValue: 50, bonusCredits: 0, maxUses: 1000 },
  { code: "BODANA100", description: "100 bonus credits free", discountType: "bonus_credits", discountValue: 0, bonusCredits: 100, maxUses: 500 },
  { code: "LAUNCH25", description: "25% off any plan", discountType: "percent", discountValue: 25, bonusCredits: 0, maxUses: 0 },
  { code: "VIP500", description: "500 bonus credits for VIP", discountType: "bonus_credits", discountValue: 0, bonusCredits: 500, maxUses: 50 },
];

export async function initializeApp() {
  await seedConfig();

  const pkgCount = await prisma.creditPackage.count();
  if (pkgCount === 0) {
    for (const p of DEFAULT_PACKAGES) {
      await prisma.creditPackage.create({
        data: { ...p, features: JSON.stringify(p.features), active: true },
      });
    }
  }

  const planCount = await prisma.subscriptionPlan.count();
  if (planCount === 0) {
    for (const p of DEFAULT_PLANS) {
      await prisma.subscriptionPlan.create({
        data: { ...p, features: JSON.stringify(p.features), active: true },
      });
    }
  }

  const promoCount = await prisma.promoCode.count();
  if (promoCount === 0) {
    for (const p of DEFAULT_PROMOS) {
      await prisma.promoCode.create({ data: { ...p, active: true } });
    }
  }
}
