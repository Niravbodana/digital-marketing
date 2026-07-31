import { getConfig } from "./config";

const REPLICATE_API = "https://api.replicate.com/v1";

export async function isVideoEnabled(): Promise<boolean> {
  const [key, flag] = await Promise.all([
    getConfig("replicate_api_key"),
    getConfig("feature_video_gen"),
  ]);
  return flag === "true" && Boolean(key);
}

async function pollPrediction(id: string, apiKey: string, maxAttempts = 30): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${REPLICATE_API}/predictions/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (data.status === "succeeded") {
      const output = data.output;
      return Array.isArray(output) ? output[0] : output;
    }
    if (data.status === "failed" || data.status === "canceled") return null;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return null;
}

export async function generateVideo(prompt: string): Promise<{ videoUrl: string; source: string }> {
  const apiKey = await getConfig("replicate_api_key");
  if (!apiKey) return { videoUrl: "", source: "none" };

  const model = (await getConfig("replicate_video_model")) || "minimax/video-01";

  try {
    const createRes = await fetch(`${REPLICATE_API}/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: { prompt: prompt.slice(0, 1000) },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("Replicate create error:", err);
      return { videoUrl: "", source: "error" };
    }

    const prediction = await createRes.json();
    if (prediction.output) {
      const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return { videoUrl: url, source: "replicate" };
    }

    if (prediction.id) {
      const url = await pollPrediction(prediction.id, apiKey);
      if (url) return { videoUrl: url, source: "replicate" };
    }
  } catch (e) {
    console.error("Video gen error:", e);
  }

  return { videoUrl: "", source: "error" };
}
