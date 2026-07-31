import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { isPostizConfigured, publishToPostiz } from "@/lib/postiz";

export async function POST() {
  await ensureDatabase();
  const now = new Date();
  const due = await prisma.scheduledJob.findMany({
    where: { status: "pending", scheduledAt: { lte: now } },
    take: 10,
    include: { user: true },
  });

  const results = [];
  for (const job of due) {
    try {
      const payload = JSON.parse(job.payload);
      if (payload.postId) {
        const post = await prisma.post.findUnique({ where: { id: payload.postId } });
        if (post) {
          const caption = [post.caption, post.hashtags?.split(",").map((t) => `#${t.trim()}`).join(" ")].filter(Boolean).join("\n\n");
          if (await isPostizConfigured()) {
            await publishToPostiz({ content: caption, platforms: [job.platform], mediaUrls: post.imageUrl ? [post.imageUrl] : undefined });
          }
          await prisma.post.update({ where: { id: payload.postId }, data: { status: "published", publishedAt: now } });
        }
      }
      await prisma.scheduledJob.update({ where: { id: job.id }, data: { status: "completed", executedAt: now } });
      results.push({ id: job.id, status: "completed" });
    } catch (e) {
      await prisma.scheduledJob.update({
        where: { id: job.id },
        data: { status: "failed", error: e instanceof Error ? e.message : "error" },
      });
      results.push({ id: job.id, status: "failed" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
