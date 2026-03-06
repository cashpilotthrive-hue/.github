#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

"${SCRIPT_DIR}/preflight.sh"
"${SCRIPT_DIR}/discover.sh"
"${SCRIPT_DIR}/assess.sh"
"${SCRIPT_DIR}/correlate.py"
"${SCRIPT_DIR}/report.py"
