# HUOC Website — Infrastructure Record

Permanent technical record for maintenance, troubleshooting and disaster recovery. Every fact below was verified on 2026-11-01 (CST) unless a different date is given. Companion documents: `ARCHITECTURE.md` (flow), `DEVELOPMENT.md` (how to edit and publish), `DEPLOYMENT.md` (pipeline operations), `RECOVERY.md` (rollback and restore), `VALIDATION.md` (test evidence), `CUTOVER.md` (production cutover record), `ZIMABLADE-STORAGE.md` (storage incident and retention). NetBox (`https://nettybox.homeguardofbill-huoc.com`) holds the inventory view and links back here.

## 1. The website and its build system
| Item | Value |
|---|---|
| Public URL | https://helpdesk.homeguardofbill-huoc.com (title `HUOC`) |
| Stack | React 19, Vite 8, TypeScript 6, Tailwind 4, shadcn/ui; package manager pnpm 11; Node 22 |
| Build | `pnpm install --frozen-lockfile`, `pnpm typecheck` (`tsc --noEmit`), `pnpm lint` (eslint 9 flat config), `pnpm build` (`tsc -b && vite build` → `dist/`) |
| Image | `Dockerfile` multi-stage: `node:22-alpine` build stage (corepack pnpm, build) → `nginx:alpine` serving `/usr/share/nginx/html` with `nginx-default.conf` (SPA `try_files … /index.html`); `dist/DEPLOYED_SHA.txt` = commit SHA (`--build-arg GIT_SHA`); image labels `huoc.sha`, `huoc.built` |
| Content locations | `index.html` (title), `src/pages/landing.tsx` (hero heading + typing animation), `src/lib/site-config.ts` (site strings), `src/components/ui/*` (shadcn) |
| Legacy | `dist/` is still tracked in git (stale, no longer deployed); `main` before 2026-11-01 held an obsolete static site (removed by PR #18) |

## 2. Repository `DaleDibbadel/WeSpace` (public)
| Branch | Role | Protection |
|---|---|---|
| `dev` | integration; every push runs CI; staging deploys from it | none |
| `staging` | legacy pointer (the staging deployer now follows `dev`; the branch may be deleted later) | none |
| `main` | production source; PR from dev only | 1 approving review (stale dismissed), required status check **`typecheck / lint / build`** (strict/up-to-date), no force-push, no deletion, `enforce_admins` off |
| `codex/*`, `DaleDibbadel-patch-1` | historical | untouched |

- CI: `.github/workflows/ci.yml` — triggers push `dev`/`staging`/`main`, `pull_request` → `main`, `workflow_dispatch`; job `typecheck / lint / build` (ubuntu-latest, pnpm/action-setup@v4 v11, setup-node@v4 Node 22) uploads `dist-<sha>` artifact (14 days). `codeql.yml` (actions language) on push/PR main + weekly cron. `CODEOWNERS`: `* @DaleDibbadel`.
- Pull requests: #18 (2026-11-01 16:12 CST, first promotion of the React site, one-time admin review bypass explicitly authorized by the owner), #19 (owner's first own change, 18:27 CST). Owner cannot approve own PRs; the required check must be green; the admin "merge without waiting" bypass is the owner's decision each time.
- Deployer scripts live in the repo under `deploy/` and are installed on ZimaBlade manually (copy to `/mnt/Deadpool-1/huoc-deploy/bin/` when changed).

## 3. Development workstation — HUOC-UTILITY
| Item | Value |
|---|---|
| Identity | Windows Server 2025 Datacenter Evaluation 10.0.26100, hostname `HUOC-UTILITY`, domain `brotha.xyz`; Xen HVM domU on the XCP-ng pool (NetBox VM 6 "Windows Server 2025", UUID `eded86db-c8be-4295-9012-04a1b12b7765`) |
| Network | `192.168.2.253/24` (MotherLan, DHCP, gw 192.168.2.1, DNS 192.168.2.240); Tailscale `100.103.158.68` (`huoc-utility.tail9380d4.ts.net`) |
| Working copy | `C:\Users\rooty\Documents\GitHub\WeSpace`, branch `dev`, remote `origin` = the repo; git identity `DaleDibbadel <134179283+DaleDibbadel@users.noreply.github.com>`; `core.autocrlf=true` |
| Editors | Local VS Code 1.128 (`C:\Program Files\Microsoft VS Code`) and VS Code Remote-SSH from the Mac (`~/.ssh/config` aliases `huoc-utility` → 192.168.2.253, `huoc-utility-ts` → 100.103.158.68, `remote.SSH.remotePlatform=windows`). **Both open the same folder** — verified: local VS Code's recent-workspace list shows `file:///c:/Users/rooty/Documents/GitHub/WeSpace`, and the Remote-SSH window title ends with `[SSH: huoc-utility]`. |
| Toolchain | Node 22 via nvm4w (`C:\nvm4w\nodejs`), pnpm 11, Git for Windows, GitHub CLI 2.103 (`C:\Program Files\GitHub CLI\gh.exe`) logged in as `DaleDibbadel`, token stored in `%APPDATA%\GitHub CLI\hosts.yml` (`--insecure-storage`, required so non-interactive sessions can push), git credential helper `gh auth git-credential` |
| Access | OpenSSH server tcp/22 (key auth; the project key `claude_huoc_ed25519` is in `C:\ProgramData\ssh\administrators_authorized_keys`), RDP 3389, WinRM 5985, Zabbix agent 10050; SQL Server 1433 also listens (not part of this project) |
| Not a dependency | the Mac: it is only a remote keyboard; nothing in the pipeline runs on it |

## 4. ZimaBlade — production and staging host (`casahos`, NetBox device 4)
| Item | Value |
|---|---|
| Hardware | IceWhale ZimaBlade (board ZBB001-BK10032, BIOS 5.12), Intel Celeron N3450 4 cores, 16 GiB RAM, onboard eMMC BJTD4R 29.1 GiB (serial 0xada44a9d, 09/2023), Samsung SSD 870 EVO 1 TB (serial S75BNL0X414041W, WWN 0x5002538f5441c5f3) |
| OS | Debian 12.9 (bookworm), kernel 6.1.0-31-amd64; Docker 28.2.2, containerd 1.7.27, Compose v2.36.2, buildx 0.24 |
| Network | `enp2s0` 10.0.0.201/24 (MAC 00:e0:4c:34:b6:6e), Tailscale 100.102.228.20, ZeroTier 10.247.0.1/16; DNS served locally by Technitium |
| Users | `casaos` (uid 1000, groups docker, sudo-with-password; runs the deployer), root (owner only) |
| Storage | see §7 |
| Containers (HUOC) | `huoc-prod` → 0.0.0.0:8092 (image `huoc-prod:current`, built from main), `huoc-staging` → 8091 (from dev), `huoc-v1` → 8090 (legacy, July 2026 image `fb6f87e3…`, fallback only) |
| Containers (other, unchanged) | `nginxproxymanager` 2.16.0 (80/81/443), `technitium-dns-kong` (53, 853, 5380, 53443, 8053), `vaultwarden` (10380), `uptimekuma`, `cloudflared`, `glances` (61208/9), `openspeedtest` (3004), two OneUptime agents; stopped: grafana (permission error on its data dir, pre-existing), adguard-home, several `_old` containers |
| systemd (HUOC) | `huoc-deploy@.service` (oneshot, User=casaos, Group=docker, `ExecStart=/mnt/Deadpool-1/huoc-deploy/bin/huoc-deploy.sh /mnt/Deadpool-1/huoc-deploy/%i.env`), `huoc-deploy@.timer` (`OnBootSec=90s`, `OnUnitActiveSec=2min`, `WantedBy=timers.target`); instances `staging` and `prod` enabled; `huoc-disk-watch.timer` (15 min, report-only) |
| Disabled 2026-11-01 (owner-approved) | `softflowd` (debug logging flood), `webhook-relay` (restart loop), and — via the stage-2 incident, kept disabled by owner decision — githubrelay, influxdb, telegraf, wazuh-agent, adguardhome, AdGuardHome, ulogd2, zima-sync.timer, postgresql; the per-minute casaos cron job (commented out, original line preserved) |

## 5. Ports and endpoints
| Port | Where | What | Reachability |
|---|---|---|---|
| 443/80 | ZimaBlade NPM | public HTTPS/HTTP for all `*.homeguardofbill-huoc.com` hosts; HTTP→HTTPS 301 | Internet (via UniFi gateway / Cloudflare DNS) |
| 81 | ZimaBlade NPM | NPM admin UI | LAN only |
| 8092 | ZimaBlade | **huoc-prod** (production) — backend of NPM host 42 | LAN; public only through NPM |
| 8091 | ZimaBlade | huoc-staging | LAN only |
| 8090 | ZimaBlade | huoc-v1 legacy fallback | LAN only (no NPM route since cutover) |
| 18091/18092 | ZimaBlade 127.0.0.1 | transient candidate containers during a deploy | localhost only |
| 22 | ZimaBlade / HUOC-UTILITY | SSH (deployment never uses inbound SSH) | LAN/Tailscale |
| 18080 | CasaOS VM 10.0.0.31 | NetBox (published as `nettybox.homeguardofbill-huoc.com` through NPM) | LAN; public through NPM |
| 53 / 853 / 5380 | ZimaBlade | Technitium DNS / DoT / web console | LAN |

## 6. DNS, HTTPS, reverse proxy, deployment flow
- Public DNS for `homeguardofbill-huoc.com` is at Cloudflare (requests to the uptime host arrive from Cloudflare ranges); NPM terminates TLS with a **Let's Encrypt wildcard certificate `*.homeguardofbill-huoc.com`** (issuer "YE2", valid to 2026-12-23; renewed by NPM). Internal resolution: Technitium on 10.0.0.201.
- NPM proxy host 42: `helpdesk.homeguardofbill-huoc.com` → `http://10.0.0.201:8092`, config file `/DATA/AppData/nginxproxymanager/data/nginx/proxy_host/42.conf` (on the eMMC), access/error logs under `/DATA/AppData/nginxproxymanager/data/logs/`.
- Flow: edit on HUOC-UTILITY → `git push origin dev` → CI → `huoc-deploy@staging.timer` builds `dev` → `huoc-staging:8091` → PR dev→main (review + required check) → merge → CI on the merge commit → `huoc-deploy@prod.timer` builds `main` → candidate health check → `huoc-prod:8092` replaced → public site updated. Rollback paths in §9.

## 7. Deadpool storage layout and mount dependencies
| Device | Mount | FS / UUID | Holds |
|---|---|---|---|
| `mmcblk0p1` 512 M | `/boot/efi` | vfat `6F1C-DF22` | EFI |
| `mmcblk0p2` 26.7 G | `/` | ext4 `0f69b082-1188-45a9-85c8-06af47bf0e61` | OS, `/var/log`, `/var/cache`, CasaOS `/DATA/AppData` (incl. NPM logs), `/home` — **keep < 70 %** (49 % after remediation) |
| `mmcblk0p3` 1.9 G | swap | `20403dbb-…` | |
| `sda1` 916 G ("Deadpool-1") | `/mnt/Deadpool-1` | ext4 `96968b85-b066-498e-b4d5-c7a3d2348b34`, fstab `defaults,noatime,nofail,x-systemd.device-timeout=30s` | Docker data-root `/mnt/Deadpool-1/docker` (daemon.json), HUOC deploy state `/mnt/Deadpool-1/huoc-deploy`, recovery archives `/mnt/Deadpool-1/huoc-recovery`, Uptime Kuma, AdGuard, pgsql, old backups |
- `docker.service` drop-in `10-require-deadpool.conf`: `RequiresMountsFor=/mnt/Deadpool-1`, `ConditionPathIsMountPoint=/mnt/Deadpool-1` → Docker (and therefore every container and the deployer) does not start if Deadpool is missing; nothing falls back onto the eMMC.
- `/mnt/Deadpool` (the previous, removed disk's mount point) was renamed to `/mnt/Deadpool.removed-disk-20261101`; services that still referenced it are disabled.

## 8. ZimaBlade root-storage incident (2026-10-31/11-01) — cause, fixes, retention, monitoring
- Symptom: `/` 100 % (16 MB free incl. reserve), journald stopped 22:09 on 31 Oct, logrotate failing, `docker exec` ENOSPC, two containers "unhealthy".
- Root cause: `softflowd.service` started with `-D` (debug: prints every flow) and no `-n` collector → ~1.7 GB/day into `/var/log/syslog` (84.6 % of lines), retained 7 days. Contributors: `webhook-relay` restart loop (27k restarts), NPM logs 3.1 GB on the eMMC, netdata leftovers 4.3 GB (service disabled since April, updater still downloading packages), APT cache 1.8 GB.
- Fixes (owner-approved stages 1–2): softflowd and webhook-relay disabled (configs preserved), `apt-get clean`, rotated syslog archived (checksummed) to Deadpool and removed, NPM in-container log rotation run, netdata journal namespace and cache moved to Deadpool, netdata packages purged, `/etc/logrotate.d/rsyslog` = daily + `maxsize 200M` + rotate 7 + compress with an hourly `logrotate.timer` override, `APT::Keep-Downloaded-Packages "false"`, `huoc-disk-watch.timer` every 15 min (WARNING ≥ 70 %, CRITICAL ≥ 85 %, journal tag `huoc-disk-watch`, status file `/mnt/Deadpool-1/huoc-recovery/disk-watch.status`; deletes nothing).
- Result: 26.2 GiB → 12.0 GiB used (49 %); syslog growth from ~1.2 MB/min to tens of KB/min. Pending owner decisions: relocate NPM logs to Deadpool (needs NPM restart), Technitium retention, casaos caches, stale AppData, dead packages, old kernel.
- Evidence: `/mnt/Deadpool-1/huoc-recovery/stage1-20261101-115901/`, `stage2-20261101-132932/`, and the operator's `ZIMABLADE-STORAGE-FORENSICS.md`.

## 9. Stage-2 script incident and safeguards
The stage-2 toolkit ran three operations the owner had not approved (`netdata-purge`, `rename-old-deadpool`, `disable-dead-units`) because its gate tested each operation name against its own argument list, which always matched. Impact: none on running services (every unit disabled was already failed/inactive; netdata data had been moved and verified first; the renamed path was an empty stale directory). Evidence preserved: `/mnt/Deadpool-1/huoc-recovery/evidence-stage2-incident/{remediate-stage2.sh.as-run,stage2.log.as-run}`. Corrected script (`remediate-stage2-fixed.sh`) keeps the approved list in one variable, prints a "will run / will NOT run" self-test and aborts if any unapproved operation would execute; it no longer restarts `logrotate.timer` (that caused a lock collision). Rule going forward: every privileged script prints its plan and refuses on mismatch before touching anything.

## 10. Recovery procedures (summary — details in RECOVERY.md)
| Situation | Action |
|---|---|
| Bad release in production | `bash /mnt/Deadpool-1/huoc-deploy/bin/huoc-rollback.sh /mnt/Deadpool-1/huoc-deploy/prod.env` (seconds; previous image) — or fix forward with a new PR |
| Pipeline must stop | `sudo systemctl stop huoc-deploy@prod.timer` (and/or staging); start to resume |
| NPM mis-route | NPM UI → host 42 → forward port 8092 (prod) / 8090 (legacy huoc-v1 while it exists) |
| huoc-prod lost | the timer rebuilds it from `main` automatically (remove `deployed.sha` to force) |
| Whole host rebuilt | restore Docker on Deadpool, install units from `deploy/systemd/`, copy `deploy/*.env` → `/mnt/Deadpool-1/huoc-deploy/{prod,staging}.env`, enable timers; the site rebuilds itself from GitHub. Legacy image: `/mnt/Deadpool-1/huoc-recovery/baseline-20261101-083521/huoc-v1.image.tar.gz` |
| GitHub unavailable | production keeps serving; deployer logs "cannot resolve" and does nothing |
| Deadpool missing | Docker refuses to start (by design); fix the mount first |

## 11. Exact steps to edit and publish the website
1. Open the folder `C:\Users\rooty\Documents\GitHub\WeSpace` on HUOC-UTILITY (local VS Code, or VS Code Remote-SSH to `huoc-utility`). Confirm branch `dev` (`git status -sb`), pull: `git pull --ff-only origin dev`.
2. Edit under `src/` (pages, components, `site-config.ts`) or `index.html`. Preview: `pnpm dev` (forward port 5173 if remote).
3. Validate exactly what CI runs: `pnpm typecheck; pnpm lint; pnpm build`. Then discard build noise: `git checkout -- dist; git clean -fdq dist`.
4. Commit and push: `git add -A; git commit -m "..."; git push origin dev`. Within ~1 min CI is green; within ~2 min `http://10.0.0.201:8091/` serves it (`/DEPLOYED_SHA.txt`).
5. Promote: open a PR dev → main (`gh pr create --base main --head dev` or GitHub UI). Wait for the required check. Merge (as admin you will be offered "merge without waiting for requirements" because you cannot approve your own PR; this is your decision each time).
6. Within ~2 min of the merge the production timer builds the merge commit and swaps `huoc-prod`; verify `https://helpdesk.homeguardofbill-huoc.com/DEPLOYED_SHA.txt` equals the main tip.
7. If something is wrong: rollback command in §10, then fix forward on `dev`.

## 12. Measured timings (2026-11-01, from GitHub Actions and deploy logs)
| Stage | Measured |
|---|---|
| CI job (typecheck, lint, build) | 17–32 s per run |
| Push to dev → staging live (test H, no human in the loop) | 73 s |
| PR merge → production live (PR #19) | merged 18:27:49, CI on merge commit 18:27:53–18:28:10, timer tick 18:29:03, live 18:29:25 → **96 s** |
| Owner's own change end to end (commit 18:24:40 → push ≈ 18:25:3x → PR created 18:27:30 → merged 18:27:49 → live 18:29:25) | ≈ 4 min from push, ≈ 5 min from commit; the manual PR step and the 2-minute timer granularity dominate |
Expected, not a defect: the design trades latency for safety (CI gate + health check) and for having no inbound webhooks. If faster production updates are wanted, set `OnUnitActiveSec=1min` on the timers (halves the worst-case wait).

## 13. Security notes (owner actions recommended)
- `/home/casaos/zima_sync.sh` embeds a GitHub personal access token and wrote `~/.git-credentials`; the `zima-sync` timer is disabled. **Revoke that PAT in GitHub → Settings → Developer settings**; it is not used by the deployment (the deployer needs no token), so revocation is safe.
- `/mnt/Deadpool-1/webhook-relay/app.py` hard-codes a Discord webhook URL and a UniFi shared secret; the relay is disabled — rotate them if the relay is retired for good.
- GitHub CLI token on HUOC-UTILITY is plaintext in the user's profile (`hosts.yml`) by design for unattended pushes; scope `repo, workflow, gist, read:org`; rotate with `gh auth refresh`/re-login if the server is ever compromised.
