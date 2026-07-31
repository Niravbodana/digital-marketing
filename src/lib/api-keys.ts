import { prisma } from "./prisma";
import { getConfig } from "./config";

export const API_PROVIDERS = [
  { id: "openai", name: "OpenAI", icon: "🤖", hint: "sk-..." },
  { id: "groq", name: "Groq (Free/Fast)", icon: "⚡", hint: "gsk_..." },
  { id: "google", name: "Google Gemini", icon: "🔍", hint: "AIza..." },
  { id: "anthropic", name: "Anthropic Claude", icon: "🧠", hint: "sk-ant-..." },
  { id: "elevenlabs", name: "ElevenLabs", icon: "🎙️" },
  { id: "replicate", name: "Replicate (Video)", icon: "🎬" },
  { id: "stability", name: "Stability AI", icon: "🖼️" },
  { id: "runway", name: "Runway ML", icon: "🎥" },
  { id: "razorpay", name: "Razorpay", icon: "💳" },
  { id: "postiz", name: "Postiz", icon: "📱" },
  { id: "meta", name: "Meta", icon: "📘" },
  { id: "stripe", name: "Stripe", icon: "💰" },
  { id: "custom", name: "Custom Provider", icon: "🔑" },
];

const CONFIG_FALLBACK: Record<string, string> = {
  openai: "openai_api_key",
  elevenlabs: "elevenlabs_api_key",
  replicate: "replicate_api_key",
  razorpay_id: "razorpay_key_id",
  razorpay_secret: "razorpay_key_secret",
  postiz: "postiz_api_key",
  meta: "meta_app_secret",
};

export async function getVaultKey(provider: string, label?: string): Promise<string | null> {
  const where: { provider: string; isActive: boolean; label?: string } = { provider, isActive: true };
  if (label) where.label = label;

  const entries = await prisma.apiKeyEntry.findMany({
    where,
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  });

  for (const entry of entries) {
    if (entry.keyValue && entry.keyValue.length > 3) return entry.keyValue;
  }

  const fallbackKey = CONFIG_FALLBACK[provider];
  if (fallbackKey) {
    const val = await getConfig(fallbackKey);
    if (val && val.length > 3) return val;
  }
  return null;
}

export async function getAllVaultKeys(provider?: string) {
  return prisma.apiKeyEntry.findMany({
    where: provider ? { provider } : undefined,
    orderBy: [{ provider: "asc" }, { priority: "desc" }],
    select: {
      id: true, provider: true, label: true, status: true, priority: true,
      isActive: true, isCustom: true, endpoint: true, lastCheck: true, createdAt: true,
      keyValue: true,
    },
  });
}

export async function getVaultKeyMasked(provider?: string) {
  const keys = await getAllVaultKeys(provider);
  return keys.map((k) => ({
    ...k,
    keyValue: k.keyValue ? "••••••••" + k.keyValue.slice(-4) : "",
  }));
}

export async function testVaultKey(id: string): Promise<{ status: string; message: string }> {
  const entry = await prisma.apiKeyEntry.findUnique({ where: { id } });
  if (!entry) return { status: "offline", message: "Not found" };

  try {
    switch (entry.provider) {
      case "openai": {
        const OpenAI = (await import("openai")).default;
        const client = new OpenAI({ apiKey: entry.keyValue });
        await client.models.list();
        break;
      }
      case "groq": {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${entry.keyValue}` },
        });
        if (!res.ok) throw new Error("Invalid Groq key");
        break;
      }
      case "google": {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${entry.keyValue}`);
        if (!res.ok) throw new Error("Invalid Gemini key");
        break;
      }
      case "anthropic": {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": entry.keyValue,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 10,
            messages: [{ role: "user", content: "hi" }],
          }),
        });
        if (!res.ok) throw new Error("Invalid Anthropic key");
        break;
      }
      case "elevenlabs": {
        const res = await fetch("https://api.elevenlabs.io/v1/voices", {
          headers: { "xi-api-key": entry.keyValue },
        });
        if (!res.ok) throw new Error("Invalid key");
        break;
      }
      case "replicate": {
        const res = await fetch("https://api.replicate.com/v1/models", {
          headers: { Authorization: `Bearer ${entry.keyValue}` },
        });
        if (!res.ok) throw new Error("Invalid key");
        break;
      }
      case "postiz": {
        const url = await getConfig("postiz_url");
        const res = await fetch(`${url}/api/public/v1/integrations`, {
          headers: { Authorization: entry.keyValue },
        });
        if (!res.ok) throw new Error("Postiz unreachable");
        break;
      }
      default:
        if (entry.keyValue.length < 8) throw new Error("Key too short");
    }
    await prisma.apiKeyEntry.update({
      where: { id },
      data: { status: "online", lastCheck: new Date() },
    });
    return { status: "online", message: "Connected successfully" };
  } catch (e) {
    await prisma.apiKeyEntry.update({
      where: { id },
      data: { status: "offline", lastCheck: new Date() },
    });
    return { status: "offline", message: e instanceof Error ? e.message : "Failed" };
  }
}

export async function tryWithFailover<T>(
  provider: string,
  fn: (key: string) => Promise<T>
): Promise<T> {
  const entries = await prisma.apiKeyEntry.findMany({
    where: { provider, isActive: true },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  });

  const keys = entries.map((e) => e.keyValue).filter((k) => k.length > 3);
  const fallback = await getVaultKey(provider);
  if (fallback && !keys.includes(fallback)) keys.push(fallback);

  let lastError: Error | null = null;
  for (const key of keys) {
    try {
      return await fn(key);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Unknown error");
    }
  }
  throw lastError || new Error(`No working ${provider} API key`);
}
