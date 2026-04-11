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

# Check gh version for -f flag support (requires v2.30.0 for secrets, v2.25.0 for vars)
GH_VERSION=$(gh --version | head -n1 | grep -oP 'gh version \K[0-9]+\.[0-9]+\.[0-9]+')
IFS='.' read -ra V_PARTS <<< "$GH_VERSION"
if (( V_PARTS[0] < 2 )) || { (( V_PARTS[0] == 2 )) && (( V_PARTS[1] < 30 )); }; then
  echo "Error: GitHub CLI version $GH_VERSION is too old. Please update to v2.30.0 or later."
  exit 1
fi

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files and the -f flag.
# This reduces process forks from 14 to 2, significantly improving performance.
# We use restricted permissions (600) for the temporary files.
TEMP_SECRETS=$(mktemp)
TEMP_VARS=$(mktemp)
chmod 600 "$TEMP_SECRETS" "$TEMP_VARS"
trap 'rm -f "$TEMP_SECRETS" "$TEMP_VARS"' EXIT

echo "Configuring revenue tooling for $REPO"

echo "Collecting provider secrets (if available in your shell environment)..."
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

SECRET_COUNT=0
for secret in "${SECRETS_LIST[@]}"; do
  if [[ -n "${!secret:-}" ]]; then
    # Use printf with %q for shell-safe quoting, though .env typically needs simpler format.
    # We'll use double quotes and escape common characters for .env format.
    escaped_val="${!secret//\"/\\\"}"
    echo "$secret=\"$escaped_val\"" >> "$TEMP_SECRETS"
    echo "✓ Prepared secret: $secret"
    SECRET_COUNT=$((SECRET_COUNT + 1))
  else
    echo "- Skipped secret: $secret (env var not provided)"
  fi
done

if [[ $SECRET_COUNT -gt 0 ]]; then
  gh secret set --repo "$REPO" -f "$TEMP_SECRETS"
  echo "✓ Successfully set $SECRET_COUNT secrets via batch upload"
fi

echo "Collecting non-sensitive configuration variables..."
VARS_LIST=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

VAR_COUNT=0
for var in "${VARS_LIST[@]}"; do
  if [[ -n "${!var:-}" ]]; then
    escaped_val="${!var//\"/\\\"}"
    echo "$var=\"$escaped_val\"" >> "$TEMP_VARS"
    echo "✓ Prepared variable: $var"
    VAR_COUNT=$((VAR_COUNT + 1))
  else
    echo "- Skipped variable: $var (env var not provided)"
  fi
done

if [[ $VAR_COUNT -gt 0 ]]; then
  gh variable set --repo "$REPO" -f "$TEMP_VARS"
  echo "✓ Successfully set $VAR_COUNT variables via batch upload"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
