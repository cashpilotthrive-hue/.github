#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

log INFO "Starting pre-flight checks"
assert_file_exists "${AUTHORIZATION_FILE}" "authorization file"
assert_file_exists "${TARGET_ALLOWLIST}" "target allowlist"

if ! grep -Ev '^\s*(#|$)' "${TARGET_ALLOWLIST}" >/dev/null; then
  log ERROR "Allowlist has no active targets"
  exit 1
fi

log INFO "Pre-flight checks passed"
