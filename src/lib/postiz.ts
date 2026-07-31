import { getConfig } from "./config";

export async function getPostizConfig() {
  const [url, apiKey] = await Promise.all([
    getConfig("postiz_url"),
    getConfig("postiz_api_key"),
  ]);
  return {
    url: url?.replace(/\/$/, "") || "",
    apiKey: apiKey || "",
  };
}

export async function isPostizConfigured(): Promise<boolean> {
  const { url, apiKey } = await getPostizConfig();
  return Boolean(url && apiKey);
}

export async function postizRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { url, apiKey } = await getPostizConfig();
  if (!url || !apiKey) {
    throw new Error("Postiz not configured. Add URL and API key in Admin → Social.");
  }
  return fetch(`${url}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
}

export async function publishToPostiz(payload: {
  content: string;
  platforms?: string[];
  mediaUrls?: string[];
  scheduleDate?: string;
}): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const res = await postizRequest("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content: payload.content,
        platforms: payload.platforms || ["instagram"],
        media: payload.mediaUrls,
        date: payload.scheduleDate,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data.message || `Postiz error ${res.status}` };
    }
    return { success: true, message: "Published via Postiz", data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Postiz failed" };
  }
}
