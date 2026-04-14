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

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files and the --env-file flag.
# This reduces process forks from 14+ to 2, significantly improving execution time.
# Requires gh v2.30.0 or later.

echo "Configuring revenue tooling for $REPO"

# Prepare temporary files for batching
SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)
# Ensure cleanup on exit
trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT
chmod 600 "$SECRETS_FILE" "$VARS_FILE"

# Helper to escape values for .env format
escape_value() {
  local value="$1"
  # Escape double quotes for use in .env file
  echo "${value//\"/\\\"}"
}

echo "Collecting provider secrets..."
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

for secret in "${SECRETS_LIST[@]}"; do
  value="${!secret:-}"
  if [[ -n "$value" ]]; then
    printf '%s="%s"\n' "$secret" "$(escape_value "$value")" >> "$SECRETS_FILE"
    echo "- Queued secret: $secret"
  fi
done

echo "Collecting configuration variables..."
VARS_LIST=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

for var in "${VARS_LIST[@]}"; do
  value="${!var:-}"
  if [[ -n "$value" ]]; then
    printf '%s="%s"\n' "$var" "$(escape_value "$value")" >> "$VARS_FILE"
    echo "- Queued variable: $var"
  fi
done

if [[ -s "$SECRETS_FILE" ]]; then
  echo "Applying secrets batch..."
  gh secret set --repo "$REPO" --env-file "$SECRETS_FILE"
  echo "✓ Secrets applied successfully"
else
  echo "No secrets to apply"
fi

if [[ -s "$VARS_FILE" ]]; then
  echo "Applying variables batch..."
  gh variable set --repo "$REPO" --env-file "$VARS_FILE"
  echo "✓ Variables applied successfully"
else
  echo "No variables to apply"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
