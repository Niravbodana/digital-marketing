import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { prisma } from "@/lib/prisma";
import { API_PROVIDERS, getVaultKeyMasked, testVaultKey } from "@/lib/api-keys";

export async function GET() {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const keys = await prisma.apiKeyEntry.findMany({
    orderBy: [{ provider: "asc" }, { priority: "desc" }],
  });

  const real = keys.filter((k) => k.keyValue && k.keyValue.length > 8);
  return NextResponse.json({
    keys: keys.map((k) => ({
      ...k,
      keyValue: k.keyValue || "",
    })),
    providers: API_PROVIDERS,
    stats: {
      total: real.length,
      online: real.filter((k) => k.status === "online").length,
      active: real.filter((k) => k.isActive).length,
    },
  });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await req.json();

  if (body.action === "smart-add") {
    const { smartAddKey } = await import("@/lib/ai-router");
    const result = await smartAddKey(body.keyValue);
    return NextResponse.json(result);
  }

  if (body.action === "test") {
    const result = await testVaultKey(body.id);
    return NextResponse.json(result);
  }

  if (body.action === "bulk") {
    const results = [];
    for (const item of body.items as Array<{ provider: string; label: string; keyValue: string; priority?: number }>) {
      const entry = await prisma.apiKeyEntry.create({
        data: {
          provider: item.provider,
          label: item.label,
          keyValue: item.keyValue,
          priority: item.priority || 0,
          isCustom: item.provider === "custom",
          isActive: true,
        },
      });
      results.push(entry);
    }
    return NextResponse.json({ keys: results });
  }

  if (body.id) {
    const updateData: Record<string, unknown> = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.keyValue !== undefined) updateData.keyValue = body.keyValue;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.endpoint !== undefined) updateData.endpoint = body.endpoint;
    const entry = await prisma.apiKeyEntry.update({ where: { id: body.id }, data: updateData });
    return NextResponse.json({ key: entry });
  }

  const entry = await prisma.apiKeyEntry.create({
    data: {
      provider: body.provider || (body.keyValue ? (await import("@/lib/ai-router")).detectProviderFromKeyAny(body.keyValue) : "custom"),
      label: body.label || `${body.provider || "API"} Key`,
      keyValue: body.keyValue,
      priority: body.priority || 10,
      isCustom: body.provider === "custom" || body.isCustom,
      endpoint: body.endpoint,
      metadata: body.metadata,
      isActive: true,
    },
  });

  const testResult = await testVaultKey(entry.id);
  return NextResponse.json({ key: entry, test: testResult });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await req.json();
  await prisma.apiKeyEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
