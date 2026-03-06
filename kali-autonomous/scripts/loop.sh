#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

LOOP_INTERVAL_SECONDS="${LOOP_INTERVAL_SECONDS:-900}"
MAX_RUNTIME_SECONDS="${MAX_RUNTIME_SECONDS:-0}"
START_TS="$(date +%s)"

log INFO "Autonomous loop started (interval=${LOOP_INTERVAL_SECONDS}s max_runtime=${MAX_RUNTIME_SECONDS}s)"

while true; do
  RUN_START="$(date +%s)"
  if "${SCRIPT_DIR}/run_once.sh"; then
    log INFO "Workflow cycle completed successfully"
  else
    log ERROR "Workflow cycle failed"
  fi

  if [[ "${MAX_RUNTIME_SECONDS}" -gt 0 ]]; then
    NOW="$(date +%s)"
    ELAPSED="$((NOW - START_TS))"
    if [[ "${ELAPSED}" -ge "${MAX_RUNTIME_SECONDS}" ]]; then
      log INFO "Max runtime reached, exiting loop"
      break
    fi
  fi

  CYCLE_SECONDS="$(( $(date +%s) - RUN_START ))"
  SLEEP_FOR="$(( LOOP_INTERVAL_SECONDS - CYCLE_SECONDS ))"
  if [[ "${SLEEP_FOR}" -gt 0 ]]; then
    sleep "${SLEEP_FOR}"
  fi
done
