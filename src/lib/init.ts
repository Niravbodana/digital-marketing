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

const DEFAULT_SHOWCASE = [
  { type: "video", title: "Cinematic Commercial", subtitle: "30-sec agency spot", mediaUrl: "https://cdn.coverr.co/videos/coverr-a-woman-working-on-her-laptop-9765/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800", category: "hero", badge: "🔥 Trending", sortOrder: 1 },
  { type: "video", title: "UGC Ad Campaign", subtitle: "Scroll-stopping content", mediaUrl: "https://cdn.coverr.co/videos/coverr-vertical-video-of-a-woman-recording-a-vlog-5630/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800", category: "hero", badge: "Popular", sortOrder: 2 },
  { type: "image", title: "AI Product Photography", subtitle: "E-commerce ready", mediaUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", category: "gallery", sortOrder: 3 },
  { type: "image", title: "Brand Visual Art", subtitle: "Portfolio grade", mediaUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800", category: "gallery", sortOrder: 4 },
  { type: "video", title: "Music Video", subtitle: "Original track + visuals", mediaUrl: "https://cdn.coverr.co/videos/coverr-a-dj-mixing-music-9764/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", category: "gallery", sortOrder: 5 },
  { type: "image", title: "Social Ad Creative", subtitle: "Multi-platform ready", mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", category: "ad", badge: "Ad", sortOrder: 6 },
  { type: "image", title: "Pitch Deck Design", subtitle: "Investor ready", mediaUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800", category: "ad", sortOrder: 7 },
  { type: "video", title: "Explainer Video", subtitle: "Product demo", mediaUrl: "https://cdn.coverr.co/videos/coverr-team-meeting-in-a-modern-office-9763/1080p.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800", category: "ad", sortOrder: 8 },
  { type: "testimonial", title: "Rahul Sharma", subtitle: "Founder, TechStart India — \"Bodana replaced our entire creative agency. ₹2L/month saved.\"", mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", category: "testimonial", sortOrder: 9 },
  { type: "testimonial", title: "Priya Patel", subtitle: "Content Creator — \"94 tools, one platform. My reels get 10x more views now.\"", mediaUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", category: "testimonial", sortOrder: 10 },
  { type: "testimonial", title: "Amit Verma", subtitle: "Agency Owner — \"We white-label Bodana for 50+ clients. Revenue 3x in 6 months.\"", mediaUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", category: "testimonial", sortOrder: 11 },
];

const DEFAULT_KEY_SLOTS = [
  { provider: "openai", label: "Primary OpenAI", keyValue: "", priority: 10 },
  { provider: "openai", label: "Backup OpenAI", keyValue: "", priority: 5 },
  { provider: "elevenlabs", label: "Primary ElevenLabs", keyValue: "", priority: 10 },
  { provider: "replicate", label: "Primary Replicate", keyValue: "", priority: 10 },
  { provider: "anthropic", label: "Claude API", keyValue: "", priority: 8 },
  { provider: "google", label: "Google Gemini", keyValue: "", priority: 8 },
  { provider: "stability", label: "Stability AI", keyValue: "", priority: 5 },
  { provider: "postiz", label: "Postiz Main", keyValue: "", priority: 10 },
  { provider: "razorpay", label: "Razorpay Live", keyValue: "", priority: 10 },
];

const DEFAULT_PROMOS = [
  { code: "WELCOME50", description: "50% off first purchase", discountType: "percent", discountValue: 50, bonusCredits: 0, maxUses: 1000 },
  { code: "BODANA100", description: "100 bonus credits free", discountType: "bonus_credits", discountValue: 0, bonusCredits: 100, maxUses: 500 },
  { code: "LAUNCH25", description: "25% off any plan", discountType: "percent", discountValue: 25, bonusCredits: 0, maxUses: 0 },
  { code: "VIP500", description: "500 bonus credits for VIP", discountType: "bonus_credits", discountValue: 0, bonusCredits: 500, maxUses: 50 },
];

let initDone = false;

export async function initializeApp() {
  if (initDone) return;
  initDone = true;
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

  const showcaseCount = await prisma.showcaseItem.count();
  if (showcaseCount === 0) {
    for (const s of DEFAULT_SHOWCASE) {
      await prisma.showcaseItem.create({ data: { ...s, active: true } });
    }
  }

  const keyCount = await prisma.apiKeyEntry.count();
  if (keyCount === 0) {
    for (const k of DEFAULT_KEY_SLOTS) {
      await prisma.apiKeyEntry.create({ data: { ...k, isActive: true, status: "unknown" } });
    }
  }

  // Mirror .env LLM keys into vault so Admin + agent both see them
  const { syncEnvKeysToVault } = await import("./llm-keys");
  await syncEnvKeysToVault();
}
