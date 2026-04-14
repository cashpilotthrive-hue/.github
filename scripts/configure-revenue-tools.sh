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

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files.
# This reduces process forks from up to 14 down to 2 by using the -f flag.
# Each 'gh secret set -f' or 'gh variable set -f' call handles all entries at once.

SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)
# Ensure temporary files are cleaned up and have restricted permissions
trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT
chmod 600 "$SECRETS_FILE" "$VARS_FILE"

collect_secret() {
  local secret_name="$1"
  local value="${!secret_name:-}"

  if [[ -n "$value" ]]; then
    # Escape double quotes for .env format
    local escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$secret_name" "$escaped_value" >> "$SECRETS_FILE"
    echo "+ Queued secret: $secret_name"
  else
    echo "- Skipped secret: $secret_name (env var not provided)"
  fi
}

collect_var() {
  local var_name="$1"
  local value="${!var_name:-}"

  if [[ -n "$value" ]]; then
    # Escape double quotes for .env format
    local escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$var_name" "$escaped_value" >> "$VARS_FILE"
    echo "+ Queued variable: $var_name"
  else
    echo "- Skipped variable: $var_name (env var not provided)"
  fi
}

echo "Configuring revenue tooling for $REPO"

echo "Collecting provider secrets..."
collect_secret STRIPE_API_KEY
collect_secret STRIPE_WEBHOOK_SECRET
collect_secret PADDLE_API_KEY
collect_secret GUMROAD_ACCESS_TOKEN
collect_secret SHOPIFY_ADMIN_API_TOKEN
collect_secret HUBSPOT_API_KEY
collect_secret POSTHOG_API_KEY
collect_secret SLACK_WEBHOOK_URL

if [[ -s "$SECRETS_FILE" ]]; then
  echo "Applying secrets in batch..."
  gh secret set --repo "$REPO" -f "$SECRETS_FILE"
  echo "✓ Secrets configured successfully"
fi

echo "Collecting configuration variables..."
collect_var BILLING_PROVIDER
collect_var BILLING_ENVIRONMENT
collect_var CRM_PROVIDER
collect_var ANALYTICS_PROVIDER
collect_var DEFAULT_CURRENCY
collect_var REVENUE_ALERT_THRESHOLD

if [[ -s "$VARS_FILE" ]]; then
  echo "Applying variables in batch..."
  gh variable set --repo "$REPO" -f "$VARS_FILE"
  echo "✓ Variables configured successfully"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
