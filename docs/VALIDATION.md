# Validation record — staging pipeline (2026-11-01, CST)

All tests ran against the isolated staging instance (`huoc-staging`, port 8091, branch `staging`) on ZimaBlade. The production container `huoc-v1` (started 2026-10-31T01:04:51Z, image `fb6f87e3…`) was checked after every test and never changed; the public site returned HTTP 200 throughout. Root filesystem stayed at 49 %.

| ID | Test | Trigger | Expected | Actual (evidence) | Result |
|---|---|---|---|---|---|
| CI-1 | CI validates dev | `git push origin dev` 251329e | typecheck, lint, build pass; artifact | run 41352524402, job "typecheck / lint / build" success in 22 s, artifact `dist-251329e…` | PASS |
| CI-2 | CI validates staging | push b928c01 to dev and staging | check-run success on the SHA | two check-runs `typecheck / lint / build` completed success | PASS |
| A | First deploy | manual `huoc-deploy.sh staging.env` at 15:33:54 | gate green → build → candidate 200 → container on 8091 | log: gate green 251329eb, build 30 s, `DEPLOYED 251329eb on :8091`; `GET :8091/` 200; `/DEPLOYED_SHA.txt` = 251329eb…; 34 s total | PASS |
| B | Idempotent re-run | same command again | no change | `up to date at 251329eb; healthy; nothing to do`, exit 0 | PASS |
| C | Automatic replacement | new commit b928c01 on staging, CI green, deployer tick | running container replaced by new image, old kept as `:previous` | container id changed (yes), `DEPLOYED b928c011`, images `current`=b928c01, `previous`=251329e, 21 s | PASS |
| D | Content change verified in staging only | same | title `HUOC`, heading "Expertise in", animation preserved, production unchanged | `:8091` `<title>HUOC</title>`, bundle contains "Expertise in" ×1, `typing-cursor` present; `:8090` still `<title>vite-app</title>` | PASS |
| E1 | Failed CI blocks deployment | staging commit 6d60383 with a TypeScript error | CI failure → deployer refuses, no build, no change | check-run `failure`; log `1 CI check-run(s) not successful for 6d603838; refusing to deploy` (twice); serving b928c011; no build dir created | PASS |
| E2 | Unhealthy candidate blocks the swap | staging commit d4080ad with invalid nginx directive (CI passes) | build ok, candidate fails HTTP check, removed, running container untouched, exit 1 | log `candidate FAILED health check` + captured container logs; exit 1 after 36 s; serving b928c011; 0 candidate containers left | PASS |
| F | Rollback | `huoc-rollback.sh staging.env` | previous image back on 8091, `deployed.sha` pinned | `health 200`, `/DEPLOYED_SHA.txt` 251329eb, title `vite-app`, pinned 251329eb; ~3 s | PASS |
| F2 | No forward move while tip is bad | deployer tick after rollback with d4080ad still the tip | candidate fails again, still serving 251329eb | log shows second candidate failure; serving 251329eb | PASS |
| G | Forward recovery | `staging` reset to dev (0dd7be4), deployer tick while pinned at 251329e | redeploys good tip | gate `all 3 CI check-run(s) green for 0dd7be4f` (dev push, staging push and PR#18 each run CI), build 19 s, `DEPLOYED 0dd7be4f`, serving 0dd7be4f, title `HUOC`, image label `huoc.sha`=0dd7be4f; 23 s | PASS |
| G0 | Gate waits while CI is still running | tick at 15:46:31 with 2 of 3 runs in progress | no deploy | held back (message said "refusing"; now distinguishes `still running; waiting` from `FAILED; refusing`) | PASS |
| H | Unattended operation (no Mac, no interactive SSH) | commit edcce8d pushed from HUOC-UTILITY at 15:53:37; nothing run on ZimaBlade | timer alone deploys | `huoc-deploy@staging.timer` fired 15:54:26 (`ExecMainStartTimestamp`), log: gate green → fetch → build → `DEPLOYED edcce8d3 on :8091` at 15:54:50; serving edcce8d3; 73 s push-to-live | PASS |
| I | Reboot persistence | ZimaBlade reboot | timer re-arms 90 s after boot | not executed (reboot is disruptive); unit installed in `/etc/systemd/system`, `enabled`, `WantedBy=timers.target`, `OnBootSec=90s`; Docker guarded by `RequiresMountsFor=/mnt/Deadpool-1` | by design |
| J | Concurrency guard | two deployer runs at once | second exits "another deploy is running" | `flock -n` in script; not separately exercised | by design |
| K | Production isolation | all of the above | `huoc-v1` untouched, NPM untouched, no port 8090/80/443 change | verified after every test (container start time and image unchanged; 200s) | PASS |

Improvements made from the evidence: the CI gate now reports in-progress runs as "waiting" and only failures as "refusing"; images now carry `huoc.sha`/`huoc.built` labels (rollback log said "sha unknown"), and a tip that fails build or health is remembered in `failed.sha` so the timer does not rebuild it every two minutes (E2/F2 showed a 36 s rebuild per tick).

Not part of staging: production cutover (requires owner approval), NPM re-pointing, `main` merge.
