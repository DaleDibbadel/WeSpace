# Architecture

## Flow
```
VS Code (Remote-SSH) ──▶ HUOC-UTILITY (Windows Server 2025, 192.168.2.253)
                          C:\Users\rooty\Documents\GitHub\WeSpace, branch dev
                                │ git push origin dev
                                ▼
                      GitHub DaleDibbadel/WeSpace
                      ├─ CI (ci.yml): typecheck → lint → build → dist artifact   (push dev/staging, PR main)
                      ├─ staging  = fast-forward of dev chosen for pre-production testing
                      └─ main     = protected; PR dev→main, 1 review; production source after cutover
                                │ public HTTPS clone + public check-runs API (no token)
                                ▼
                      ZimaBlade 10.0.0.201 (Debian 12, Docker data-root /mnt/Deadpool-1/docker)
                      huoc-deploy@staging.timer (every 2 min) → huoc-deploy.sh staging.env
                        1. git ls-remote tip of `staging`
                        2. skip if deployed & healthy
                        3. CI gate: all CI check-runs for that SHA must be success
                        4. shallow fetch exact SHA → docker build (multi-stage) → image huoc-staging:<sha>
                        5. candidate container on 127.0.0.1:18091, HTTP 200 + DEPLOYED_SHA.txt check
                        6. tag :current→:previous, replace huoc-staging on :8091, re-check, else rollback
                      huoc-deploy@prod (BRANCH=main, PORT 8092 provisional) — NOT enabled before cutover
                                │
                      Nginx Proxy Manager (container, host 42 helpdesk.homeguardofbill-huoc.com) ──▶ 10.0.0.201:8090 huoc-v1 (live, unchanged)
```

## Hosts
| Host | Role | Notes |
|---|---|---|
| HUOC-UTILITY 192.168.2.253 (Tailscale 100.103.158.68) | only permanent dev workstation | OpenSSH, GitHub CLI (`gh`), Node 22 via nvm4w, pnpm 11; VS Code server runs here |
| ZimaBlade 10.0.0.201 | production + staging runtime | 27 GB eMMC root (keep < 70 %), 1 TB `/mnt/Deadpool-1` (Docker data-root, deploy state, archives); user `casaos` (docker group, no passwordless sudo) |
| CasaOS VM 10.0.0.31 | unrelated services | out of scope |
| Mac | operator console only | nothing depends on it |

## Why pull-based
No credentials on GitHub or on the Mac, nothing inbound to the homelab, works while any laptop is offline, and a build failure or unhealthy candidate can never replace the running container. The CI gate reuses GitHub's own verdict for the exact commit.

## Branches
- `dev`: integration branch, CI on every push.
- `staging`: pointer that selects what the staging deployer builds (normally `git branch -f staging dev && git push origin staging`). Negative tests may push broken commits here on purpose.
- `main`: protected. Still holds the obsolete static site (title "HUOC", `COPY . /usr/share/nginx/html`). PR #18 dev→main is the promotion vehicle; it must be merged so that main's tree equals dev's (see docs/DEPLOYMENT.md "Promotion").
- Historical: `codex/*` and `DaleDibbadel-patch-1` are untouched.
