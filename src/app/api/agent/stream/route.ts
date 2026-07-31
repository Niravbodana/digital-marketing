import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { getCreditCost } from "@/lib/credits";
import { deductCredits, addCredits } from "@/lib/config";
import { runAgentLoop, isCasualChat, type AgentAction } from "@/lib/agent-runtime";
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
          ? (await prisma.conversation.findFirst({
              where: { id: conversationIdIn, userId: user.id },
              include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
            })) || (await getOrCreateConversation(user.id, userInput.slice(0, 60)))
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

        // Don't pre-charge for likely chat — charge only after create succeeds
        const likelyChat = !toolId && isCasualChat(userInput);

        const result = await runAgentLoop({
          userId: user.id,
          prompt: userInput,
          toolId,
          memory,
          history,
          emit,
        });

        if (result.created && result.tool && result.output) {
          const actualType =
            result.tool.outputType === "image"
              ? "image"
              : result.tool.outputType === "video"
                ? "video"
                : result.tool.outputType === "audio"
                  ? "audio"
                  : "text";
          cost = await getCreditCost(actualType);
          try {
            await deductCredits(user.id, cost, result.tool.name);
            creditsDeducted = true;
          } catch {
            send({ type: "error", id: "err-credits", error: "Insufficient credits for this creation" });
          }

          await appendMessage(conversation.id, "assistant", result.think.replyToUser, {
            toolId: result.tool.id,
            title: result.output.title,
          });
        } else {
          // Free chat / clarify — no credits
          await appendMessage(conversation.id, "assistant", result.think.replyToUser, {
            mode: result.think.mode,
            chat: true,
          });
          if (likelyChat) {
            // already handled
          }
        }

        await prisma.agentRun.update({
          where: { id: runId },
          data: { status: result.created ? "completed" : "completed" },
        });

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
