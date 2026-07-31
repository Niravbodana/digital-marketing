import { getConfig } from "./config";

export async function isVoiceEnabled(): Promise<boolean> {
  const [key, flag] = await Promise.all([
    getConfig("elevenlabs_api_key"),
    getConfig("feature_voice_gen"),
  ]);
  return flag === "true" && Boolean(key);
}

export async function generateVoice(text: string, voiceId = "21m00Tcm4TlvDq8ikWAM"): Promise<{ audioUrl: string; source: string }> {
  const apiKey = await getConfig("elevenlabs_api_key");
  if (!apiKey) {
    return { audioUrl: "", source: "none" };
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    console.error("ElevenLabs error:", await res.text());
    return { audioUrl: "", source: "error" };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const base64 = buffer.toString("base64");
  return { audioUrl: `data:audio/mpeg;base64,${base64}`, source: "elevenlabs" };
}

export async function listVoices(): Promise<Array<{ id: string; name: string }>> {
  const apiKey = await getConfig("elevenlabs_api_key");
  if (!apiKey) return [];
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.voices || []).map((v: { voice_id: string; name: string }) => ({ id: v.voice_id, name: v.name }));
}
