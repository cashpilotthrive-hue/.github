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

# BOLT OPTIMIZATION: Batch gh secret set and gh variable set calls using temporary .env files.
# This reduces process forks from 14+ down to 2, significantly improving performance.

echo "Configuring revenue tooling for $REPO"

# Prepare temporary files for batching
SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)
trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT

# List of secrets to check
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

# List of variables to check
VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

echo "Collecting provider secrets..."
for secret in "${SECRETS[@]}"; do
  if [[ -n "${!secret:-}" ]]; then
    # Print formatted key=value to ensure safe handling of potential special characters
    printf "%s=%s\n" "$secret" "${!secret}" >> "$SECRETS_FILE"
    echo "  + Identified secret: $secret"
  fi
done

echo "Collecting configuration variables..."
for var in "${VARS[@]}"; do
  if [[ -n "${!var:-}" ]]; then
    printf "%s=%s\n" "$var" "${!var}" >> "$VARS_FILE"
    echo "  + Identified variable: $var"
  fi
done

if [[ -s "$SECRETS_FILE" ]]; then
  echo "Setting secrets in batch..."
  gh secret set --repo "$REPO" -f "$SECRETS_FILE"
else
  echo "No secrets to set."
fi

if [[ -s "$VARS_FILE" ]]; then
  echo "Setting variables in batch..."
  gh variable set --repo "$REPO" -f "$VARS_FILE"
else
  echo "No variables to set."
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
