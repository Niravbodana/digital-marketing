import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { getAllConfig, setConfig, deleteConfig, seedConfig, CONFIG_REGISTRY } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  await seedConfig();
  const showSecrets = req.nextUrl.searchParams.get("secrets") === "1";
  const configs = await getAllConfig(showSecrets);
  const packages = await prisma.creditPackage.findMany({ orderBy: { sortOrder: "asc" } });
  const stats = {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
    conversations: await prisma.conversation.count(),
    scheduled: await prisma.scheduledJob.count({ where: { status: "pending" } }),
  };
  return NextResponse.json({ configs, packages, stats, registry: CONFIG_REGISTRY });
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();

  if (body.action === "bulk") {
    for (const { key, value } of body.items as Array<{ key: string; value: string }>) {
      await setConfig(key, value);
    }
    return NextResponse.json({ success: true });
  }

  if (body.action === "add_custom") {
    await prisma.siteConfig.create({
      data: {
        key: body.key,
        value: body.value,
        category: body.category || "custom",
        label: body.label || body.key,
        type: body.type || "text",
        isSecret: body.isSecret || false,
        sortOrder: 99,
      },
    });
    return NextResponse.json({ success: true });
  }

  await setConfig(body.key, body.value);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { key } = await req.json();
  if (CONFIG_REGISTRY.find((c) => c.key === key)) {
    await setConfig(key, "");
    return NextResponse.json({ success: true, cleared: true });
  }
  await deleteConfig(key);
  return NextResponse.json({ success: true, deleted: true });
}
