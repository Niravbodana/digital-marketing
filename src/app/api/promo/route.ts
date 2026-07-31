import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureDatabase } from "@/lib/db-init";
import { validatePromo, redeemPromo } from "@/lib/promo";

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { code, action, purchaseAmount } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  if (action === "validate") {
    const result = await validatePromo(code, user.id, purchaseAmount || 0);
    return NextResponse.json(result);
  }

  const result = await redeemPromo(code, user.id);
  if (!result.valid) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
