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

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files and the -f flag.
# This reduces the number of process forks from up to 14 down to 2, significantly
# improving performance, especially on high-latency connections.

echo "Configuring revenue tooling for $REPO"

# Prepare temporary files for batch processing
SECRETS_BATCH=$(mktemp)
VARS_BATCH=$(mktemp)
chmod 600 "$SECRETS_BATCH" "$VARS_BATCH"

# Cleanup on exit
trap 'rm -f "$SECRETS_BATCH" "$VARS_BATCH"' EXIT

echo "Gathering provider secrets..."
SECRETS_TO_SET=(
  STRIPE_API_KEY STRIPE_WEBHOOK_SECRET PADDLE_API_KEY GUMROAD_ACCESS_TOKEN
  SHOPIFY_ADMIN_API_TOKEN HUBSPOT_API_KEY POSTHOG_API_KEY SLACK_WEBHOOK_URL
)

for secret in "${SECRETS_TO_SET[@]}"; do
  value="${!secret:-}"
  if [[ -n "$value" ]]; then
    # Use printf to handle potential special characters in values safely
    printf '%s="%s"\n' "$secret" "$value" >> "$SECRETS_BATCH"
    echo "✓ Collected secret: $secret"
  else
    echo "- Skipped secret: $secret (env var not provided)"
  fi
done

echo "Gathering configuration variables..."
VARS_TO_SET=(
  BILLING_PROVIDER BILLING_ENVIRONMENT CRM_PROVIDER
  ANALYTICS_PROVIDER DEFAULT_CURRENCY REVENUE_ALERT_THRESHOLD
)

for var in "${VARS_TO_SET[@]}"; do
  value="${!var:-}"
  if [[ -n "$value" ]]; then
    printf '%s="%s"\n' "$var" "$value" >> "$VARS_BATCH"
    echo "✓ Collected variable: $var"
  else
    echo "- Skipped variable: $var (env var not provided)"
  fi
done

echo "Applying batch updates via GitHub CLI..."

if [[ -s "$SECRETS_BATCH" ]]; then
  gh secret set --repo "$REPO" -f "$SECRETS_BATCH"
  echo "✓ Successfully batched secrets"
fi

if [[ -s "$VARS_BATCH" ]]; then
  gh variable set --repo "$REPO" -f "$VARS_BATCH"
  echo "✓ Successfully batched variables"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
