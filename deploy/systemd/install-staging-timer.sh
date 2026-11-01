#!/bin/bash
# Installs the HUOC *staging* auto-deploy timer on ZimaBlade (root required for /etc/systemd/system).
# Production (huoc-deploy@prod) is deliberately NOT enabled by this script.
set -eu
[ "$(id -u)" = 0 ] || { echo "run with sudo"; exit 1; }
SRC=/mnt/Deadpool-1/huoc-deploy/systemd
install -m 644 "$SRC/huoc-deploy@.service" /etc/systemd/system/huoc-deploy@.service
install -m 644 "$SRC/huoc-deploy@.timer"   /etc/systemd/system/huoc-deploy@.timer
systemctl daemon-reload
systemctl enable --now huoc-deploy@staging.timer
echo "--- timer:"; systemctl list-timers 'huoc-deploy@*' --no-pager | head -3
echo "--- prod timer must be absent/disabled:"; systemctl is-enabled huoc-deploy@prod.timer 2>&1 || true
echo "--- first run (manual trigger of the service, same as the timer does):"; systemctl start huoc-deploy@staging.service; sleep 3
tail -n 3 /mnt/Deadpool-1/huoc-deploy/staging/deploy.log
