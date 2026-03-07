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

set_secret_if_present() {
  local secret_name="$1"
  local value="${!secret_name:-}"

  if [[ -n "$value" ]]; then
    printf '%s' "$value" | gh secret set "$secret_name" --repo "$REPO"
    echo "✓ Set secret: $secret_name"
  else
    echo "- Skipped secret: $secret_name (env var not provided)"
  fi
}

set_var_if_present() {
  local var_name="$1"
  local value="${!var_name:-}"

  if [[ -n "$value" ]]; then
    gh variable set "$var_name" --body "$value" --repo "$REPO"
    echo "✓ Set variable: $var_name"
  else
    echo "- Skipped variable: $var_name (env var not provided)"
  fi
}

echo "Configuring revenue tooling for $REPO"

echo "Setting provider secrets (if available in your shell environment)..."
set_secret_if_present STRIPE_API_KEY
set_secret_if_present STRIPE_WEBHOOK_SECRET
set_secret_if_present PADDLE_API_KEY
set_secret_if_present GUMROAD_ACCESS_TOKEN
set_secret_if_present SHOPIFY_ADMIN_API_TOKEN
set_secret_if_present HUBSPOT_API_KEY
set_secret_if_present POSTHOG_API_KEY
set_secret_if_present SLACK_WEBHOOK_URL

echo "Setting non-sensitive configuration variables..."
set_var_if_present BILLING_PROVIDER
set_var_if_present BILLING_ENVIRONMENT
set_var_if_present CRM_PROVIDER
set_var_if_present ANALYTICS_PROVIDER
set_var_if_present DEFAULT_CURRENCY
set_var_if_present REVENUE_ALERT_THRESHOLD
set_var_if_present SHOPIFY_STORE_DOMAIN
set_var_if_present POSTHOG_HOST

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
