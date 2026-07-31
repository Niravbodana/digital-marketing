import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { AGENT_TOOLS } from "@/lib/tools";
import { executeTool } from "@/lib/tool-executor";
import { pickToolWithAI } from "@/lib/agent";
import { getCreditCost } from "@/lib/credits";
import { deductCredits, addCredits } from "@/lib/config";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  try {
    const { prompt, input, toolId } = await req.json();
    const userInput = (prompt || input || "").trim();
    if (!userInput) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

    const tool = toolId
      ? AGENT_TOOLS.find((t) => t.id === toolId)
      : await pickToolWithAI(userInput);

    if (!tool) return NextResponse.json({ error: "No matching tool" }, { status: 404 });

    const costType = tool.outputType === "image" ? "image" : tool.outputType === "video" ? "video" : tool.outputType === "audio" ? "audio" : "text";
    const cost = await getCreditCost(costType);

    let creditsDeducted = false;
    try {
      await deductCredits(user.id, cost, `${tool.name}`);
      creditsDeducted = true;
    } catch {
      return NextResponse.json({ error: "Insufficient credits", creditsNeeded: cost }, { status: 402 });
    }

    const run = await prisma.agentRun.create({
      data: { userId: user.id, prompt: userInput, status: "thinking" },
    });

    const steps: Array<{ id: string; phase: string; title: string; content: string; order: number; status: string }> = [];
    const addStep = async (phase: string, title: string, content: string, order: number, status = "done") => {
      const s = await prisma.agentStep.create({
        data: { runId: run.id, phase, title, content, order, status },
      });
      steps.push(s);
      return s;
    };

    await addStep("thinking", "Understanding your request", userInput.slice(0, 200), 1);
    await addStep("planning", `Selected tool: ${tool.name}`, `${tool.description} · ${cost} credits`, 2);
    await addStep("executing", "AI agent working...", `Generating ${tool.outputType} output`, 3, "running");

    let output;
    try {
      output = await executeTool(tool, userInput);
    } catch (e) {
      if (creditsDeducted) {
        await addCredits(user.id, cost, "refund", `refund_${run.id}`);
      }
      await prisma.agentStep.updateMany({ where: { runId: run.id, order: 3 }, data: { status: "failed", content: "Generation failed" } });
      await prisma.agentRun.update({ where: { id: run.id }, data: { status: "failed" } });
      throw e;
    }

    await prisma.agentStep.updateMany({ where: { runId: run.id, order: 3 }, data: { status: "done", content: `Done: ${output.title}` } });
    await addStep("complete", "Task complete", `${output.downloadName} ready`, 4);
    await prisma.agentRun.update({ where: { id: run.id }, data: { status: "completed" } });

    let post = null;
    if (tool.outputType === "text" || tool.studio === "social") {
      post = await prisma.post.create({
        data: { userId: user.id, caption: output.content.slice(0, 2200), imageUrl: output.imageUrl, status: "draft" },
      });
    }

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id }, select: { credits: true } });

    return NextResponse.json({
      output,
      tool: { id: tool.id, name: tool.name },
      run: { id: run.id, steps },
      post,
      credits: updatedUser?.credits,
    });
  } catch (e) {
    console.error("Agent error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Agent failed. Check API keys in Admin." },
      { status: 500 }
    );
  }
}
