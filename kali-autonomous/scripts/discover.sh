#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log INFO "Discovery phase started"
awk 'NF && $1 !~ /^#/' "${TARGET_ALLOWLIST}" > "${RAW_DIR}/targets.active.txt"

while IFS= read -r target; do
  [[ -z "${target}" ]] && continue
  log INFO "Discovering reachable services for target=${target}"
  # Placeholder command for safe scaffolding. Replace with approved discovery tooling.
  printf '{"target":"%s","phase":"discovery","status":"queued"}\n' "${target}" >> "${NORM_DIR}/discovery.jsonl"
  rate_limit_sleep
done < "${RAW_DIR}/targets.active.txt"

log INFO "Discovery phase complete"
