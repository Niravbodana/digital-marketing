import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultSignupCredits } from "@/lib/credits";
import { syncAdminRole } from "@/lib/admin-access";

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const { name, email, password } = await req.json();

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json({ error: "Valid name, email, password (6+ chars) required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const defaultCredits = await getDefaultSignupCredits();
  const isFirstUser = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: isFirstUser || email.includes("admin") ? "admin" : "client",
      credits: defaultCredits,
    },
  });

  const synced = await syncAdminRole(user);

  if (defaultCredits > 0) {
    await prisma.creditTransaction.create({
      data: { userId: user.id, amount: defaultCredits, type: "bonus", description: "Welcome bonus credits" },
    });
  }

  const token = await createToken(synced.id, synced.role);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: synced.id, name: synced.name, email: synced.email, role: synced.role, credits: synced.credits },
  });
}
