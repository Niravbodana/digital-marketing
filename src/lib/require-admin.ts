import { getSession } from "@/lib/auth";
import { syncAdminRole } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

/** Get session and ensure admin (single-tenant auto-promote). */
export async function requireAdmin() {
  let user = await getSession();
  if (!user) return null;
  user = await syncAdminRole(user);
  if (user.role !== "admin") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
    user = { ...user, role: "admin" };
  }
  return user;
}
