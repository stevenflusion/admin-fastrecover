#!/bin/bash
# ============================================================
# wait-healthy.sh — Espera a que un contenedor Docker esté healthy
# y luego confirma que responde HTTP
# Fast Recover Admin Panel — Puerto 3000
# Uso: wait-healthy.sh <container_name> [max_attempts] [sleep_seconds] [port]
# ============================================================

CONTAINER="${1:-fastrecover-admin}"
MAX_ATTEMPTS="${2:-30}"
SLEEP_SEC="${3:-2}"

# Puerto interno del container (Fast Recover Admin = 3000)
PORT="${4:-3000}"

echo "Waiting for $CONTAINER to be healthy..."
for i in $(seq 1 "$MAX_ATTEMPTS"); do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo 'unknown')
  if [ "$status" = "healthy" ]; then
    echo "✅ Container $CONTAINER is healthy (Docker)"
    break
  fi
  echo "  attempt $i/$MAX_ATTEMPTS: status=$status"
  sleep "$SLEEP_SEC"
done

if [ "$status" != "healthy" ]; then
  echo "❌ Container $CONTAINER did not become healthy in $((MAX_ATTEMPTS * SLEEP_SEC)) seconds"
  docker logs --tail 20 "$CONTAINER"
  exit 1
fi

# Extra wait: confirm HTTP is actually responding
echo "Confirming HTTP is responding inside container..."
for i in $(seq 1 20); do
  if docker exec "$CONTAINER" wget -qO- "http://localhost:${PORT}/" >/dev/null 2>&1; then
    echo "✅ HTTP responding correctly on port $PORT"
    exit 0
  fi
  echo "  http attempt $i/20: not ready yet"
  sleep 2
done

echo "❌ HTTP did not respond after container became healthy"
docker logs --tail 20 "$CONTAINER"
exit 1
