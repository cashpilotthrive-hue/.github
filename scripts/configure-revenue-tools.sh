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

# BOLT OPTIMIZATION: Batch gh calls to avoid multiple process forks and reduce network latency.
# This reduces the number of gh calls from up to 14 down to 2.

echo "Setting provider secrets..."
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

SECRETS_FILE=$(mktemp)
for s in "${SECRETS[@]}"; do
  if [[ -n "${!s:-}" ]]; then
    echo "$s=${!s}" >> "$SECRETS_FILE"
    echo "✓ Queued secret: $s"
  else
    echo "- Skipped secret: $s (env var not provided)"
  fi
done

if [[ -s "$SECRETS_FILE" ]]; then
  # Note: gh secret set -f <file> supports batch setting from an env-style file
  gh secret set -f "$SECRETS_FILE" --repo "$REPO"
  echo "✓ Applied secrets via batch update"
fi
rm -f "$SECRETS_FILE"

echo "Setting configuration variables..."
VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

VARS_FILE=$(mktemp)
for v in "${VARS[@]}"; do
  if [[ -n "${!v:-}" ]]; then
    echo "$v=${!v}" >> "$VARS_FILE"
    echo "✓ Queued variable: $v"
  else
    echo "- Skipped variable: $v (env var not provided)"
  fi
done

if [[ -s "$VARS_FILE" ]]; then
  # Note: gh variable set -f <file> supports batch setting from an env-style file
  gh variable set -f "$VARS_FILE" --repo "$REPO"
  echo "✓ Applied variables via batch update"
fi
rm -f "$VARS_FILE"

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
