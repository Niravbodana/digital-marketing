import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const jobs = await prisma.scheduledJob.findMany({
    where: { userId: user.id },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { postId, platform, scheduledAt, caption, hashtags, imageUrl } = await req.json();

  let pid = postId;
  if (!pid && caption) {
    const post = await prisma.post.create({
      data: { userId: user.id, caption, hashtags, imageUrl, status: "scheduled", scheduledAt: new Date(scheduledAt), platforms: platform || "instagram" },
    });
    pid = post.id;
  }

  const job = await prisma.scheduledJob.create({
    data: {
      userId: user.id,
      postId: pid,
      platform: platform || "instagram",
      scheduledAt: new Date(scheduledAt),
      payload: JSON.stringify({ postId: pid, platform }),
      status: "pending",
    },
  });

  if (pid) {
    await prisma.post.update({ where: { id: pid }, data: { status: "scheduled", scheduledAt: new Date(scheduledAt) } });
  }

  return NextResponse.json({ job });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  const { id } = await req.json();
  await prisma.scheduledJob.deleteMany({ where: { id, userId: user?.id } });
  return NextResponse.json({ success: true });
}
