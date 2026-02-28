#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${ROOT_DIR}/config/policy.env"

# Preserve caller-provided environment values so policy defaults do not overwrite them.
for __var in AUTHORIZATION_FILE TARGET_ALLOWLIST LOOP_INTERVAL_SECONDS MAX_RUNTIME_SECONDS ENABLE_INTRUSIVE_TESTS RATE_LIMIT_MILLISECONDS; do
  if [[ -n "${!__var+x}" ]]; then
    export "__PRESERVE_${__var}=${!__var}"
  fi
done

if [[ -f "${CONFIG_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${CONFIG_FILE}"
fi

for __var in AUTHORIZATION_FILE TARGET_ALLOWLIST LOOP_INTERVAL_SECONDS MAX_RUNTIME_SECONDS ENABLE_INTRUSIVE_TESTS RATE_LIMIT_MILLISECONDS; do
  __preserve_key="__PRESERVE_${__var}"
  if [[ -n "${!__preserve_key+x}" ]]; then
    export "${__var}=${!__preserve_key}"
    unset "${__preserve_key}"
  fi
done

AUTHORIZATION_FILE="${AUTHORIZATION_FILE:-${ROOT_DIR}/config/authorization.sig}"
TARGET_ALLOWLIST="${TARGET_ALLOWLIST:-${ROOT_DIR}/config/targets.txt}"
RATE_LIMIT_MILLISECONDS="${RATE_LIMIT_MILLISECONDS:-250}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="run-${TIMESTAMP}"
RUN_LOG_DIR="${ROOT_DIR}/logs/${RUN_ID}"
RAW_DIR="${ROOT_DIR}/output/raw/${RUN_ID}"
NORM_DIR="${ROOT_DIR}/output/normalized/${RUN_ID}"
REPORT_DIR="${ROOT_DIR}/output/reports/${RUN_ID}"

mkdir -p "${RUN_LOG_DIR}" "${RAW_DIR}" "${NORM_DIR}" "${REPORT_DIR}"

log() {
  local level="$1"
  shift
  printf '%s [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${level}" "$*" | tee -a "${RUN_LOG_DIR}/run.log"
}

rate_limit_sleep() {
  python3 - <<PY
import time
ms = int(${RATE_LIMIT_MILLISECONDS})
time.sleep(max(ms, 0) / 1000)
PY
}

assert_file_exists() {
  local file="$1"
  local label="$2"
  if [[ ! -f "${file}" ]]; then
    log ERROR "Missing ${label}: ${file}"
    exit 1
  fi
}
