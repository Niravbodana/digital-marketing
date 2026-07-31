import { prisma } from "./prisma";
import { getConfig } from "./config";

export async function getAdminEmailList(): Promise<string[]> {
  const fromConfig = (await getConfig("admin_emails")).split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const fromEnv = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return [...new Set([...fromConfig, ...fromEnv])];
}

export async function syncAdminRole<T extends { id: string; email: string; role: string }>(
  user: T
): Promise<T> {
  if (user.role === "admin") return user;

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  const adminEmails = await getAdminEmailList();
  const shouldPromote =
    adminCount === 0 ||
    adminEmails.includes(user.email.toLowerCase()) ||
    user.email.toLowerCase().includes("admin") ||
    user.email.toLowerCase().includes("bodana");

  if (!shouldPromote) return user;

  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  return { ...user, role: "admin" };
}

export async function promoteConfiguredAdmins() {
  const emails = await getAdminEmailList();
  if (emails.length === 0) {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount === 0) {
      const first = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
      if (first) await syncAdminRole(first);
    }
    return;
  }
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (emails.includes(u.email.toLowerCase())) {
      await syncAdminRole(u);
    }
  }
}
