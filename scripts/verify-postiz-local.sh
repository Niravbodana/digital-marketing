#!/usr/bin/env bash
set -euo pipefail

POSTIZ_URL="${POSTIZ_URL:-http://localhost:4007}"
POSTIZ_API_KEY="${POSTIZ_API_KEY:-}"
MCP_PATH="${MCP_PATH:-/api/mcp}"

if [[ -z "$POSTIZ_API_KEY" ]]; then
  echo "ERROR: Set POSTIZ_API_KEY (Settings > Developers > Public API in Postiz)."
  exit 1
fi

echo "==> Checking Postiz web UI at ${POSTIZ_URL}"
HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${POSTIZ_URL}" || true)"
echo "    HTTP status: ${HTTP_CODE}"
if [[ "$HTTP_CODE" == "000" ]]; then
  echo "FAIL: Postiz is not running on ${POSTIZ_URL}"
  echo "Start it with: cd postiz && docker compose up -d"
  exit 1
fi

echo "==> Checking MCP endpoint at ${POSTIZ_URL}${MCP_PATH}"
MCP_RESPONSE="$(curl -sS --connect-timeout 10 -X POST "${POSTIZ_URL}${MCP_PATH}" \
  -H "Authorization: Bearer ${POSTIZ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"verify-script","version":"1.0"}}}' || true)"

if echo "$MCP_RESPONSE" | grep -q '"result"'; then
  echo "PASS: MCP connected successfully"
  echo "$MCP_RESPONSE" | head -c 300
  echo
  exit 0
fi

echo "FAIL: MCP did not initialize"
echo "$MCP_RESPONSE"
exit 1
