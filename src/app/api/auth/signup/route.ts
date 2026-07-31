import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: email.includes("admin") ? "admin" : "client",
    },
  });

  const token = await createToken(user.id, user.role);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
