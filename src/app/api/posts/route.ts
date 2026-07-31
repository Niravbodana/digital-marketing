import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePostContent } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topic, tone, caption, hashtags, imageUrl, accountId } = body;

  if (topic) {
    const content = await generatePostContent(topic, tone);
    const post = await prisma.post.create({
      data: {
        caption: content.caption,
        hashtags: content.hashtags.join(","),
        imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/1080/1080`,
        status: "draft",
        accountId: accountId || null,
      },
    });
    return NextResponse.json({ post });
  }

  const post = await prisma.post.create({
    data: {
      caption: caption || "",
      hashtags: Array.isArray(hashtags) ? hashtags.join(",") : hashtags || "",
      imageUrl: imageUrl || null,
      status: "draft",
      accountId: accountId || null,
    },
  });
  return NextResponse.json({ post });
}

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { account: true },
  });
  return NextResponse.json({ posts });
}
