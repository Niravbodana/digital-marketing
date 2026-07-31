/**
 * Bootstrap LLM keys from environment only (never hardcode secrets in git).
 * Put keys in bodana-digital/.env — see .env.example
 */
import { prisma } from "./prisma";
import { setConfig } from "./config";

const BOOTSTRAP_ENV = [
  { provider: "groq", label: "Groq Primary", env: "GROQ_API_KEY", priority: 20 },
  { provider: "google", label: "Gemini Primary", env: "GOOGLE_API_KEY", priority: 18 },
  { provider: "google", label: "Gemini Primary", env: "GEMINI_API_KEY", priority: 18 },
  { provider: "openai", label: "OpenAI Primary", env: "OPENAI_API_KEY", priority: 20 },
  { provider: "anthropic", label: "Claude Primary", env: "ANTHROPIC_API_KEY", priority: 17 },
] as const;

export async function bootstrapDefaultKeys(): Promise<void> {
  for (const row of BOOTSTRAP_ENV) {
    const value = (process.env[row.env] || "").trim();
    if (!value || value.length < 10 || value.includes("your-")) continue;

    const exists = await prisma.apiKeyEntry.findFirst({
      where: {
        OR: [{ keyValue: value }, { provider: row.provider, label: row.label }],
      },
    });

    if (exists) {
      await prisma.apiKeyEntry.update({
        where: { id: exists.id },
        data: {
          keyValue: value,
          provider: row.provider,
          label: row.label,
          isActive: true,
          status: "online",
          priority: row.priority,
          lastCheck: new Date(),
        },
      });
    } else {
      await prisma.apiKeyEntry.create({
        data: {
          provider: row.provider,
          label: row.label,
          keyValue: value,
          priority: row.priority,
          isActive: true,
          status: "online",
          lastCheck: new Date(),
          metadata: JSON.stringify({ fromEnv: row.env }),
        },
      });
    }

    if (row.provider === "google" && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = value;
    }
    if (row.provider === "openai") {
      await setConfig("openai_api_key", value).catch(() => null);
    }
  }

  const adminEmails = process.env.ADMIN_EMAILS || "niravb68@gmail.com";
  await setConfig("admin_emails", adminEmails).catch(() => null);
}
