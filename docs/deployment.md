# First-time production deployment setup

After setup, pushes to `main` validate the application, publish the full commit SHA to GHCR, update only `protocol-osi-web`, wait for its health check, verify public HTTPS routes, and roll back to the previous image digest if checks fail.

This setup could not be completed from the current environment: the GitHub repository has no Actions secrets, the available SSH identities cannot authenticate to the supplied Contabo host, and `/srv/apps/protocol-osi` is not mounted here. Do this once before the first deployment push.

## Restricted VPS access

Use a dedicated deployment account that is not in the Docker group and has no general root or shell access. Install these repository files as root-owned, non-writable-by-deploy-user executables:

- `scripts/protocol-osi-deploy` at `/usr/local/sbin/protocol-osi-deploy`
- `scripts/protocol-osi-deploy-gateway` at `/usr/local/libexec/protocol-osi-deploy-gateway`

Allow the account to run only the root wrapper through `sudo -n`, using one exact rule in `/etc/sudoers.d/protocol-osi-deploy`. Restrict its SSH public key with `restrict,command="/usr/local/libexec/protocol-osi-deploy-gateway"` in `authorized_keys`. The gateway accepts only a full `sha-<40 hex>` image reference, a GHCR rollback digest, or a read-only wrapper-version check. The workflow rejects a wrapper whose SHA-256 differs from the repository copy.

Obtain the VPS host key through the Contabo console or another trusted channel. Do not create the pin with an unauthenticated `ssh-keyscan` result. Confirm the wrapper can access the existing Compose project at `/srv/apps/protocol-osi` and that `protocol-osi-web` is running on `protocol-osi-edge` with its existing Traefik labels, non-root user, read-only root filesystem, dropped capabilities, resource limits, mounts, and a health check. The wrapper refuses a deployment if those settings change or the expected service, network, or routing labels are absent.

## GitHub Actions secrets

Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `DEPLOY_VPS_HOST`
- `DEPLOY_VPS_PORT`
- `DEPLOY_VPS_USER`
- `DEPLOY_VPS_SSH_KEY` — private key matching the restricted `authorized_keys` entry
- `DEPLOY_VPS_KNOWN_HOSTS` — pinned known-hosts entry for the host and port above

The workflow uses the built-in `GITHUB_TOKEN` with `packages: read` to pull the private GHCR image. It passes the token over the verified SSH connection, uses a temporary Docker credential directory for the pull, and removes that directory afterward. GHCR must grant this repository's Actions token read access to `mralonsocorona/protocol-osi-lab`.

Once those VPS and GitHub settings are in place, the deployment workflow needs no per-release command beyond `git push origin main`.
