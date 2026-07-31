import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncAdminRole } from "@/lib/admin-access";

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const synced = await syncAdminRole(user);
  const token = await createToken(synced.id, synced.role);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: synced.id, name: synced.name, email: synced.email, role: synced.role, credits: synced.credits },
  });
}
