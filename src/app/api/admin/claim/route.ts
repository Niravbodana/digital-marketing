import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { getSession, createToken, setSessionCookie } from "@/lib/auth";
import { syncAdminRole, promoteConfiguredAdmins } from "@/lib/admin-access";
import { bootstrapDefaultKeys } from "@/lib/bootstrap-keys";
import { prisma } from "@/lib/prisma";

/** Force-promote current user to admin + seed API keys. Fixes /admin redirect to studio. */
export async function POST() {
  await ensureDatabase();
  await bootstrapDefaultKeys();
  await promoteConfiguredAdmins();

  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const synced = await syncAdminRole(user);
  // Hard promote if still not admin (single-tenant)
  if (synced.role !== "admin") {
    await prisma.user.update({ where: { id: synced.id }, data: { role: "admin" } });
    synced.role = "admin";
  }

  const token = await createToken(synced.id, "admin");
  await setSessionCookie(token);

  return NextResponse.json({
    success: true,
    user: {
      id: synced.id,
      name: synced.name,
      email: synced.email,
      role: "admin",
      credits: synced.credits,
    },
  });
}

export async function GET() {
  return POST();
}
