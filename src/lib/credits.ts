import { prisma } from "./prisma";
import { getConfig } from "./config";

export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
  return user?.credits ?? 0;
}

export async function getDefaultSignupCredits(): Promise<number> {
  const val = await getConfig("default_credits");
  return parseInt(val || "100", 10) || 100;
}

export async function getCreditCost(type: "text" | "image" | "video"): Promise<number> {
  const key = type === "text" ? "credit_cost_text" : type === "image" ? "credit_cost_image" : "credit_cost_video";
  const val = await getConfig(key);
  return parseInt(val || "1", 10) || 1;
}
