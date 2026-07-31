import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishToInstagram } from "@/lib/instagram";
import { isPostizConfigured, publishToPostiz } from "@/lib/postiz";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    const { postId, platforms } = await req.json();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { account: true },
    });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const fullCaption = [
      post.caption,
      post.hashtags?.split(",").map((t) => `#${t.trim()}`).join(" "),
    ].filter(Boolean).join("\n\n");

    // Try Postiz multi-platform first
    if (await isPostizConfigured()) {
      const result = await publishToPostiz({
        content: fullCaption,
        platforms: platforms || post.platforms?.split(",") || ["instagram"],
        mediaUrls: post.imageUrl ? [post.imageUrl] : undefined,
      });
      if (result.success) {
        await prisma.post.update({
          where: { id: postId },
          data: { status: "published", publishedAt: new Date() },
        });
        return NextResponse.json({ success: true, via: "postiz", message: result.message, data: result.data });
      }
    }

    const account =
      post.account ||
      (await prisma.connectedAccount.findFirst({
        where: { userId: user?.id, platform: "instagram" },
      }));

    if (!account) {
      return NextResponse.json({ error: "Connect an Instagram account or configure Postiz in Admin" }, { status: 400 });
    }

    if (account.isDemo) {
      await prisma.post.update({
        where: { id: postId },
        data: { status: "published", publishedAt: new Date(), accountId: account.id },
      });
      return NextResponse.json({
        success: true,
        demo: true,
        message: `✅ Demo publish successful to @${account.username}!`,
        permalink: `https://instagram.com/${account.username}`,
      });
    }

    const result = await publishToInstagram(account.accountId, account.accessToken, fullCaption, post.imageUrl || undefined);

    await prisma.post.update({
      where: { id: postId },
      data: { status: "published", publishedAt: new Date(), accountId: account.id },
    });

    return NextResponse.json({ success: true, mediaId: result.id, message: `✅ Published to @${account.username}!` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Publish failed" }, { status: 500 });
  }
}
