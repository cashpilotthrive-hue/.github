#!/usr/bin/env bash

set -euo pipefail

REPO="${1:-}"

if [[ -z "$REPO" ]]; then
  echo "Usage: $0 <owner/repo>"
  echo "Example: $0 cashpilotthrive-hue/my-saas-repo"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is required. Install gh and authenticate first."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh is not authenticated. Run: gh auth login"
  exit 1
fi

echo "Configuring revenue tooling for $REPO"

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files and the -f flag.
# This reduces process forks from 14 to 2, significantly improving performance.
SEC_FILE=$(mktemp)
VAR_FILE=$(mktemp)
chmod 600 "$SEC_FILE" "$VAR_FILE"
trap 'rm -f "$SEC_FILE" "$VAR_FILE"' EXIT

# Secrets to check
SECRETS=(
  STRIPE_API_KEY
  STRIPE_WEBHOOK_SECRET
  PADDLE_API_KEY
  GUMROAD_ACCESS_TOKEN
  SHOPIFY_ADMIN_API_TOKEN
  HUBSPOT_API_KEY
  POSTHOG_API_KEY
  SLACK_WEBHOOK_URL
)

# Variables to check
VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

echo "Preparing provider secrets..."
for secret in "${SECRETS[@]}"; do
  value="${!secret:-}"
  if [[ -n "$value" ]]; then
    # Escape double quotes for dotenv format
    printf '%s="%s"\n' "$secret" "${value//\"/\\\"}" >> "$SEC_FILE"
    echo "✓ Added secret to batch: $secret"
  else
    echo "- Skipped secret: $secret (env var not provided)"
  fi
done

if [[ -s "$SEC_FILE" ]]; then
  gh secret set --repo "$REPO" -f "$SEC_FILE"
  echo "✓ Successfully batched secrets upload"
fi

echo "Preparing non-sensitive configuration variables..."
for var in "${VARS[@]}"; do
  value="${!var:-}"
  if [[ -n "$value" ]]; then
    # Escape double quotes for dotenv format
    printf '%s="%s"\n' "$var" "${value//\"/\\\"}" >> "$VAR_FILE"
    echo "✓ Added variable to batch: $var"
  else
    echo "- Skipped variable: $var (env var not provided)"
  fi
done

if [[ -s "$VAR_FILE" ]]; then
  gh variable set --repo "$REPO" -f "$VAR_FILE"
  echo "✓ Successfully batched variables upload"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
