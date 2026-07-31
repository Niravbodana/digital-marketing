import { prisma } from "./prisma";
import { loadEnvFiles } from "./load-env";

let ready = false;
let initDone = false;

export async function ensureDatabase() {
  loadEnvFiles();
  if (ready && initDone) return;
  if (!ready) {
    try {
      await prisma.$queryRaw`SELECT 1 FROM User LIMIT 1`;
      ready = true;
    } catch {
      const { execSync } = await import("child_process");
      execSync("npx prisma db push --skip-generate", { stdio: "inherit", cwd: process.cwd() });
      ready = true;
    }
  }
  if (!initDone) {
    const { initializeApp } = await import("./init");
    await initializeApp();
    const { promoteConfiguredAdmins } = await import("./admin-access");
    await promoteConfiguredAdmins();
    initDone = true;
  }
}
