import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { AGENT_TOOLS } from "@/lib/tools";
import { executeTool } from "@/lib/tool-executor";
import { pickToolWithAI } from "@/lib/agent";
import { getCreditCost } from "@/lib/credits";
import { deductCredits, addCredits } from "@/lib/config";
import { chatComplete } from "@/lib/ai-router";

export const maxDuration = 120;

async function gatherContext(prompt: string): Promise<string> {
  try {
    const result = await chatComplete([
      {
        role: "system",
        content: "You are a creation agent. In 2-3 short bullet points, note what context and approach this request needs. Be concise.",
      },
      { role: "user", content: prompt },
    ], { timeoutMs: 20000 });
    return result.content.slice(0, 400);
  } catch {
    return "Context loaded from your prompt.";
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  try {
    const { prompt, input, toolId } = await req.json();
    const userInput = (prompt || input || "").trim();
    if (!userInput) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

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

    await addStep("understand", "Understanding your request", userInput.slice(0, 200), 1);

    const context = await gatherContext(userInput);
    await addStep("gather", "Gathering intelligence", context, 2);

    const tool = toolId
      ? AGENT_TOOLS.find((t) => t.id === toolId)
      : await pickToolWithAI(userInput);

    if (!tool) {
      await prisma.agentRun.update({ where: { id: run.id }, data: { status: "failed" } });
      return NextResponse.json({ error: "No matching capability" }, { status: 404 });
    }

    const costType = tool.outputType === "image" ? "image" : tool.outputType === "video" ? "video" : tool.outputType === "audio" ? "audio" : "text";
    const cost = await getCreditCost(costType);

    let creditsDeducted = false;
    try {
      await deductCredits(user.id, cost, `${tool.name}`);
      creditsDeducted = true;
    } catch {
      return NextResponse.json({ error: "Insufficient credits", creditsNeeded: cost }, { status: 402 });
    }

    await addStep("planning", `Tool selected: ${tool.name}`, `${tool.description} · ${cost} credits`, 3);
    await addStep("create", "Creating your asset", `Generating ${tool.outputType} output`, 4, "running");

    let output;
    try {
      output = await executeTool(tool, userInput);
    } catch (e) {
      if (creditsDeducted) {
        await addCredits(user.id, cost, "refund", `refund_${run.id}`);
      }
      await prisma.agentStep.updateMany({ where: { runId: run.id, order: 4 }, data: { status: "failed", content: "Generation failed" } });
      await prisma.agentRun.update({ where: { id: run.id }, data: { status: "failed" } });
      throw e;
    }

    await prisma.agentStep.updateMany({ where: { runId: run.id, order: 4 }, data: { status: "done", content: `Created: ${output.title}` } });
    await addStep("deliver", "Ready to download", `${output.downloadName} · ${output.type}`, 5);
    await prisma.agentRun.update({ where: { id: run.id }, data: { status: "completed" } });

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id }, select: { credits: true } });

    return NextResponse.json({
      output,
      tool: { id: tool.id, name: tool.name },
      run: { id: run.id, steps },
      credits: updatedUser?.credits,
    });
  } catch (e) {
    console.error("Agent error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Agent failed. Add API keys in Admin." },
      { status: 500 }
    );
  }
}
