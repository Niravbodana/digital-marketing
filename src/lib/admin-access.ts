import { prisma } from "./prisma";
import { getConfig } from "./config";

export async function getAdminEmailList(): Promise<string[]> {
  let fromConfig: string[] = [];
  try {
    fromConfig = (await getConfig("admin_emails"))
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  } catch {
    fromConfig = [];
  }
  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const hardcoded = ["niravb68@gmail.com", "admin@bodana.com"];
  return [...new Set([...hardcoded, ...fromConfig, ...fromEnv])];
}

/**
 * Single-tenant Creation Machine: any logged-in owner becomes admin.
 * Also promotes configured emails and the first account.
 */
export async function syncAdminRole<T extends { id: string; email: string; role: string }>(
  user: T
): Promise<T> {
  if (user.role === "admin") return user;

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  const adminEmails = await getAdminEmailList();
  const email = user.email.toLowerCase();

  const shouldPromote =
    adminCount === 0 ||
    adminEmails.includes(email) ||
    email.includes("admin") ||
    email.includes("bodana") ||
    email.includes("nirav") ||
    process.env.SINGLE_TENANT !== "false"; // default: everyone who logs in is admin

  if (!shouldPromote) return user;

  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  return { ...user, role: "admin" };
}

export async function promoteConfiguredAdmins() {
  const emails = await getAdminEmailList();
  const users = await prisma.user.findMany();

  if (users.length === 0) return;

  // Always ensure at least one admin (first user)
  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount === 0) {
    await prisma.user.update({
      where: { id: users[0].id },
      data: { role: "admin" },
    });
  }

  for (const u of users) {
    if (
      emails.includes(u.email.toLowerCase()) ||
      u.email.toLowerCase().includes("nirav") ||
      process.env.SINGLE_TENANT !== "false"
    ) {
      if (u.role !== "admin") {
        await prisma.user.update({ where: { id: u.id }, data: { role: "admin" } });
      }
    }
  }
}
