import fs from "fs";
import path from "path";

/**
 * Load env from easy Windows-friendly filenames too.
 * Priority: keys.env → .env.local → .env
 * (keys.env has NO leading dot — easy to create in Notepad / Explorer)
 */
export function loadEnvFiles(): void {
  const root = process.cwd();
  const files = ["keys.env", ".env.local", ".env"];

  for (const name of files) {
    const full = path.join(root, name);
    if (!fs.existsSync(full)) continue;
    try {
      const text = fs.readFileSync(full, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    } catch {
      // ignore
    }
  }
}

/** Write keys.env (Windows-friendly) + .env for Next.js */
export function writeKeysEnv(vars: Record<string, string>): string {
  const root = process.cwd();
  const lines = Object.entries(vars)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}="${v.trim()}"`);

  const body =
    `# Bodana Creation Machine — API keys\n` +
    `# File name: keys.env (easy to create on Windows)\n\n` +
    lines.join("\n") +
    "\n";

  const keysPath = path.join(root, "keys.env");
  const envPath = path.join(root, ".env");
  fs.writeFileSync(keysPath, body, "utf8");
  try {
    fs.writeFileSync(envPath, body, "utf8");
  } catch {
    // .env may be locked on some systems — keys.env is enough
  }

  // Apply to current process immediately
  for (const [k, v] of Object.entries(vars)) {
    if (v?.trim()) process.env[k] = v.trim();
  }

  return keysPath;
}
