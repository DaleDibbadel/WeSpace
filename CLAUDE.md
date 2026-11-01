# HUOC Website — Development & DevOps (CLAUDE.md)

Project rules for anyone (human or Claude) working on this repository. These are permanent.

## What this is
- The HUOC public website (https://helpdesk.homeguardofbill-huoc.com), a React 19 / Vite 8 / TypeScript / Tailwind 4 / shadcn single-page app, package manager pnpm.
- **Authoritative source:** GitHub branch `dev` and its working copy on the Windows Server 2025 dev workstation `HUOC-UTILITY` (192.168.2.253), `C:\Users\rooty\Documents\GitHub\WeSpace`.
- **Production host:** ZimaBlade `10.0.0.201` (Debian 12, Docker, Nginx Proxy Manager). The live container is `huoc-v1` on port 8090, proxied by NPM host 42. **It is not managed by the pipeline until production cutover is explicitly approved by the owner.**
- Staging: container `huoc-staging` on port 8091, built from branch `staging` by the pull-based deployer on ZimaBlade. Isolated: own container, image, port and state; never touches `huoc-v1` or NPM.

## Hard rules
1. Development happens on `HUOC-UTILITY` through VS Code Remote-SSH. The Mac (or any laptop) is a remote control, never a dependency: the pipeline must work with it offline.
2. Never edit production files on ZimaBlade directly. Never `docker exec` into `huoc-v1` to change content.
3. `main` is protected (1 approving review, no force-push, no deletion). Never bypass or weaken protection. Promotion is `dev` → PR → `main`; the obsolete static site that `main` still contains must never be deployed again.
4. Never commit secrets. Deployment needs no GitHub token: the deployer pulls the public repo and reads public check-runs.
5. Every release must have a verified rollback (`deploy/huoc-rollback.sh`, image tag `:previous`).
6. Evidence over existence: a step is done when its output is recorded (CI run id, deployed SHA, health code), not when a file exists.
7. Do not touch unrelated homelab services (NPM hosts other than HUOC, UniFi, Kubernetes, Technitium, Vaultwarden, Uptime Kuma, Cloudflared).
8. Historical site directories on ZimaBlade (`/home/casaos/Archive`, `/home/casaos/helpdesk`, `/home/casaos/huoc-site-8089`, `/home/casaos/hospiceclone`) are read-only history: never modify or delete them without owner authorization.
9. ZimaBlade's 27 GB onboard eMMC is small. Builds and state live on `/mnt/Deadpool-1` (1 TB). Keep `/` under 70 % (`huoc-disk-watch.timer` reports; see `docs/RECOVERY.md`).

## Everyday commands (on HUOC-UTILITY)
```powershell
pnpm install --frozen-lockfile   # once per lockfile change
pnpm dev                         # local dev server
pnpm typecheck; pnpm lint; pnpm build   # what CI runs
git push origin dev              # triggers CI; staging follows when `staging` is fast-forwarded to dev
```

## Where things are
| Thing | Location |
|---|---|
| CI | `.github/workflows/ci.yml` (push to dev/staging, PR to main): typecheck, lint, build, dist artifact |
| Image | `Dockerfile` (multi-stage: node:22-alpine build → nginx:alpine), `nginx-default.conf` (SPA fallback), `/DEPLOYED_SHA.txt` baked in |
| Deployer | `deploy/huoc-deploy.sh` (env-file driven), `deploy/huoc-rollback.sh`, `deploy/staging.env`, `deploy/production.env` (not enabled), `deploy/systemd/huoc-deploy@.{service,timer}` |
| On ZimaBlade | `/mnt/Deadpool-1/huoc-deploy/{bin,staging.env,production.env,systemd,<instance>/deploy.log,<instance>/deployed.sha,<instance>/builds}` |
| Docs | `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `docs/RECOVERY.md`, `docs/VALIDATION.md`, `docs/ZIMABLADE-STORAGE.md` |

## Production cutover (not yet done)
Requires: all staging tests in `docs/VALIDATION.md` PASS, PR dev→main reviewed and merged, owner's explicit written approval, maintenance window, rollback rehearsed. Until then `huoc-deploy@prod.timer` must stay disabled and NPM host 42 must keep pointing at `huoc-v1:8090`.
