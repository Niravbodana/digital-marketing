import { ensureDatabase } from "./db-init";
import { seedConfig } from "./config";
import { prisma } from "./prisma";

const DEFAULT_PACKAGES = [
  { name: "Starter", credits: 100, priceInr: 99, sortOrder: 1 },
  { name: "Pro", credits: 500, priceInr: 399, sortOrder: 2 },
  { name: "Agency", credits: 2000, priceInr: 1299, sortOrder: 3 },
  { name: "Enterprise", credits: 10000, priceInr: 4999, sortOrder: 4 },
];

export async function initializeApp() {
  await ensureDatabase();
  await seedConfig();
  const count = await prisma.creditPackage.count();
  if (count === 0) {
    for (const p of DEFAULT_PACKAGES) {
      await prisma.creditPackage.create({ data: p });
    }
  }
}
