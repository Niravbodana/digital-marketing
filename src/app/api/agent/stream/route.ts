import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { getCreditCost } from "@/lib/credits";
import { deductCredits, addCredits } from "@/lib/config";
import { runAgentLoop, type AgentAction } from "@/lib/agent-runtime";
import {
  loadUserMemory,
  getOrCreateConversation,
  appendMessage,
  loadRecentTurns,
} from "@/lib/agent-memory";

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

  const body = await req.json();
  const userInput = String(body.prompt || "").trim();
  const toolId = body.toolId ? String(body.toolId) : undefined;
  const conversationIdIn = body.conversationId ? String(body.conversationId) : undefined;

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
        const memory = await loadUserMemory(user.id);
        const conversation = conversationIdIn
          ? await prisma.conversation.findFirst({
              where: { id: conversationIdIn, userId: user.id },
              include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
            }) || await getOrCreateConversation(user.id, userInput.slice(0, 60))
          : await getOrCreateConversation(user.id, userInput.slice(0, 60));

        const history = await loadRecentTurns(conversation.id, 12);
        await appendMessage(conversation.id, "user", userInput);

        send({ type: "session", conversationId: conversation.id });

        const run = await prisma.agentRun.create({
          data: { userId: user.id, prompt: userInput, status: "thinking" },
        });
        runId = run.id;

        let stepOrder = 0;
        const emit = (action: AgentAction) => {
          send(action);
          // Persist key steps for run history
          if (action.type === "thinking" && action.status === "done") {
            stepOrder += 1;
            prisma.agentStep
              .create({
                data: {
                  runId,
                  phase: "understand",
                  title: "Thinking",
                  content: action.content.slice(0, 2000),
                  order: stepOrder,
                  status: "done",
                },
              })
              .catch(() => null);
          }
          if (action.type === "tool" && action.status === "done") {
            stepOrder += 1;
            prisma.agentStep
              .create({
                data: {
                  runId,
                  phase: action.name === "WebSearch" ? "gather" : "create",
                  title: action.name,
                  content: (action.result || action.detail).slice(0, 2000),
                  order: stepOrder,
                  status: "done",
                },
              })
              .catch(() => null);
          }
          if (action.type === "plan" && action.status === "done") {
            stepOrder += 1;
            prisma.agentStep
              .create({
                data: {
                  runId,
                  phase: "planning",
                  title: "Plan",
                  content: action.steps.join(" → ").slice(0, 2000),
                  order: stepOrder,
                  status: "done",
                },
              })
              .catch(() => null);
          }
        };

        // Pre-deduct credits based on guessed type after think — we deduct inside after plan
        // Use a two-phase approach: run loop but intercept create... Actually runAgentLoop does create inside.
        // So we need to deduct before create. We'll estimate cost from prompt heuristically first,
        // then adjust. Simpler: deduct after plan by wrapping — for now deduct mid-stream via custom flow.

        // Run until plan is known by doing a lightweight estimate first
        const roughType = /image|logo|photo|banner|poster|graphic|art/i.test(userInput)
          ? "image"
          : /video|reel|trailer/i.test(userInput)
            ? "video"
            : /song|music|voice|audio/i.test(userInput)
              ? "audio"
              : "text";
        cost = await getCreditCost(roughType);

        try {
          await deductCredits(user.id, cost, "Agent run");
          creditsDeducted = true;
        } catch {
          send({ type: "error", id: "err-credits", error: "Insufficient credits" });
          controller.close();
          return;
        }

        const result = await runAgentLoop({
          userId: user.id,
          prompt: userInput,
          toolId,
          memory,
          history,
          emit,
        });

        // Adjust credits if actual output type differs
        const actualType =
          result.tool.outputType === "image"
            ? "image"
            : result.tool.outputType === "video"
              ? "video"
              : result.tool.outputType === "audio"
                ? "audio"
                : "text";
        const actualCost = await getCreditCost(actualType);
        if (actualCost !== cost) {
          const diff = actualCost - cost;
          if (diff > 0) {
            try {
              await deductCredits(user.id, diff, `${result.tool.name} adjust`);
              cost = actualCost;
            } catch {
              // keep original charge
            }
          } else if (diff < 0) {
            await addCredits(user.id, -diff, "refund", `adjust_${runId}`);
            cost = actualCost;
          }
        }

        await appendMessage(conversation.id, "assistant", result.think.replyToUser, {
          toolId: result.tool.id,
          title: result.output.title,
        });
        await prisma.agentRun.update({ where: { id: runId }, data: { status: "completed" } });

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { credits: true },
        });
        send({ type: "credits", credits: updatedUser?.credits });
      } catch (e) {
        if (creditsDeducted && runId) {
          await addCredits(user.id, cost, "refund", `refund_${runId}`);
        }
        if (runId) {
          await prisma.agentRun.update({ where: { id: runId }, data: { status: "failed" } }).catch(() => null);
        }
        send({
          type: "error",
          id: "err",
          error: e instanceof Error ? e.message : "Agent failed",
        });
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
