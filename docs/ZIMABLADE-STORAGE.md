# ZimaBlade storage

| Device | Mount | Size | Purpose |
|---|---|---|---|
| mmcblk0p2 (eMMC) | `/` | 26.7 GiB | OS, `/var/log`, `/var/cache`, CasaOS `/DATA/AppData` (incl. NPM logs), `/home` |
| sda1 Samsung 870 EVO | `/mnt/Deadpool-1` | 916 GiB | Docker data-root, HUOC deploy state/builds, recovery archives, app data for Uptime Kuma/AdGuard |

Keep `/` below 70 %. `huoc-disk-watch.timer` (15 min) logs to the journal with tag `huoc-disk-watch` and writes `/mnt/Deadpool-1/huoc-recovery/disk-watch.status`.

Retention now in force: journald `SystemMaxUse=200M`; rsyslog logrotate daily with `maxsize 200M`, 7 rotations, compressed, checked hourly; APT `Keep-Downloaded-Packages "false"`; NPM's own weekly rotation inside its container (access ×4, error ×10).

Known remaining consumers (owner decisions pending): current NPM logs on the eMMC (relocate to Deadpool at the cutover window), Technitium stats/log retention (UI), casaos caches and 2025 scan dumps (~1.1 GB), stale `nextcloud`/`mariadb` AppData (0.85 GB), dead-service packages, kernel 6.1.0-30.

Full forensics, incident record and evidence: `ZIMABLADE-STORAGE-FORENSICS.md` in the operator's project folder and `/mnt/Deadpool-1/huoc-recovery/`.
