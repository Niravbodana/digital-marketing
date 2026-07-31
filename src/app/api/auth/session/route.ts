import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";
import { syncAdminRole } from "@/lib/admin-access";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ user: null });
  const synced = await syncAdminRole(user);
  return NextResponse.json({
    user: {
      id: synced.id,
      name: synced.name,
      email: synced.email,
      role: synced.role,
      credits: synced.credits,
      teamId: synced.teamId,
    },
  });
}
