#!/usr/bin/env bash
set -euo pipefail

# Run this on the machine where Postiz is running (localhost:4007).
# It exposes Postiz to a temporary public URL so Cloud Agents can reach it.

POSTIZ_PORT="${POSTIZ_PORT:-4007}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Installing cloudflared..."
  if [[ "$(uname)" == "Darwin" ]]; then
    brew install cloudflared
  else
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
    sudo dpkg -i /tmp/cloudflared.deb
  fi
fi

echo "Starting tunnel to http://localhost:${POSTIZ_PORT}"
echo "Copy the https://*.trycloudflare.com URL and use it in Cursor Cloud Agent MCP settings:"
echo
echo '  URL: https://YOUR-TUNNEL.trycloudflare.com/api/mcp'
echo '  Authorization: Bearer YOUR_POSTIZ_API_KEY'
echo
cloudflared tunnel --url "http://localhost:${POSTIZ_PORT}"
