import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { writeKeysEnv, loadEnvFiles } from "@/lib/load-env";
import { bootstrapDefaultKeys } from "@/lib/bootstrap-keys";
import { getSession, createToken, setSessionCookie } from "@/lib/auth";
import { syncAdminRole } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

/** Save keys to keys.env + vault — no manual .env needed */
export async function POST(req: NextRequest) {
  loadEnvFiles();
  await ensureDatabase();

  const body = await req.json().catch(() => ({}));
  const groq = String(body.groq || body.GROQ_API_KEY || "").trim();
  const google = String(body.google || body.GOOGLE_API_KEY || body.gemini || "").trim();
  const openai = String(body.openai || body.OPENAI_API_KEY || "").trim();

  if (!groq && !google && !openai) {
    return NextResponse.json(
      { error: "Kam se kam ek key paste karo (Groq / Gemini / OpenAI)" },
      { status: 400 }
    );
  }

  const vars: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || "niravb68@gmail.com",
    SINGLE_TENANT: "true",
  };
  if (groq) vars.GROQ_API_KEY = groq;
  if (google) {
    vars.GOOGLE_API_KEY = google;
    vars.GEMINI_API_KEY = google;
  }
  if (openai) vars.OPENAI_API_KEY = openai;

  const filePath = writeKeysEnv(vars);
  await bootstrapDefaultKeys();

  // Promote current user if logged in
  let user = await getSession();
  if (user) {
    user = await syncAdminRole(user);
    if (user.role !== "admin") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
      user = { ...user, role: "admin" };
    }
    const token = await createToken(user.id, "admin");
    await setSessionCookie(token);
  }

  // Quick live test
  let groqOk = false;
  let googleOk = false;
  if (groq) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${groq}` },
      });
      groqOk = r.ok;
    } catch {
      groqOk = false;
    }
  }
  if (google) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(google)}`
      );
      googleOk = r.ok;
    } catch {
      googleOk = false;
    }
  }

  return NextResponse.json({
    success: true,
    file: "keys.env",
    path: filePath,
    groq: groqOk ? "online" : groq ? "saved" : "skipped",
    google: googleOk ? "online" : google ? "saved" : "skipped",
    message: "Keys save ho gayi. Ab /studio kholo.",
  });
}
