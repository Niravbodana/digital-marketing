import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { parsePrompt, generatePostContent, generateHashtags } from "@/lib/ai";
import { getSession } from "@/lib/auth";

async function addStep(runId: string, phase: string, title: string, content: string, order: number, status = "done") {
  return prisma.agentStep.create({
    data: { runId, phase, title, content, order, status },
  });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  try {
    const user = await getSession();
    const { prompt, toolId } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const run = await prisma.agentRun.create({
      data: { userId: user?.id, prompt, status: "thinking" },
    });

    const steps = [];
    steps.push(await addStep(run.id, "thinking", "Understanding request", `Analyzing: "${prompt.slice(0, 80)}..."`, 1));
    steps.push(await addStep(run.id, "planning", "Creating execution plan", "Identifying best tools and workflow for this task", 2));

    const intent = await parsePrompt(prompt);
    steps.push(await addStep(run.id, "planning", "Plan ready", `Action: ${intent.action} · ${intent.title}`, 3));

    const task = await prisma.task.create({
      data: {
        userId: user?.id,
        prompt,
        title: toolId ? `Tool: ${toolId}` : intent.title,
        type: intent.action,
        status: "running",
        metadata: JSON.stringify(intent),
      },
    });

    steps.push(await addStep(run.id, "executing", "Running task", `Executing: ${intent.title}`, 4, "running"));

    let post = null;
    let reply = intent.reply;

    switch (intent.action) {
      case "generate_post":
      case "schedule_post": {
        const content = await generatePostContent(intent.topic || prompt, intent.tone);
        post = await prisma.post.create({
          data: {
            userId: user?.id,
            caption: content.caption,
            hashtags: content.hashtags.join(","),
            imageUrl: `https://picsum.photos/seed/${Date.now()}/1080/1080`,
            status: intent.action === "schedule_post" ? "scheduled" : "draft",
            scheduledAt: intent.action === "schedule_post" ? new Date(Date.now() + 86400000) : null,
          },
        });
        reply = "✅ Post generated! Preview mein dekho.";
        break;
      }
      case "generate_hashtags": {
        const tags = await generateHashtags(intent.topic || prompt);
        post = await prisma.post.create({
          data: { userId: user?.id, caption: intent.topic || prompt, hashtags: tags.join(","), status: "draft" },
        });
        reply = `✅ ${tags.length} hashtags ready!`;
        break;
      }
      case "connect_instagram":
        reply = "👉 Left panel se Instagram username/password se connect karo.";
        break;
      case "publish_post": {
        const latest = await prisma.post.findFirst({ orderBy: { createdAt: "desc" } });
        post = latest;
        reply = latest ? "👉 Publish button dabao!" : "Pehle post generate karo.";
        break;
      }
      case "list_accounts": {
        const count = await prisma.connectedAccount.count();
        reply = count > 0 ? `✅ ${count} account(s) connected` : "Koi account nahi — connect karo.";
        break;
      }
    }

    await prisma.task.update({ where: { id: task.id }, data: { status: "completed", result: reply } });
    await prisma.agentStep.updateMany({ where: { runId: run.id, order: 4 }, data: { status: "done", content: reply } });
    steps.push(await addStep(run.id, "complete", "Task complete", reply, 5));
    await prisma.agentRun.update({ where: { id: run.id }, data: { status: "completed" } });

    return NextResponse.json({ task, intent, post, reply, run: { id: run.id, steps } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function GET() {
  await ensureDatabase();
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ tasks });
}
