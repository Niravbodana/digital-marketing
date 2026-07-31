import { prisma } from "./prisma";

export type LLMProvider = "openai" | "groq" | "google" | "anthropic";

export type LLMMessage = { role: "system" | "user" | "assistant"; content: string };

export type LLMResult = {
  content: string;
  provider: LLMProvider;
  model: string;
  keyId?: string;
};

const MODEL_CACHE = new Map<string, string>();

const PREFERRED_MODELS: Record<LLMProvider, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  google: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
  anthropic: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
};

export function detectProviderFromKey(key: string): LLMProvider | null {
  const k = key.trim();
  if (k.startsWith("sk-ant-")) return "anthropic";
  if (k.startsWith("gsk_")) return "groq";
  if (k.startsWith("AIza")) return "google";
  if (k.startsWith("sk-") || k.startsWith("sk_proj")) return "openai";
  return null;
}

export function detectProviderFromKeyAny(key: string): string {
  const llm = detectProviderFromKey(key);
  if (llm) return llm;
  if (key.startsWith("r8_") || key.length > 30) return "replicate";
  if (key.length > 20) return "openai";
  return "custom";
}

async function getActiveLLMKeys() {
  const { getActiveLLMKeys: loadKeys } = await import("./llm-keys");
  return loadKeys();
}

async function resolveModel(provider: LLMProvider, key: string): Promise<string> {
  const cacheKey = `${provider}:${key.slice(-6)}`;
  if (MODEL_CACHE.has(cacheKey)) return MODEL_CACHE.get(cacheKey)!;

  let model = PREFERRED_MODELS[provider][0];

  try {
    if (provider === "openai") {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: key });
      const list = await client.models.list();
      const ids = list.data.map((m) => m.id);
      model = PREFERRED_MODELS.openai.find((m) => ids.includes(m)) || ids.find((id) => id.includes("gpt-4")) || ids[0] || model;
    } else if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ids = (data.data || []).map((m: { id: string }) => m.id);
        model = PREFERRED_MODELS.groq.find((m) => ids.includes(m)) || ids[0] || model;
      }
    } else if (provider === "google") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (res.ok) {
        const data = await res.json();
        const ids = (data.models || []).map((m: { name: string }) => m.name.replace("models/", ""));
        model = PREFERRED_MODELS.google.find((m) => ids.some((id: string) => id.includes(m))) || "gemini-2.0-flash";
      }
    }
  } catch {
    // use default
  }

  MODEL_CACHE.set(cacheKey, model);
  return model;
}

async function markKeyStatus(id: string, status: "online" | "offline" | "exhausted") {
  if (id.startsWith("config-") || id.startsWith("env-")) return;
  await prisma.apiKeyEntry.update({
    where: { id },
    data: { status, lastCheck: new Date() },
  }).catch(() => null);
}

function isRateLimitOrExhausted(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /rate.?limit|quota|exceeded|insufficient|429|402|billing|credit/i.test(msg);
}

async function callOpenAI(key: string, model: string, messages: LLMMessage[]): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: key });
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  });
  return res.choices[0]?.message?.content || "";
}

async function callGroq(key: string, model: string, messages: LLMMessage[]): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGoogle(key: string, model: string, messages: LLMMessage[]): Promise<string> {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callAnthropic(key: string, model: string, messages: LLMMessage[]): Promise<string> {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function chatComplete(
  messages: LLMMessage[],
  options?: { timeoutMs?: number }
): Promise<LLMResult> {
  const keys = await getActiveLLMKeys();
  if (keys.length === 0) {
    throw new Error("No AI API keys configured. Add OpenAI, Groq, or Gemini key in Admin → API Key Vault.");
  }

  const timeout = options?.timeoutMs ?? 60000;
  let lastError: Error | null = null;

  for (const entry of keys) {
    try {
      const model = await resolveModel(entry.provider, entry.keyValue);
      const content = await Promise.race([
        (async () => {
          switch (entry.provider) {
            case "openai": return callOpenAI(entry.keyValue, model, messages);
            case "groq": return callGroq(entry.keyValue, model, messages);
            case "google": return callGoogle(entry.keyValue, model, messages);
            case "anthropic": return callAnthropic(entry.keyValue, model, messages);
            default: throw new Error("Unsupported provider");
          }
        })(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
      ]);

      await markKeyStatus(entry.id, "online");
      return { content, provider: entry.provider, model, keyId: entry.id };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const exhausted = isRateLimitOrExhausted(e);
      await markKeyStatus(entry.id, exhausted ? "exhausted" : "offline");
      continue;
    }
  }

  throw lastError || new Error("All API keys failed");
}

export async function hasAnyLLMKey(): Promise<boolean> {
  const keys = await getActiveLLMKeys();
  return keys.length > 0;
}

export async function smartAddKey(keyValue: string): Promise<{
  provider: string;
  model: string;
  status: string;
  message: string;
  id?: string;
}> {
  const trimmed = keyValue.trim();
  const provider = detectProviderFromKey(trimmed) || detectProviderFromKeyAny(trimmed);

  let model = "";
  if (detectProviderFromKey(trimmed)) {
    model = await resolveModel(detectProviderFromKey(trimmed)!, trimmed);
  }

  const label = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Auto-${Date.now().toString(36)}`;
  const entry = await prisma.apiKeyEntry.create({
    data: {
      provider,
      label,
      keyValue: trimmed,
      priority: 10,
      isActive: true,
      isCustom: provider === "custom",
      metadata: model ? JSON.stringify({ model, autoDetected: true }) : JSON.stringify({ autoDetected: true }),
    },
  });

  const { testVaultKey } = await import("./api-keys");
  const test = await testVaultKey(entry.id);

  return {
    provider,
    model: model || "auto",
    status: test.status,
    message: test.message,
    id: entry.id,
  };
}
