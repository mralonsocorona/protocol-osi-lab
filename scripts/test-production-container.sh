#!/usr/bin/env bash
set -Eeuo pipefail

image=${1:?Expected a built image reference}
container="protocol-osi-ci-${GITHUB_RUN_ID:-local}-$$"
container_id=
cleanup() {
  if [[ -n "$container_id" ]]; then docker rm -f "$container_id" >/dev/null 2>&1 || true; fi
}
trap cleanup EXIT

container_id=$(docker run --detach \
  --name "$container" \
  --publish 127.0.0.1::8080 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --pids-limit 128 \
  --memory 256m \
  --cpus 1 \
  "$image")
port=$(docker port "$container_id" 8080/tcp | sed 's/.*://')
base_url="http://127.0.0.1:$port"

for attempt in $(seq 1 45); do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$container_id")
  if [[ "$status" == "healthy" ]]; then break; fi
  if [[ "$status" == "unhealthy" || "$status" == "exited" ]]; then
    docker logs "$container_id"
    echo "Production container did not become healthy." >&2
    exit 1
  fi
  sleep 1
done
[[ "$(docker inspect --format '{{.State.Health.Status}}' "$container_id")" == "healthy" ]] || {
  docker logs "$container_id"
  echo "Timed out waiting for the production container health check." >&2
  exit 1
}

for route in / /capas /health /manifest.webmanifest /service-worker.js; do
  status=$(curl --connect-timeout 3 --max-time 10 -sS -o /dev/null -w '%{http_code}' "$base_url$route")
  [[ "$status" == "200" ]] || { echo "$route returned HTTP $status." >&2; exit 1; }
done
curl --connect-timeout 3 --max-time 10 -sSI "$base_url/manifest.webmanifest" | grep -qi '^Content-Type: application/manifest+json'
curl --connect-timeout 3 --max-time 10 -sSI "$base_url/service-worker.js" | grep -qi '^Service-Worker-Allowed: /capas'
curl --connect-timeout 3 --max-time 10 -fsS "$base_url/health" | grep -qx 'ok'

PLAYWRIGHT_BASE_URL="$base_url" npm test
