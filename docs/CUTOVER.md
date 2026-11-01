# Production cutover — approval checkpoint (STOP: owner approval required)

## Status: EXECUTED (option A) — 2026-11-01

| Step | Time (CST) | Evidence |
|---|---|---|
| Owner approval of option A | 16:0x | chat, written |
| PR #18 merged (one-time admin bypass explicitly authorized at head 1a0ee28; protection unchanged) | 16:12 | main = `bd3c160` (parents 1bc36a5 + 1a0ee28), merged by DaleDibbadel |
| CI on main commit | 16:25–16:26 | `workflow_dispatch` run 41357064887: typecheck / lint / build success (main's ci.yml still lacked the main trigger; fixed on dev at 1885e77) |
| A1 prod timer enabled (owner, root) | 16:30:03 | `huoc-deploy@prod.timer` enabled; gate green for bd3c1606; build 20 s; `DEPLOYED bd3c1606 on :8092` 16:30:26 |
| A2 huoc-prod verified | 16:31 | :8092 200, `/DEPLOYED_SHA.txt` = bd3c160…, title `HUOC`, heading "Expertise in", SPA 200, assets 200 |
| A3 NPM host 42 forward port 8090 → 8092 (owner, NPM UI) | 16:34 | conf diff `set $port 8090 → 8092`; public HTTPS HTTP/2 200, title `HUOC`, served SHA bd3c160…, cert and security headers identical to before |
| A4 burn-in | 16:34 → 2026-11-02 16:34 | `huoc-v1` left running on 8090 (unreferenced) |
| A5 stop `huoc-v1` | pending after burn-in | owner decision; image archived in baseline-20261101-083521 |

Rollback (any time): NPM host 42 forward port back to 8090 (`huoc-v1` is still running). Pre/post evidence: `/mnt/Deadpool-1/huoc-recovery/cutover-20261101/`.

---

Original checkpoint text follows (as approved).

## 1. Current production (unchanged)
- Container `huoc-v1` (image `fb6f87e3…`, created 2026-07-20, started 2026-10-31T01:04:51Z, `--restart unless-stopped`), port 8090 → NPM proxy host 42 `helpdesk.homeguardofbill-huoc.com` → public HTTPS 200.
- Serves the committed `dist/` of dev commit c0b939f (title `vite-app`, heading "Experts in").
- Baseline archive: `/mnt/Deadpool-1/huoc-recovery/baseline-20261101-083521/` (image tar, inspect JSON, NPM host config, live HTML).

## 2. What will go live
- Branch `main` after PR #18 (dev → main) is merged: React/Vite site built from source, title `HUOC`, heading "Expertise in", CI workflow, deployer, docs. The 10 obsolete static-site files on main are removed by the PR (`Testerb.html`, `bak.index.html.bak`, `fox.jpg*`, `indexTESTING.html`, `inside.html`, `login.css`, `testb.html`); CODEOWNERS and CodeQL are kept.
- Same Dockerfile, deployer code and health checks as staging; only the env file differs (`NAME=prod BRANCH=main PORT=8092`).

## 3. Preconditions (all must be true)
1. PR #18 reviewed and merged by the owner (protection: 1 approving review; the repository admin can complete it). Recommended first: add required status check `typecheck / lint / build` to `main` protection (owner approval needed to change protection).
2. CI green on the resulting `main` tip (ci.yml now also runs on pushes to main, so the merge commit gets a check-run; the prod gate needs it).
3. Root filesystem < 70 % (now 49 %), Deadpool mounted, Docker healthy.
4. Maintenance window agreed (expected visible impact: none with option A).

## 4. Procedure (option A — recommended, zero-downtime, instant rollback)
| Step | Command / action | Verify |
|---|---|---|
| A1 | `sudo install -m 644 /mnt/Deadpool-1/huoc-deploy/systemd/huoc-deploy@.{service,timer} /etc/systemd/system/` (already present) and `sudo systemctl enable --now huoc-deploy@prod.timer` | timer listed; prod gate log |
| A2 | wait ≤ 2 min: deployer builds `main` tip → `huoc-prod` on 8092 | `curl -s http://10.0.0.201:8092/DEPLOYED_SHA.txt` = main tip; title `HUOC` |
| A3 | NPM UI → proxy host 42 → Forward Port 8090 → **8092**, save (nginx reload, no downtime) | public site shows title `HUOC`, 200, HTTPS cert unchanged |
| A4 | burn-in 24 h with `huoc-v1` left running on 8090 (unreferenced) | Uptime Kuma / OneUptime green |
| A5 | after burn-in: `docker stop huoc-v1` (keep container and archived image) | public still 200 |
Rollback at any point: NPM host 42 Forward Port back to **8090** (if A5 done: `docker start huoc-v1` first). Seconds, no rebuild.

Option B (if you prefer port 8090 for prod): stop `huoc-v1`, set `PORT=8090` in production.env, run the deployer; ~5–10 s downtime; rollback = `docker start huoc-v1` after stopping `huoc-prod`.

## 5. What stays disabled / untouched
- `huoc-deploy@prod.timer` until A1. No other NPM host, no UniFi/Kubernetes/Technitium/Vaultwarden/Uptime Kuma change.
- Historical directories under `/home/casaos` untouched.

## 6. Risks
| Risk | Mitigation |
|---|---|
| merge commit on main without CI run | fixed: ci.yml runs on push to main; gate waits otherwise |
| prod image differs from staging image | same Dockerfile and commit content; `DEPLOYED_SHA.txt` proves the SHA |
| NPM mis-edit | only the forward port changes; rollback is the same edit |
| eMMC fills again | caps and disk watch in place; builds on Deadpool |
| owner cannot approve own PR | admin merge without review is possible (enforce_admins off) — owner decision |

## 7. Approval needed from the owner (explicit, written)
1. Merge PR #18 (or authorize me to merge it as admin).
2. Approve option A (or B) and the window.
3. Authorize `huoc-deploy@prod.timer` enablement (root command) and the NPM host 42 port change.
Optional: required status check on `main`; remove obsolete `casaos` cron job; Grafana permission fix; casaos cache cleanup.
