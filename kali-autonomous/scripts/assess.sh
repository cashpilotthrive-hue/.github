#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

ENABLE_INTRUSIVE_TESTS="${ENABLE_INTRUSIVE_TESTS:-false}"
log INFO "Assessment phase started (intrusive=${ENABLE_INTRUSIVE_TESTS})"

while IFS= read -r target; do
  [[ -z "${target}" ]] && continue
  printf '{"target":"%s","phase":"assessment","intrusive":%s,"status":"queued"}\n' \
    "${target}" "${ENABLE_INTRUSIVE_TESTS}" >> "${NORM_DIR}/assessment.jsonl"
  rate_limit_sleep
done < <(awk 'NF && $1 !~ /^#/' "${TARGET_ALLOWLIST}")

log INFO "Assessment phase complete"
