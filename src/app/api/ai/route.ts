import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePrompt, generatePostContent, generateHashtags } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const intent = await parsePrompt(prompt);

    const task = await prisma.task.create({
      data: {
        prompt,
        title: intent.title,
        type: intent.action,
        status: "running",
        metadata: JSON.stringify(intent),
      },
    });

    let post = null;
    let reply = intent.reply;

    switch (intent.action) {
      case "generate_post":
      case "schedule_post": {
        const content = await generatePostContent(
          intent.topic || prompt,
          intent.tone
        );
        post = await prisma.post.create({
          data: {
            caption: content.caption,
            hashtags: content.hashtags.join(","),
            status: intent.action === "schedule_post" ? "scheduled" : "draft",
            scheduledAt:
              intent.action === "schedule_post"
                ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                : null,
          },
        });
        reply = `✅ Post ready! Caption aur hashtags generate ho gaye. Preview mein dekho.`;
        break;
      }
      case "generate_hashtags": {
        const tags = await generateHashtags(intent.topic || prompt);
        post = await prisma.post.create({
          data: {
            caption: intent.topic || prompt,
            hashtags: tags.join(","),
            status: "draft",
          },
        });
        reply = `✅ ${tags.length} hashtags generate ho gaye!`;
        break;
      }
      case "connect_instagram":
        reply = "👉 Dashboard ke 'Connect Accounts' section mein Instagram connect karo.";
        break;
      case "publish_post": {
        const latest = await prisma.post.findFirst({
          orderBy: { createdAt: "desc" },
        });
        if (latest) {
          post = latest;
          reply = "👉 Preview mein post check karo aur 'Publish Now' dabao.";
        } else {
          reply = "Pehle ek post generate karo — prompt mein topic likho.";
        }
        break;
      }
      case "list_accounts": {
        const count = await prisma.connectedAccount.count({
          where: { platform: "instagram" },
        });
        reply =
          count > 0
            ? `✅ ${count} Instagram account(s) connected hain.`
            : "Koi account connected nahi — Connect Accounts se jodo.";
        break;
      }
      default:
        reply = intent.reply;
    }

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "completed",
        result: reply,
      },
    });

    return NextResponse.json({
      task: { ...task, status: "completed", result: reply },
      intent,
      post,
      reply,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ tasks });
}
