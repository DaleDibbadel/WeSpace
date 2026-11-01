#!/usr/bin/env bash
# Roll the named HUOC instance back to the previously deployed image (:previous).
set -Eeuo pipefail
ENV_FILE="${1:?usage: huoc-rollback.sh /path/to/env-file}"; source "$ENV_FILE"
: "${NAME:?}" "${PORT:?}" "${STATE_DIR:=/mnt/Deadpool-1/huoc-deploy/$NAME}"
IMAGE="huoc-$NAME"; CONTAINER="huoc-$NAME"
docker image inspect "$IMAGE:previous" >/dev/null 2>&1 || { echo "no $IMAGE:previous to roll back to"; exit 1; }
PREV_SHA="$(docker image inspect "$IMAGE:previous" --format '{{index .Config.Labels "huoc.sha"}}' 2>/dev/null || true)"
docker tag "$IMAGE:current" "$IMAGE:rolled-back-from" 2>/dev/null || true
docker tag "$IMAGE:previous" "$IMAGE:current"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" --restart unless-stopped -p "$PORT:80" "$IMAGE:current" >/dev/null
sleep 2; curl -s -o /dev/null -w "health %{http_code}\n" "http://127.0.0.1:$PORT/"
# pin deployed.sha to what is now served so the timer does not immediately redeploy
curl -s "http://127.0.0.1:$PORT/DEPLOYED_SHA.txt" | tr -d '[:space:]' > "$STATE_DIR/deployed.sha" || true
echo "$(date -Is) [$NAME] ROLLED BACK to previous image (${PREV_SHA:-sha unknown})" | tee -a "$STATE_DIR/deploy.log"
