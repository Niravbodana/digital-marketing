import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getInstagramAccounts,
} from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${base}/dashboard?error=${encodeURIComponent(error)}`
    );
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("ig_oauth_state")?.value;
  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${base}/dashboard?error=invalid_state`);
  }

  try {
    const short = await exchangeCodeForToken(code);
    const long = await getLongLivedToken(short.access_token);
    const accounts = await getInstagramAccounts(long.access_token);

    for (const acc of accounts) {
      await prisma.connectedAccount.upsert({
        where: { accountId: acc.accountId },
        create: {
          platform: "instagram",
          username: acc.username,
          displayName: acc.displayName,
          profilePicture: acc.profilePicture,
          accountId: acc.accountId,
          accessToken: acc.pageAccessToken,
          tokenExpiresAt: new Date(Date.now() + long.expires_in * 1000),
          isDemo: false,
        },
        update: {
          username: acc.username,
          displayName: acc.displayName,
          profilePicture: acc.profilePicture,
          accessToken: acc.pageAccessToken,
          tokenExpiresAt: new Date(Date.now() + long.expires_in * 1000),
        },
      });
    }

    cookieStore.delete("ig_oauth_state");
    return NextResponse.redirect(
      `${base}/dashboard?connected=${accounts.length}`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return NextResponse.redirect(
      `${base}/dashboard?error=${encodeURIComponent(msg)}`
    );
  }
}
