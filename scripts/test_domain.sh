#!/usr/bin/env bash
set -euo pipefail

EXPECTED_DOMAIN="aime.io"

if [[ ! -f CNAME ]]; then
  echo "CNAME file missing"
  exit 1
fi

ACTUAL_DOMAIN="$(tr -d '\r\n' < CNAME)"
if [[ "$ACTUAL_DOMAIN" != "$EXPECTED_DOMAIN" ]]; then
  echo "CNAME mismatch: expected '$EXPECTED_DOMAIN' got '$ACTUAL_DOMAIN'"
  exit 1
fi

echo "CNAME check passed: $ACTUAL_DOMAIN"

# BOLT OPTIMIZATION: Combined A and AAAA lookups into a single 'dig' call to reduce
# network round-trips and process forks. Results are parsed in pure Bash to avoid
# additional dependencies like 'grep' or 'awk'.
RECORDS="$(dig +short "$EXPECTED_DOMAIN" A "$EXPECTED_DOMAIN" AAAA || true)"

A_RECORDS=""
AAAA_RECORDS=""
while read -r line; do
    [[ -z "$line" ]] && continue
    if [[ "$line" =~ : ]]; then
        AAAA_RECORDS+="${line}"$'\n'
    else
        A_RECORDS+="${line}"$'\n'
    fi
done <<< "$RECORDS"

# Remove trailing newlines
A_RECORDS="${A_RECORDS%$'\n'}"
AAAA_RECORDS="${AAAA_RECORDS%$'\n'}"

if [[ -z "$A_RECORDS" && -z "$AAAA_RECORDS" ]]; then
  echo "No DNS A/AAAA records found for $EXPECTED_DOMAIN"
  exit 1
fi

echo "DNS check passed for $EXPECTED_DOMAIN"
echo "A records:"
echo "$A_RECORDS"
echo "AAAA records:"
echo "$AAAA_RECORDS"
