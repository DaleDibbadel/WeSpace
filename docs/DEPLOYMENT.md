# Deployment

## Staging (active)
- Instance: `NAME=staging BRANCH=staging PORT=8091 CI_GATE=1` (`deploy/staging.env`, installed at `/mnt/Deadpool-1/huoc-deploy/staging.env`).
- Trigger: `huoc-deploy@staging.timer` (every 2 min, 90 s after boot) → `huoc-deploy@staging.service` → `/mnt/Deadpool-1/huoc-deploy/bin/huoc-deploy.sh /mnt/Deadpool-1/huoc-deploy/staging.env`, as user `casaos`, group `docker`. Install/enable with `sudo bash /mnt/Deadpool-1/huoc-deploy/systemd/install-staging-timer.sh` (root; does not enable prod).
- State: `/mnt/Deadpool-1/huoc-deploy/staging/{deploy.log,deployed.sha,builds/<sha>}`; images `huoc-staging:<sha>`, `:current`, `:previous`; container labels `huoc.sha`, `huoc.deployed`.
- Manual run (same code path as the timer): `bash /mnt/Deadpool-1/huoc-deploy/bin/huoc-deploy.sh /mnt/Deadpool-1/huoc-deploy/staging.env`.
- Rollback: `bash /mnt/Deadpool-1/huoc-deploy/bin/huoc-rollback.sh /mnt/Deadpool-1/huoc-deploy/staging.env` (swaps `:previous` back and pins `deployed.sha` so the timer does not immediately redeploy; push a fix or move `staging` to the good commit to move forward again).

## Gates and failure behaviour
| Situation | Behaviour |
|---|---|
| CI not finished for the tip | log "no CI check-runs yet", exit 0, retry next tick |
| CI failed | log "refusing to deploy", running container untouched |
| `docker build` fails | log, exit 1, running container untouched |
| candidate not HTTP 200 within 15 s | candidate logs captured, removed, exit 1, running container untouched |
| new container unhealthy after swap | automatic rollback to `:previous` |
| already at tip and healthy | "nothing to do" |
| another run in progress | `flock`, exit 0 |

## Promotion dev → main (not a deployment until cutover)
`main` still contains the obsolete static site, so a plain merge of PR #18 conflicts. Correct promotion: on `dev`, `git merge -s ours main` (keeps dev's tree, records main as a parent), push dev, then PR #18 becomes a clean fast-forward whose result tree equals dev. Merging requires one approving review (owner decision; `enforce_admins` is off so the repository admin can complete it). Recommended, owner-approved change to protection: require the status check `typecheck / lint / build` on `main`.

## Production (ACTIVE since 2026-11-01 16:34 CST)
- Instance: `NAME=prod BRANCH=main PORT=8092 CI_GATE=1` (`deploy/production.env`; installed as `/mnt/Deadpool-1/huoc-deploy/prod.env`). Timer `huoc-deploy@prod.timer` every 2 min. Container `huoc-prod` on 8092; NPM host 42 (`helpdesk.homeguardofbill-huoc.com`) forwards to 10.0.0.201:8092.
- Release = merge to `main` (PR from dev, 1 review) → CI check-run on the merge commit → timer deploys within ~2 min. **Until main's own `ci.yml` carries the `main` push trigger (it will after the next promotion from dev), a merge commit on main needs `gh workflow run CI --ref main` to get its check-run; the gate waits otherwise.**
- Rollback: `bash /mnt/Deadpool-1/huoc-deploy/bin/huoc-rollback.sh /mnt/Deadpool-1/huoc-deploy/prod.env` (previous image), or NPM host 42 back to 8090 while `huoc-v1` still exists.
- Legacy `huoc-v1` (8090): kept running through the 24 h burn-in, then stopped by owner decision; image archived in `/mnt/Deadpool-1/huoc-recovery/baseline-20261101-083521/` (`huoc-v1.image.tar.gz`).
