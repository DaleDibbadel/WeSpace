#!/usr/bin/env bash
# HUOC pull-based deployer for ZimaBlade. One script, two instances (staging / production)
# selected by an environment file. Runs from a systemd timer; safe to run every 2 minutes.
#
#   1. Resolve the tip of $BRANCH on GitHub with `git ls-remote` (no API quota, no token).
#   2. Skip if that SHA is already deployed and the container is healthy (idempotent).
#   3. Require GitHub CI to have passed for that SHA (public check-runs API) unless CI_GATE=0.
#   4. Clone exactly that SHA into a fresh build dir on the data volume, docker build (multi-stage).
#   5. Start a candidate container on a side port, HTTP health check, then swap it onto $PORT.
#   6. Keep the previous image tagged :previous for rollback; write state + log.
# Failure at any step leaves the current container untouched.
set -Eeuo pipefail

ENV_FILE="${1:?usage: huoc-deploy.sh /path/to/env-file}"
# shellcheck disable=SC1090
source "$ENV_FILE"
: "${NAME:?}" "${BRANCH:?}" "${PORT:?}" "${REPO_URL:=https://github.com/DaleDibbadel/WeSpace.git}"
: "${STATE_DIR:=/mnt/Deadpool-1/huoc-deploy/$NAME}" "${CI_GATE:=1}" "${HEALTH_PATH:=/}" "${KEEP_BUILDS:=3}"
: "${API_REPO:=DaleDibbadel/WeSpace}"

mkdir -p "$STATE_DIR/builds"
LOG="$STATE_DIR/deploy.log"
LOCK="$STATE_DIR/.lock"
DEPLOYED_FILE="$STATE_DIR/deployed.sha"
FAILED_FILE="$STATE_DIR/failed.sha"
IMAGE="huoc-$NAME"
CONTAINER="huoc-$NAME"

log(){ printf '%s [%s] %s\n' "$(date -Is)" "$NAME" "$*" | tee -a "$LOG" >&2; }

exec 9>"$LOCK"
if ! flock -n 9; then log "another deploy is running; exit"; exit 0; fi

TARGET_SHA="$(git ls-remote --exit-code "$REPO_URL" "refs/heads/$BRANCH" | cut -f1)" || { log "cannot resolve $BRANCH on $REPO_URL"; exit 1; }
DEPLOYED_SHA="$(cat "$DEPLOYED_FILE" 2>/dev/null || true)"

running(){ docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; }
healthy(){ # $1 = port
  local code; code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$1$HEALTH_PATH" || true)"
  [ "$code" = "200" ]
}

if [ "$TARGET_SHA" = "$DEPLOYED_SHA" ] && running && healthy "$PORT"; then
  log "up to date at ${TARGET_SHA:0:8}; healthy; nothing to do"; exit 0
fi
if [ "$TARGET_SHA" = "$(cat "$FAILED_FILE" 2>/dev/null || true)" ]; then
  log "tip ${TARGET_SHA:0:8} already failed build/health; waiting for a new commit on $BRANCH"; exit 0
fi

if [ "$CI_GATE" = "1" ]; then
  CHECKS="$(curl -s --max-time 15 -H 'Accept: application/vnd.github+json' \
    "https://api.github.com/repos/$API_REPO/commits/$TARGET_SHA/check-runs?per_page=50")" || CHECKS=""
  TOTAL="$(printf '%s' "$CHECKS" | jq -r '.total_count // 0' 2>/dev/null || echo 0)"
  FAILED="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name|test("CI|typecheck|lint|build";"i")) | select(.status=="completed" and .conclusion!="success")] | length' 2>/dev/null || echo 1)"
  PENDING="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name|test("CI|typecheck|lint|build";"i")) | select(.status!="completed")] | length' 2>/dev/null || echo 1)"
  CI_RUNS="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name|test("CI|typecheck|lint|build";"i"))] | length' 2>/dev/null || echo 0)"
  if [ "$TOTAL" = "0" ] || [ "$CI_RUNS" = "0" ]; then log "CI gate: no CI check-runs yet for ${TARGET_SHA:0:8} (total=$TOTAL); waiting"; exit 0; fi
  if [ "$FAILED" != "0" ]; then log "CI gate: $FAILED CI check-run(s) FAILED for ${TARGET_SHA:0:8}; refusing to deploy"; exit 0; fi
  if [ "$PENDING" != "0" ]; then log "CI gate: $PENDING CI check-run(s) still running for ${TARGET_SHA:0:8}; waiting"; exit 0; fi
  log "CI gate: all $CI_RUNS CI check-run(s) green for ${TARGET_SHA:0:8}"
fi

BUILD_DIR="$STATE_DIR/builds/$TARGET_SHA"
rm -rf "$BUILD_DIR"; mkdir -p "$BUILD_DIR"
log "fetching ${TARGET_SHA:0:8} from $BRANCH"
git -C "$BUILD_DIR" init -q
git -C "$BUILD_DIR" fetch -q --depth 1 "$REPO_URL" "$TARGET_SHA"
git -C "$BUILD_DIR" checkout -q --detach FETCH_HEAD
test -f "$BUILD_DIR/Dockerfile" || { log "no Dockerfile at ${TARGET_SHA:0:8}; abort"; exit 1; }
printf '%s\n' "$TARGET_SHA" > "$BUILD_DIR/public/DEPLOYED_SHA.txt" 2>/dev/null || true

log "building image $IMAGE:$TARGET_SHA"
docker build --pull -q --build-arg GIT_SHA="$TARGET_SHA" --label huoc.sha="$TARGET_SHA" --label huoc.built="$(date -Is)" -t "$IMAGE:$TARGET_SHA" "$BUILD_DIR" >>"$LOG" 2>&1 || { log "docker build FAILED; current release untouched"; printf '%s\n' "$TARGET_SHA" > "$FAILED_FILE"; exit 1; }

CANDIDATE="${CONTAINER}-candidate"
CAND_PORT=$((PORT + 10000))
docker rm -f "$CANDIDATE" >/dev/null 2>&1 || true
docker run -d --name "$CANDIDATE" -p "127.0.0.1:$CAND_PORT:80" "$IMAGE:$TARGET_SHA" >/dev/null
ok=0; for i in $(seq 1 15); do healthy "$CAND_PORT" && { ok=1; break; }; sleep 1; done
if [ "$ok" != "1" ]; then
  log "candidate FAILED health check; logs:"; docker logs --tail 20 "$CANDIDATE" >>"$LOG" 2>&1 || true
  docker rm -f "$CANDIDATE" >/dev/null 2>&1 || true; printf '%s\n' "$TARGET_SHA" > "$FAILED_FILE"; exit 1
fi
SERVED_SHA="$(curl -s --max-time 5 "http://127.0.0.1:$CAND_PORT/DEPLOYED_SHA.txt" | tr -d '[:space:]' || true)"
[ "$SERVED_SHA" = "$TARGET_SHA" ] || log "warning: candidate serves DEPLOYED_SHA '$SERVED_SHA' (expected $TARGET_SHA)"
docker rm -f "$CANDIDATE" >/dev/null 2>&1 || true

# swap: keep the old image as :previous, replace the container on the real port
if docker image inspect "$IMAGE:current" >/dev/null 2>&1; then docker tag "$IMAGE:current" "$IMAGE:previous"; fi
docker tag "$IMAGE:$TARGET_SHA" "$IMAGE:current"
log "swapping container $CONTAINER onto port $PORT"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" --restart unless-stopped -p "$PORT:80" \
  --label huoc.sha="$TARGET_SHA" --label huoc.deployed="$(date -Is)" "$IMAGE:current" >/dev/null
ok=0; for i in $(seq 1 15); do healthy "$PORT" && { ok=1; break; }; sleep 1; done
if [ "$ok" != "1" ]; then
  log "new container unhealthy on $PORT; ROLLING BACK to :previous"
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER" --restart unless-stopped -p "$PORT:80" "$IMAGE:previous" >/dev/null
  healthy "$PORT" && log "rollback healthy" || log "ROLLBACK ALSO UNHEALTHY - manual attention required"
  exit 1
fi
printf '%s\n' "$TARGET_SHA" > "$DEPLOYED_FILE"; rm -f "$FAILED_FILE"
log "DEPLOYED ${TARGET_SHA:0:8} on :$PORT (previous kept as $IMAGE:previous)"
# prune old build dirs
ls -1dt "$STATE_DIR"/builds/* 2>/dev/null | tail -n +$((KEEP_BUILDS+1)) | xargs -r rm -rf
