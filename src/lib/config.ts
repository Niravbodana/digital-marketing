import { prisma } from "./prisma";

export type ConfigDef = {
  key: string;
  category: string;
  label: string;
  description?: string;
  type: "text" | "secret" | "url" | "number" | "boolean" | "textarea" | "json";
  isSecret?: boolean;
  defaultValue?: string;
  sortOrder: number;
};

export const CONFIG_REGISTRY: ConfigDef[] = [
  // General
  { key: "app_name", category: "general", label: "App Name", defaultValue: "Bodana Digital", type: "text", sortOrder: 1 },
  { key: "app_tagline", category: "general", label: "Tagline", defaultValue: "The ultimate creation machine", type: "text", sortOrder: 2 },
  { key: "app_url", category: "general", label: "App URL", defaultValue: "http://localhost:3000", type: "url", sortOrder: 3 },
  { key: "support_email", category: "general", label: "Support Email", defaultValue: "support@bodana.digital", type: "text", sortOrder: 4 },
  { key: "default_credits", category: "general", label: "Free Credits (new users)", defaultValue: "100", type: "number", sortOrder: 5 },

  // Branding / White-label
  { key: "brand_logo_url", category: "branding", label: "Logo URL", type: "url", sortOrder: 1 },
  { key: "brand_primary_color", category: "branding", label: "Primary Color", defaultValue: "#f97316", type: "text", sortOrder: 2 },
  { key: "brand_secondary_color", category: "branding", label: "Secondary Color", defaultValue: "#a855f7", type: "text", sortOrder: 3 },
  { key: "brand_favicon_url", category: "branding", label: "Favicon URL", type: "url", sortOrder: 4 },
  { key: "custom_css", category: "branding", label: "Custom CSS", type: "textarea", sortOrder: 5 },
  { key: "footer_text", category: "branding", label: "Footer Text", defaultValue: "© Bodana Digital", type: "text", sortOrder: 6 },

  // AI
  { key: "openai_api_key", category: "ai", label: "OpenAI API Key", type: "secret", isSecret: true, sortOrder: 1 },
  { key: "openai_model", category: "ai", label: "OpenAI Model", defaultValue: "gpt-4o-mini", type: "text", sortOrder: 2 },
  { key: "dalle_enabled", category: "ai", label: "DALL-E Image Gen", defaultValue: "true", type: "boolean", sortOrder: 3 },
  { key: "replicate_api_key", category: "ai", label: "Replicate API Key (video)", type: "secret", isSecret: true, sortOrder: 4 },
  { key: "elevenlabs_api_key", category: "ai", label: "ElevenLabs API Key (voice)", type: "secret", isSecret: true, sortOrder: 5 },
  { key: "credit_cost_text", category: "ai", label: "Credits per text gen", defaultValue: "1", type: "number", sortOrder: 6 },
  { key: "credit_cost_image", category: "ai", label: "Credits per image", defaultValue: "5", type: "number", sortOrder: 7 },
  { key: "credit_cost_video", category: "ai", label: "Credits per video", defaultValue: "20", type: "number", sortOrder: 8 },
  { key: "credit_cost_audio", category: "ai", label: "Credits per audio/voice", defaultValue: "8", type: "number", sortOrder: 9 },
  { key: "replicate_video_model", category: "ai", label: "Replicate Video Model", defaultValue: "minimax/video-01", type: "text", sortOrder: 10 },

  // Razorpay
  { key: "razorpay_key_id", category: "payments", label: "Razorpay Key ID", type: "secret", isSecret: true, sortOrder: 1 },
  { key: "razorpay_key_secret", category: "payments", label: "Razorpay Key Secret", type: "secret", isSecret: true, sortOrder: 2 },
  { key: "razorpay_webhook_secret", category: "payments", label: "Razorpay Webhook Secret", type: "secret", isSecret: true, sortOrder: 3 },
  { key: "razorpay_enabled", category: "payments", label: "Payments Enabled", defaultValue: "false", type: "boolean", sortOrder: 4 },

  // Social / Meta
  { key: "meta_app_id", category: "social", label: "Meta App ID", type: "text", sortOrder: 1 },
  { key: "meta_app_secret", category: "social", label: "Meta App Secret", type: "secret", isSecret: true, sortOrder: 2 },
  { key: "meta_redirect_uri", category: "social", label: "Meta OAuth Redirect URI", type: "url", sortOrder: 3 },
  { key: "postiz_url", category: "social", label: "Postiz URL", defaultValue: "http://localhost:4007", type: "url", sortOrder: 4 },
  { key: "postiz_api_key", category: "social", label: "Postiz API Key", type: "secret", isSecret: true, sortOrder: 5 },
  { key: "linkedin_client_id", category: "social", label: "LinkedIn Client ID", type: "text", sortOrder: 6 },
  { key: "linkedin_client_secret", category: "social", label: "LinkedIn Client Secret", type: "secret", isSecret: true, sortOrder: 7 },

  // Email
  { key: "smtp_host", category: "email", label: "SMTP Host", type: "text", sortOrder: 1 },
  { key: "smtp_port", category: "email", label: "SMTP Port", defaultValue: "587", type: "number", sortOrder: 2 },
  { key: "smtp_user", category: "email", label: "SMTP User", type: "text", sortOrder: 3 },
  { key: "smtp_pass", category: "email", label: "SMTP Password", type: "secret", isSecret: true, sortOrder: 4 },
  { key: "email_from", category: "email", label: "From Email", type: "text", sortOrder: 5 },

  // Storage
  { key: "storage_provider", category: "storage", label: "Storage Provider", defaultValue: "local", type: "text", sortOrder: 1 },
  { key: "s3_bucket", category: "storage", label: "S3 Bucket", type: "text", sortOrder: 2 },
  { key: "s3_region", category: "storage", label: "S3 Region", type: "text", sortOrder: 3 },
  { key: "s3_access_key", category: "storage", label: "S3 Access Key", type: "secret", isSecret: true, sortOrder: 4 },
  { key: "s3_secret_key", category: "storage", label: "S3 Secret Key", type: "secret", isSecret: true, sortOrder: 5 },
  { key: "cloudflare_r2_url", category: "storage", label: "Cloudflare R2 URL", type: "url", sortOrder: 6 },

  // Features
  { key: "feature_chat", category: "features", label: "Chat Refine", defaultValue: "true", type: "boolean", sortOrder: 1 },
  { key: "feature_scheduler", category: "features", label: "Post Scheduler", defaultValue: "true", type: "boolean", sortOrder: 2 },
  { key: "feature_teams", category: "features", label: "Teams", defaultValue: "true", type: "boolean", sortOrder: 3 },
  { key: "feature_white_label", category: "features", label: "White Label", defaultValue: "true", type: "boolean", sortOrder: 4 },
  { key: "feature_video_gen", category: "features", label: "Video Generation", defaultValue: "true", type: "boolean", sortOrder: 5 },
  { key: "feature_voice_gen", category: "features", label: "Voice Generation", defaultValue: "true", type: "boolean", sortOrder: 6 },
  { key: "maintenance_mode", category: "features", label: "Maintenance Mode", defaultValue: "false", type: "boolean", sortOrder: 7 },
];

const cache = new Map<string, string>();
let cacheTime = 0;

export async function seedConfig() {
  for (const def of CONFIG_REGISTRY) {
    await prisma.siteConfig.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        value: def.defaultValue || "",
        category: def.category,
        label: def.label,
        description: def.description,
        type: def.type,
        isSecret: def.isSecret || false,
        sortOrder: def.sortOrder,
      },
      update: { label: def.label, category: def.category, type: def.type },
    });
  }
}

export async function getConfig(key: string): Promise<string> {
  if (Date.now() - cacheTime < 30000 && cache.has(key)) return cache.get(key)!;
  const row = await prisma.siteConfig.findUnique({ where: { key } });
  const val = row?.value || process.env[key.toUpperCase()] || CONFIG_REGISTRY.find((c) => c.key === key)?.defaultValue || "";
  cache.set(key, val);
  return val;
}

export async function getAllConfig(includeSecrets = false) {
  await seedConfig();
  const rows = await prisma.siteConfig.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return rows.map((r) => ({
    ...r,
    value: r.isSecret && !includeSecrets && r.value ? "••••••••" + r.value.slice(-4) : r.value,
    rawValue: includeSecrets ? r.value : undefined,
  }));
}

export async function setConfig(key: string, value: string) {
  const def = CONFIG_REGISTRY.find((c) => c.key === key);
  await prisma.siteConfig.upsert({
    where: { key },
    create: {
      key,
      value,
      category: def?.category || "custom",
      label: def?.label || key,
      type: def?.type || "text",
      isSecret: def?.isSecret || false,
      sortOrder: def?.sortOrder || 99,
    },
    update: { value },
  });
  cache.set(key, value);
  cacheTime = Date.now();
}

export async function deleteConfig(key: string) {
  await prisma.siteConfig.delete({ where: { key } }).catch(() => null);
  cache.delete(key);
}

export const CONFIG_CATEGORIES = [
  { id: "general", name: "General", icon: "⚙️" },
  { id: "branding", name: "Branding & White-label", icon: "🎨" },
  { id: "ai", name: "AI & Models", icon: "🤖" },
  { id: "payments", name: "Razorpay & Credits", icon: "💳" },
  { id: "social", name: "Social & Postiz", icon: "📱" },
  { id: "email", name: "Email / SMTP", icon: "📧" },
  { id: "storage", name: "Storage & CDN", icon: "☁️" },
  { id: "features", name: "Feature Flags", icon: "🚩" },
];

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const val = await getConfig(key);
  return val === "true";
}

export async function getOpenAIClient() {
  const OpenAI = (await import("openai")).default;
  const key = await getConfig("openai_api_key");
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function deductCredits(userId: string, amount: number, description: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.credits < amount) throw new Error("Insufficient credits");
  await prisma.user.update({ where: { id: userId }, data: { credits: { decrement: amount } } });
  await prisma.creditTransaction.create({ data: { userId, amount: -amount, type: "usage", description } });
}

export async function addCredits(userId: string, amount: number, type: string, razorpayId?: string) {
  await prisma.user.update({ where: { id: userId }, data: { credits: { increment: amount } } });
  await prisma.creditTransaction.create({ data: { userId, amount, type, razorpayId, description: `+${amount} credits` } });
}
