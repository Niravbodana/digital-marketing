# Digital Marketing + Postiz MCP

Postiz social media MCP integration for **local Cursor** and **Cloud Agents**.

## Quick setup

### 1) Local Postiz verify (your computer)

```bash
export POSTIZ_API_KEY="your-api-key-from-postiz-settings"
chmod +x scripts/verify-postiz-local.sh
./scripts/verify-postiz-local.sh
```

### 2) Local Cursor MCP (already in `.cursor/mcp.json`)

Set your API key once:

```bash
export POSTIZ_API_KEY="your-api-key"
```

Restart Cursor. Two servers are configured:

- `postiz-local` — HTTP at `http://localhost:4007/api/mcp`
- `postiz-stdio` — `postiz-mcp` npm package (recommended)

### 3) Cloud Agent MCP (this chat / cursor.com/agents)

Cloud Agents **cannot** reach `localhost:4007` on your PC. Expose your local Postiz:

```bash
chmod +x scripts/expose-postiz-tunnel.sh
./scripts/expose-postiz-tunnel.sh
```

Copy the `https://*.trycloudflare.com` URL, then in **[cursor.com/agents](https://cursor.com/agents)** → **MCP dropdown** → add:

| Field | Value |
|---|---|
| Name | `postiz` |
| Type | HTTP |
| URL | `https://YOUR-TUNNEL.trycloudflare.com/api/mcp` |
| Authorization | `Bearer YOUR_POSTIZ_API_KEY` |

Enable it for this run and send a new message.

### Alternative: stdio MCP for Cloud Agent

In **Dashboard → Integrations & MCP** (or agents MCP dropdown), add:

```json
{
  "command": "npx",
  "args": ["-y", "postiz-mcp"],
  "env": {
    "POSTIZ_URL": "https://YOUR-TUNNEL.trycloudflare.com",
    "POSTIZ_API_KEY": "your-api-key",
    "POSTIZ_ENABLE_WRITE": "false"
  }
}
```

## Cloud environment (optional self-hosted Postiz in VM)

```bash
cd postiz
sudo docker compose up -d
```

`.cursor/environment.json` auto-starts this on future Cloud Agent runs.

## Security

Never commit API keys. Rotate your key if it was shared in chat.
