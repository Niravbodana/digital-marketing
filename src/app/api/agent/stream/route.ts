import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { executeTool } from "@/lib/tool-executor";
import { getCreditCost } from "@/lib/credits";
import { deductCredits, addCredits } from "@/lib/config";
import { thinkAboutRequest, searchWeb, buildPlan, getToolFromPlan } from "@/lib/agent-brain";

export const maxDuration = 120;

function sse(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) {
    return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });
  }

  const { prompt, toolId } = await req.json();
  const userInput = String(prompt || "").trim();
  if (!userInput) {
    return new Response(JSON.stringify({ error: "Prompt required" }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => controller.enqueue(encoder.encode(sse(data)));

      let runId = "";
      let creditsDeducted = false;
      let cost = 0;

      try {
        const run = await prisma.agentRun.create({
          data: { userId: user.id, prompt: userInput, status: "thinking" },
        });
        runId = run.id;

        send({ type: "thinking", content: "Reading your message and identifying what you actually need…" });

        const intent = await thinkAboutRequest(userInput);
        send({ type: "thinking", content: intent.thinkingTrace });
        send({ type: "assistant", content: intent.replyToUser });

        await prisma.agentStep.create({
          data: { runId, phase: "understand", title: "Understanding", content: intent.summary, order: 1, status: "done" },
        });

        let research = "";
        if (intent.needsWebResearch && intent.researchQuery) {
          send({ type: "search", query: intent.researchQuery, results: "Searching the web…" });
          research = await searchWeb(intent.researchQuery);
          send({ type: "search", query: intent.researchQuery, results: research || "Using internal knowledge base." });
          await prisma.agentStep.create({
            data: { runId, phase: "gather", title: "Research", content: research.slice(0, 500), order: 2, status: "done" },
          });
        } else {
          send({ type: "thinking", content: "No external search needed — I have enough context from your prompt." });
        }

        send({ type: "thinking", content: "Building execution plan and selecting the right capability…" });
        const plan = await buildPlan(userInput, intent, research);
        send({ type: "plan", steps: plan.steps, reasoning: plan.reasoning });

        const tool = getToolFromPlan(plan, toolId);
        const costType = tool.outputType === "image" ? "image" : tool.outputType === "video" ? "video" : tool.outputType === "audio" ? "audio" : "text";
        cost = await getCreditCost(costType);

        try {
          await deductCredits(user.id, cost, tool.name);
          creditsDeducted = true;
        } catch {
          send({ type: "error", error: "Insufficient credits", creditsNeeded: cost });
          controller.close();
          return;
        }

        await prisma.agentStep.create({
          data: { runId, phase: "planning", title: plan.selectedToolName, content: plan.reasoning, order: 3, status: "done" },
        });

        send({ type: "status", content: `Creating with ${tool.name}…`, active: true });

        const output = await executeTool(tool, userInput, { intent, research, plan });

        await prisma.agentStep.create({
          data: { runId, phase: "create", title: "Created", content: output.title, order: 4, status: "done" },
        });
        await prisma.agentStep.create({
          data: { runId, phase: "deliver", title: "Ready", content: output.downloadName, order: 5, status: "done" },
        });
        await prisma.agentRun.update({ where: { id: runId }, data: { status: "completed" } });

        const updatedUser = await prisma.user.findUnique({ where: { id: user.id }, select: { credits: true } });

        send({
          type: "output",
          output,
          tool: { id: tool.id, name: tool.name },
          credits: updatedUser?.credits,
        });
        send({ type: "done" });
      } catch (e) {
        if (creditsDeducted && runId) {
          await addCredits(user.id, cost, "refund", `refund_${runId}`);
        }
        if (runId) {
          await prisma.agentRun.update({ where: { id: runId }, data: { status: "failed" } }).catch(() => null);
        }
        send({ type: "error", error: e instanceof Error ? e.message : "Agent failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
