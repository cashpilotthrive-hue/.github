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

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files and the --env-file flag.
# This reduces process forks from 14 to 2, significantly improving performance.

# Create temporary files for batching
SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)

# Ensure temporary files are cleaned up on exit
trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT

# Set permissions for the secrets file
chmod 600 "$SECRETS_FILE"

# Define the lists of secrets and variables
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

VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

echo "Preparing provider secrets..."
SECRETS_COUNT=0
for secret_name in "${SECRETS[@]}"; do
  value="${!secret_name:-}"
  if [[ -n "$value" ]]; then
    # Escape double quotes in the value for .env format
    escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$secret_name" "$escaped_value" >> "$SECRETS_FILE"
    echo "  + Added secret to batch: $secret_name"
    SECRETS_COUNT=$((SECRETS_COUNT + 1))
  else
    echo "  - Skipped secret: $secret_name (env var not provided)"
  fi
done

if [[ $SECRETS_COUNT -gt 0 ]]; then
  echo "Pushing $SECRETS_COUNT secrets in a single batch..."
  gh secret set --repo "$REPO" --env-file "$SECRETS_FILE"
  echo "✓ Secrets configured."
fi

echo "Preparing configuration variables..."
VARS_COUNT=0
for var_name in "${VARS[@]}"; do
  value="${!var_name:-}"
  if [[ -n "$value" ]]; then
    # Escape double quotes in the value for .env format
    escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$var_name" "$escaped_value" >> "$VARS_FILE"
    echo "  + Added variable to batch: $var_name"
    VARS_COUNT=$((VARS_COUNT + 1))
  else
    echo "  - Skipped variable: $var_name (env var not provided)"
  fi
done

if [[ $VARS_COUNT -gt 0 ]]; then
  echo "Pushing $VARS_COUNT variables in a single batch..."
  gh variable set --repo "$REPO" --env-file "$VARS_FILE"
  echo "✓ Variables configured."
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
