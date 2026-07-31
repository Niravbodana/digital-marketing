import { prisma } from "./prisma";
import { getConfig } from "./config";

/**
 * Collect LLM keys from vault + SiteConfig + process.env
 * So .env keys work immediately without Admin paste.
 */
export async function getActiveLLMKeys(): Promise<
  Array<{ id: string; provider: "openai" | "groq" | "google" | "anthropic"; keyValue: string; priority: number }>
> {
  type P = "openai" | "groq" | "google" | "anthropic";
  const llmProviders: P[] = ["openai", "groq", "google", "anthropic"];
  const keys: Array<{ id: string; provider: P; keyValue: string; priority: number }> = [];

  const entries = await prisma.apiKeyEntry.findMany({
    where: { provider: { in: llmProviders }, isActive: true },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  });

  for (const e of entries) {
    if (e.keyValue && e.keyValue.length > 8 && !e.keyValue.includes("your-") && !e.keyValue.includes("sk-your")) {
      keys.push({ id: e.id, provider: e.provider as P, keyValue: e.keyValue.trim(), priority: e.priority });
    }
  }

  // SiteConfig openai_api_key
  const configOpenAI = await getConfig("openai_api_key");
  if (configOpenAI && configOpenAI.length > 8 && !configOpenAI.includes("your-") && !keys.find((k) => k.keyValue === configOpenAI)) {
    keys.push({ id: "config-openai", provider: "openai", keyValue: configOpenAI.trim(), priority: 1 });
  }

  // Environment variables (highest priority when present)
  const envMap: Array<{ env: string; provider: P; priority: number }> = [
    { env: "OPENAI_API_KEY", provider: "openai", priority: 20 },
    { env: "GROQ_API_KEY", provider: "groq", priority: 19 },
    { env: "GOOGLE_API_KEY", provider: "google", priority: 18 },
    { env: "GEMINI_API_KEY", provider: "google", priority: 18 },
    { env: "ANTHROPIC_API_KEY", provider: "anthropic", priority: 17 },
  ];

  for (const { env, provider, priority } of envMap) {
    const val = (process.env[env] || "").trim();
    if (val.length > 8 && !val.includes("your-") && !keys.find((k) => k.keyValue === val)) {
      keys.push({ id: `env-${env}`, provider, keyValue: val, priority });
    }
  }

  return keys.sort((a, b) => b.priority - a.priority);
}

/** On boot: if env has keys, mirror them into vault once so Admin shows them */
export async function syncEnvKeysToVault(): Promise<void> {
  const pairs: Array<{ provider: string; env: string; label: string }> = [
    { provider: "openai", env: "OPENAI_API_KEY", label: "Env OpenAI" },
    { provider: "groq", env: "GROQ_API_KEY", label: "Env Groq" },
    { provider: "google", env: "GOOGLE_API_KEY", label: "Env Google" },
    { provider: "google", env: "GEMINI_API_KEY", label: "Env Gemini" },
    { provider: "anthropic", env: "ANTHROPIC_API_KEY", label: "Env Anthropic" },
  ];

  for (const p of pairs) {
    const val = (process.env[p.env] || "").trim();
    if (!val || val.length < 10 || val.includes("your-")) continue;

    const existing = await prisma.apiKeyEntry.findFirst({
      where: { provider: p.provider, keyValue: val },
    });
    if (existing) continue;

    await prisma.apiKeyEntry.create({
      data: {
        provider: p.provider,
        label: p.label,
        keyValue: val,
        priority: 20,
        isActive: true,
        status: "online",
        metadata: JSON.stringify({ fromEnv: true, env: p.env }),
      },
    }).catch(() => null);

    if (p.provider === "openai") {
      const { setConfig } = await import("./config");
      await setConfig("openai_api_key", val).catch(() => null);
    }
  }
}
