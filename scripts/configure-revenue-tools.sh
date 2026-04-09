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

# BOLT OPTIMIZATION: Batch gh secret set and gh variable set calls using the -f flag.
# This reduces the number of process forks and network requests significantly.

# Create temporary files for batching
SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)
trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT

# Provider secrets
SECRETS_LIST=(
  STRIPE_API_KEY
  STRIPE_WEBHOOK_SECRET
  PADDLE_API_KEY
  GUMROAD_ACCESS_TOKEN
  SHOPIFY_ADMIN_API_TOKEN
  HUBSPOT_API_KEY
  POSTHOG_API_KEY
  SLACK_WEBHOOK_URL
)

echo "Preparing provider secrets..."
for secret in "${SECRETS_LIST[@]}"; do
  if [[ -n "${!secret:-}" ]]; then
    echo "$secret=${!secret}" >> "$SECRETS_FILE"
    echo "  + Queued secret: $secret"
  else
    echo "  - Skipped secret: $secret (env var not provided)"
  fi
done

# Non-sensitive configuration variables
VARS_LIST=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

echo "Preparing configuration variables..."
for var in "${VARS_LIST[@]}"; do
  if [[ -n "${!var:-}" ]]; then
    echo "$var=${!var}" >> "$VARS_FILE"
    echo "  + Queued variable: $var"
  else
    echo "  - Skipped variable: $var (env var not provided)"
  fi
done

# Apply secrets in batch
if [[ -s "$SECRETS_FILE" ]]; then
  echo "Applying secrets in batch..."
  gh secret set --repo "$REPO" -f "$SECRETS_FILE"
  echo "✓ Secrets updated"
fi

# Apply variables in batch
if [[ -s "$VARS_FILE" ]]; then
  echo "Applying variables in batch..."
  gh variable set --repo "$REPO" -f "$VARS_FILE"
  echo "✓ Variables updated"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
