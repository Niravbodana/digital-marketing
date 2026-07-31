import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/db-init";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AGENT_TOOLS } from "@/lib/tools";
import { executeTool } from "@/lib/tool-executor";

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  const { toolId, input, prompt } = await req.json();

  const tool = AGENT_TOOLS.find((t) => t.id === toolId);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const userInput = input || prompt || "";

  const run = await prisma.agentRun.create({
    data: { userId: user?.id, prompt: `${tool.name}: ${userInput}`, status: "thinking" },
  });

  const steps: Awaited<ReturnType<typeof prisma.agentStep.create>>[] = [];
  const addStep = async (phase: string, title: string, content: string, order: number, status = "done") => {
    const s = await prisma.agentStep.create({
      data: { runId: run.id, phase, title, content, order, status },
    });
    steps.push(s);
    return s;
  };

  await addStep("thinking", "Understanding request", `Tool: ${tool.name} · ${tool.description}`, 1);
  await addStep("planning", "Gathering context", `Output type: ${tool.outputType} · Studio: ${tool.studio}`, 2);
  await addStep("executing", "Creating content", "AI agent generating production-ready output...", 3, "running");

  const output = await executeTool(tool, userInput);

  await prisma.agentStep.updateMany({
    where: { runId: run.id, order: 3 },
    data: { status: "done", content: `Generated: ${output.title}` },
  });
  await addStep("complete", "Ready to download", `${output.downloadName} · ${output.type}`, 4);

  let post = null;
  if (tool.outputType === "text" || tool.studio === "social") {
    post = await prisma.post.create({
      data: {
        userId: user?.id,
        caption: output.content.slice(0, 2200),
        imageUrl: output.imageUrl,
        status: "draft",
      },
    });
  }

  await prisma.task.create({
    data: {
      userId: user?.id,
      prompt: userInput,
      title: tool.name,
      type: tool.id,
      status: "completed",
      result: `Created ${output.downloadName}`,
    },
  });

  await prisma.agentRun.update({ where: { id: run.id }, data: { status: "completed" } });

  return NextResponse.json({ output, run: { id: run.id, steps }, post, tool });
}

export async function GET() {
  return NextResponse.json({
    tools: AGENT_TOOLS,
    count: AGENT_TOOLS.length,
    categories: [...new Set(AGENT_TOOLS.map((t) => t.category))],
    studios: [...new Set(AGENT_TOOLS.map((t) => t.studio))],
  });
}
