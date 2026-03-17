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

A_RECORDS="$(dig +short A "$EXPECTED_DOMAIN" || true)"
AAAA_RECORDS="$(dig +short AAAA "$EXPECTED_DOMAIN" || true)"

if [[ -z "$A_RECORDS" && -z "$AAAA_RECORDS" ]]; then
  echo "No DNS A/AAAA records found for $EXPECTED_DOMAIN"
  exit 1
fi

echo "DNS check passed for $EXPECTED_DOMAIN"
echo "A records:"
echo "$A_RECORDS"
echo "AAAA records:"
echo "$AAAA_RECORDS"
