import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { getConfig, getOpenAIClient, deductCredits } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { title, message, conversationId } = await req.json();

  let conv;
  if (conversationId) {
    conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId: user.id } });
  }
  if (!conv) {
    conv = await prisma.conversation.create({
      data: { userId: user.id, title: title || message?.slice(0, 50) || "New chat" },
    });
  }

  const history = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  await prisma.message.create({
    data: { conversationId: conv.id, role: "user", content: message },
  });

  const cost = parseInt(await getConfig("credit_cost_text")) || 1;
  try { await deductCredits(user.id, cost, "Chat message"); } catch { return NextResponse.json({ error: "Insufficient credits" }, { status: 402 }); }

  const client = await getOpenAIClient();
  let reply = `[AI Mock] I understand: "${message}". Add OPENAI_API_KEY in Admin Panel → AI & Models to enable full chat refine.`;

  if (client) {
    const model = await getConfig("openai_model");
    const res = await client.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Bodana Digital AI assistant. Help refine, improve, and create marketing content. Be concise and actionable. If user asks to change something, apply the change directly." },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });
    reply = res.choices[0]?.message?.content || reply;
  }

  const assistantMsg = await prisma.message.create({
    data: { conversationId: conv.id, role: "assistant", content: reply },
  });

  await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ conversation: conv, message: assistantMsg, reply });
}
