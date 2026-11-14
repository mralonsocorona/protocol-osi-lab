#!/usr/bin/env bash
set -Eeuo pipefail
set +x
umask 077

required=(DEPLOY_VPS_HOST DEPLOY_VPS_PORT DEPLOY_VPS_USER DEPLOY_VPS_SSH_KEY DEPLOY_VPS_KNOWN_HOSTS GHCR_TOKEN GITHUB_ACTOR GITHUB_SHA)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Required Actions secret or variable is missing: $name" >&2
    exit 2
  fi
done

[[ "$DEPLOY_VPS_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || { echo "DEPLOY_VPS_HOST must be a hostname or IPv4 address." >&2; exit 2; }
[[ "$DEPLOY_VPS_PORT" =~ ^[0-9]{1,5}$ ]] && (( DEPLOY_VPS_PORT > 0 && DEPLOY_VPS_PORT < 65536 )) || { echo "DEPLOY_VPS_PORT is invalid." >&2; exit 2; }
[[ "$DEPLOY_VPS_USER" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]] || { echo "DEPLOY_VPS_USER is invalid." >&2; exit 2; }
[[ "$GITHUB_ACTOR" =~ ^[A-Za-z0-9-]+$ ]] || { echo "GitHub registry username is invalid." >&2; exit 2; }
[[ "$GITHUB_SHA" =~ ^[a-f0-9]{40}$ ]] || { echo "The workflow commit SHA is invalid." >&2; exit 2; }

readonly image="ghcr.io/mralonsocorona/protocol-osi-lab:sha-$GITHUB_SHA"
readonly target="$DEPLOY_VPS_USER@$DEPLOY_VPS_HOST"
readonly temp_dir="$(mktemp -d "${RUNNER_TEMP:-/tmp}/protocol-osi-deploy.XXXXXX")"
readonly key_file="$temp_dir/deploy-key"
readonly hosts_file="$temp_dir/known-hosts"
trap 'rm -rf "$temp_dir"' EXIT

printf '%s\n' "$DEPLOY_VPS_SSH_KEY" > "$key_file"
printf '%s\n' "$DEPLOY_VPS_KNOWN_HOSTS" > "$hosts_file"
chmod 600 "$key_file" "$hosts_file"

host_key_name=$DEPLOY_VPS_HOST
if [[ "$DEPLOY_VPS_PORT" != 22 ]]; then host_key_name="[$DEPLOY_VPS_HOST]:$DEPLOY_VPS_PORT"; fi
ssh-keygen -F "$host_key_name" -f "$hosts_file" >/dev/null || {
  echo "DEPLOY_VPS_KNOWN_HOSTS does not contain a pinned host key for the configured host and port." >&2
  exit 2
}

ssh_opts=(-p "$DEPLOY_VPS_PORT" -i "$key_file" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$hosts_file" -o GlobalKnownHostsFile=/dev/null -o ConnectTimeout=15 -o ServerAliveInterval=30 -o ServerAliveCountMax=3)
ssh_to_vps() { ssh "${ssh_opts[@]}" "$target" "$@"; }

expected_wrapper_hash=$(sha256sum scripts/protocol-osi-deploy | awk '{print $1}')
remote_wrapper_hash=$(ssh_to_vps version)
if [[ "$remote_wrapper_hash" != "$expected_wrapper_hash" ]]; then
  echo "The VPS deployment wrapper is missing or differs from scripts/protocol-osi-deploy." >&2
  exit 2
fi

echo "Deploying $image to the Protocol OSI service."
echo "::add-mask::$GHCR_TOKEN"
set +e
deploy_output=$(printf '%s' "$GHCR_TOKEN" | ssh_to_vps "deploy $image $GITHUB_ACTOR" 2>&1)
deploy_status=$?
set -e
if [[ "$deploy_status" -ne 0 ]]; then
  printf '%s\n' "$deploy_output" >&2
  echo "The VPS deployment command failed." >&2
  exit "$deploy_status"
fi

previous_image=$(printf '%s\n' "$deploy_output" | sed -n 's/^PREVIOUS_IMAGE=//p' | tail -n 1)
[[ "$previous_image" =~ ^ghcr\.io/mralonsocorona/protocol-osi-lab@sha256:[a-f0-9]{64}$ ]] || {
  echo "The VPS did not return a valid previous image digest." >&2
  exit 1
}
printf '%s\n' "$deploy_output" | sed '/^PREVIOUS_IMAGE=/d'
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then printf 'previous_image=%s\n' "$previous_image" >> "$GITHUB_OUTPUT"; fi

check_status() {
  local path=$1 status
  status=$(curl --fail --retry 4 --retry-all-errors --retry-delay 2 --connect-timeout 10 --max-time 30 -sS -D "$temp_dir/headers" -o "$temp_dir/response" -w '%{http_code}' "https://blacknova.mx$path") || status=000
  if [[ "$status" != 200 ]]; then
    echo "HTTPS verification failed for $path (HTTP $status)." >&2
    return 1
  fi
}

verification_failed=0
for route in / /capas /health /manifest.webmanifest /service-worker.js; do
  if ! check_status "$route"; then verification_failed=1; fi
done
if [[ "$verification_failed" -eq 0 ]] && ! grep -qi '^Service-Worker-Allowed:[[:space:]]*/capas[[:space:]]*$' "$temp_dir/headers"; then
  echo "The production service worker response does not scope registration to /capas." >&2
  verification_failed=1
fi
if [[ "$verification_failed" -eq 0 ]]; then
  if ! curl --connect-timeout 10 --max-time 30 -fsS -D "$temp_dir/manifest-headers" https://blacknova.mx/manifest.webmanifest -o "$temp_dir/manifest" \
    || ! grep -qi '^Content-Type:[[:space:]]*application/manifest+json' "$temp_dir/manifest-headers" \
    || ! jq -e '.start_url == "/capas" and .scope == "/capas" and .display == "standalone"' "$temp_dir/manifest" >/dev/null; then
    echo "The production web manifest failed its MIME type or launch-scope check." >&2
    verification_failed=1
  fi
fi
if [[ "$verification_failed" -eq 0 ]]; then
  if ! curl --connect-timeout 10 --max-time 30 -fsS https://blacknova.mx/health -o "$temp_dir/health" || ! grep -qx 'ok' "$temp_dir/health"; then
    echo "The production health endpoint did not return ok." >&2
    verification_failed=1
  fi
fi
if [[ "$verification_failed" -eq 0 ]]; then
  echo "HTTPS checks passed for /, /capas, /health, the manifest, and the scoped service worker."
  exit 0
fi

echo "Rolling back Protocol OSI to the previous image digest."
if ! ssh_to_vps "rollback $previous_image"; then
  echo "Public verification failed and the VPS rollback command also failed." >&2
  exit 1
fi
echo "Rollback completed; the deployment job remains failed because public verification failed."
exit 1
