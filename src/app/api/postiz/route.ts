import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const postizUrl = process.env.POSTIZ_URL;
  const postizKey = process.env.POSTIZ_API_KEY;
  if (!postizUrl || !postizKey) {
    return NextResponse.json({ error: "Postiz not configured" }, { status: 400 });
  }

  const body = await req.json();
  const res = await fetch(`${postizUrl}/api/public/v1/posts`, {
    method: "POST",
    headers: {
      Authorization: postizKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
