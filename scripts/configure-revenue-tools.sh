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

# BOLT OPTIMIZATION: Batch gh calls using temporary files to reduce process forks.
# This reduces the number of gh calls from 14 to 2 (one for secrets, one for variables),
# which significantly improves execution time when multiple values are being set.
SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)
# Use trap to ensure temporary files are cleaned up even if the script fails.
trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT

# Set restricted permissions for the secrets file.
chmod 600 "$SECRETS_FILE"

echo "Configuring revenue tooling for $REPO"

echo "Setting provider secrets (if available in your shell environment)..."
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

for secret in "${SECRETS[@]}"; do
  value="${!secret:-}"
  if [[ -n "$value" ]]; then
    # Escape double quotes in the value to safely wrap it in quotes in the .env file.
    escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$secret" "$escaped_value" >> "$SECRETS_FILE"
    echo "✓ Prepared secret: $secret"
  else
    echo "- Skipped secret: $secret (env var not provided)"
  fi
done

if [[ -s "$SECRETS_FILE" ]]; then
  gh secret set -f "$SECRETS_FILE" --repo "$REPO"
  echo "✓ Applied all secrets in batch"
fi

echo "Setting non-sensitive configuration variables..."
VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

for var in "${VARS[@]}"; do
  value="${!var:-}"
  if [[ -n "$value" ]]; then
    # Escape double quotes in the value to safely wrap it in quotes in the .env file.
    escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$var" "$escaped_value" >> "$VARS_FILE"
    echo "✓ Prepared variable: $var"
  else
    echo "- Skipped variable: $var (env var not provided)"
  fi
done

if [[ -s "$VARS_FILE" ]]; then
  gh variable set -f "$VARS_FILE" --repo "$REPO"
  echo "✓ Applied all variables in batch"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
