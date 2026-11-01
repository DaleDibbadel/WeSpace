# Recovery

## Production baseline (taken 2026-11-01 before any change)
`/mnt/Deadpool-1/huoc-recovery/baseline-20261101-083521/` — `huoc-v1.image.tar.gz` (docker image), container/image inspect JSON, `docker ps -a`, NPM host 42 config, casaos crontab, live `index.html` and headers, historical source archives, scripts and systemd units, `SHA256SUMS`, `README.txt`.
Restore the live container exactly:
```bash
gunzip -c /mnt/Deadpool-1/huoc-recovery/baseline-20261101-083521/huoc-v1.image.tar.gz | docker load
docker run -d --name huoc-v1 --restart unless-stopped -p 8090:80 huoc-v1:latest
```

## Production rollback
- Fast (seconds): `bash /mnt/Deadpool-1/huoc-deploy/bin/huoc-rollback.sh /mnt/Deadpool-1/huoc-deploy/prod.env` → previous `huoc-prod` image back on 8092.
- Legacy fallback (while `huoc-v1` exists): NPM host 42 forward port 8092 → 8090 (`docker start huoc-v1` first if it was stopped). Pre-cutover config and responses: `/mnt/Deadpool-1/huoc-recovery/cutover-20261101/`.
- Full rebuild from archive: see baseline below.

## Staging rollback
`bash /mnt/Deadpool-1/huoc-deploy/bin/huoc-rollback.sh /mnt/Deadpool-1/huoc-deploy/staging.env` → previous image back on 8091 within ~3 s. Verified in docs/VALIDATION.md (test F).

## Deployer stuck or wrong
- Logs: `/mnt/Deadpool-1/huoc-deploy/staging/deploy.log`, `journalctl -u huoc-deploy@staging`.
- Pause automation: `sudo systemctl stop huoc-deploy@staging.timer`. Resume: `start`.
- Force a rebuild of the current tip: `rm /mnt/Deadpool-1/huoc-deploy/staging/deployed.sha` then run the deployer.

## ZimaBlade root filesystem (27 GB eMMC) — see docs/ZIMABLADE-STORAGE.md
Root cause of the 2026-11-01 outage-grade fill (100 %, 16 MB free) was `softflowd` running in debug mode (`-D`) with no collector, writing ~1.7 GB/day to `/var/log/syslog`, plus NPM logs, netdata leftovers and APT cache on the eMMC. Fixed: softflowd disabled, hourly logrotate with `maxsize 200M`, APT no longer keeps downloads, `huoc-disk-watch.timer` logs WARNING ≥70 % / CRITICAL ≥85 % and writes `/mnt/Deadpool-1/huoc-recovery/disk-watch.status`. Never clean up by hand without the owner's approval; the staged scripts and their logs are under `/mnt/Deadpool-1/huoc-recovery/`.

## Obsolete automation (do not re-enable)
`huoc-web-watch.timer`, `huoc-8089-watch.timer`, `huoc-archive-8090-watch.timer` (disabled), `webhook-relay.service`, `softflowd.service` (disabled 2026-11-01), the per-minute `casaos` cron job that hard-resets `/home/casaos/helpdesk` to `origin/main` and restarts a non-existent container (still present; removal pending owner approval), stale `actions-runner` in `/home/casaos`.
