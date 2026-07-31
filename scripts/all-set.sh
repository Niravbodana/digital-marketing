#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

POSTIZ_URL="${POSTIZ_URL:-http://localhost:4007}"
POSTIZ_API_KEY="${POSTIZ_API_KEY:?Set POSTIZ_API_KEY first: export POSTIZ_API_KEY=your-key}"

echo "============================================"
echo "  Postiz MCP - Setup Check"
echo "============================================"
echo ""

# 1. Check Postiz UI
echo "[1/3] Postiz UI check..."
HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${POSTIZ_URL}" 2>/dev/null || echo 000)"
if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "302" || "$HTTP_CODE" == "307" ]]; then
  echo "  OK - Postiz running at ${POSTIZ_URL}"
else
  echo "  WARN - Postiz not reachable (HTTP ${HTTP_CODE})"
  echo "  Start Postiz first, then run this again."
fi

# 2. Check MCP
echo ""
echo "[2/3] MCP endpoint check..."
MCP_RESPONSE="$(curl -sS --connect-timeout 10 -X POST "${POSTIZ_URL}/api/mcp" \
  -H "Authorization: Bearer ${POSTIZ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"all-set","version":"1.0"}}}' 2>/dev/null || true)"

if echo "$MCP_RESPONSE" | grep -q '"result"'; then
  echo "  OK - MCP connected"
else
  echo "  WARN - MCP not ready yet"
fi

# 3. Cursor MCP config reminder
echo ""
echo "[3/3] Cursor MCP config"
echo "  File: .cursor/mcp.json (already configured)"
echo "  Set env: export POSTIZ_API_KEY=\"${POSTIZ_API_KEY:0:8}...\""
echo ""

echo "============================================"
echo "  ALL SET START"
echo "============================================"
echo ""
echo "Local Cursor mein ab ye commands try karo:"
echo ""
echo "  - \"Mere connected social accounts dikhao\""
echo "  - \"LinkedIn ke liye ek post schedule karo\""
echo "  - \"Kal subah 10 baje X par post daalo\""
echo ""
echo "Postiz MCP Tools (9):"
echo "  integrationList, groupList, integrationSchema,"
echo "  triggerTool, schedulePostTool, generateImageTool,"
echo "  generateVideoOptions, videoFunctionTool, generateVideoTool"
echo ""
echo "Cloud Agent ke liye: npm run tunnel:postiz"
echo "============================================"
