#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export POSTIZ_API_KEY="${POSTIZ_API_KEY:?Set POSTIZ_API_KEY first}"
export POSTIZ_URL="${POSTIZ_URL:-http://localhost:4007}"

echo "==> Starting Docker (if needed)"
if ! docker info >/dev/null 2>&1; then
  sudo dockerd --storage-driver=vfs >/tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 1; done
fi

echo "==> Cleaning old Postiz containers"
sudo docker rm -f postiz postiz-postgres postiz-redis postiz-postgres-lite postiz-redis-lite 2>/dev/null || true

echo "==> Starting Postiz stack"
cd postiz
sudo docker compose up -d

echo "==> Waiting for Postiz - up to 5 min"
for i in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w "%{http_code}" "$POSTIZ_URL" 2>/dev/null || echo 000)"
  echo "  [$i/60] HTTP $code"
  if [[ "$code" == "200" || "$code" == "302" || "$code" == "307" ]]; then
    break
  fi
  sleep 5
done

echo "==> Verifying MCP"
if POSTIZ_API_KEY="$POSTIZ_API_KEY" POSTIZ_URL="$POSTIZ_URL" bash "$ROOT/scripts/verify-postiz-local.sh"; then
  echo ""
  echo "ALL SET START"
  echo "Postiz: $POSTIZ_URL"
  echo "MCP:    $POSTIZ_URL/api/mcp"
  exit 0
fi

echo ""
echo "Postiz UI may still be booting. Check: cd postiz && sudo docker compose logs -f postiz"
exit 1
