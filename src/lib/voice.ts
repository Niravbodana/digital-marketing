import { getConfig } from "./config";
import { getVaultKey, tryWithFailover } from "./api-keys";

export async function isVoiceEnabled(): Promise<boolean> {
  const [key, flag] = await Promise.all([
    getVaultKey("elevenlabs"),
    getConfig("feature_voice_gen"),
  ]);
  return flag === "true" && Boolean(key);
}

export async function generateVoice(text: string, voiceId = "21m00Tcm4TlvDq8ikWAM"): Promise<{ audioUrl: string; source: string }> {
  const apiKey = await getVaultKey("elevenlabs");
  if (!apiKey) return { audioUrl: "", source: "none" };

  try {
    return await tryWithFailover("elevenlabs", async (key) => {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.slice(0, 2500),
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!res.ok) throw new Error("ElevenLabs failed");
      const buffer = Buffer.from(await res.arrayBuffer());
      const base64 = buffer.toString("base64");
      return { audioUrl: `data:audio/mpeg;base64,${base64}`, source: "elevenlabs" };
    });
  } catch {
    return { audioUrl: "", source: "error" };
  }
}

export async function listVoices(): Promise<Array<{ id: string; name: string }>> {
  const apiKey = await getVaultKey("elevenlabs");
  if (!apiKey) return [];
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.voices || []).map((v: { voice_id: string; name: string }) => ({ id: v.voice_id, name: v.name }));
}
