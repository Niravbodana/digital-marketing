import { prisma } from "./prisma";

let ready = false;

export async function ensureDatabase() {
  if (ready) return;
  try {
    await prisma.$queryRaw`SELECT 1 FROM User LIMIT 1`;
    ready = true;
  } catch {
    const { execSync } = await import("child_process");
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    ready = true;
  }
}
