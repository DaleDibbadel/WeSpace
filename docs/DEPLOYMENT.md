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

## Production (NOT enabled)
`deploy/production.env`: `NAME=prod BRANCH=main PORT=8092 CI_GATE=1`. Cutover plan (needs owner approval and a window): install `huoc-deploy@prod.timer`, let it build `main` onto 8092, verify, then either repoint NPM host 42 from 8090 to 8092 (zero-downtime, `huoc-v1` kept as instant fallback) or stop `huoc-v1` and move prod to 8090. `huoc-v1` image is archived in `/mnt/Deadpool-1/huoc-recovery/baseline-20261101-083521/` (`huoc-v1.image.tar.gz`).
