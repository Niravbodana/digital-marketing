import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}
