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

# BOLT OPTIMIZATION: Batch gh secret set and gh variable set calls using the -f flag.
# This reduces process forks from 14 to 2, significantly improving execution time.
SECRETS_FILE=$(mktemp)
VARS_FILE=$(mktemp)

trap 'rm -f "$SECRETS_FILE" "$VARS_FILE"' EXIT

add_to_env_file() {
  local file="$1"
  local name="$2"
  local value="${!name:-}"

  if [[ -n "$value" ]]; then
    echo "$name=$value" >> "$file"
    return 0
  fi
  return 1
}

echo "Configuring revenue tooling for $REPO"

echo "Collecting provider secrets..."
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

for s in "${SECRETS[@]}"; do
  if add_to_env_file "$SECRETS_FILE" "$s"; then
    echo "✓ Prepared secret: $s"
  else
    echo "- Skipped secret: $s (env var not provided)"
  fi
done

if [[ -s "$SECRETS_FILE" ]]; then
  echo "Batch setting secrets via gh CLI..."
  gh secret set -f "$SECRETS_FILE" --repo "$REPO"
fi

echo "Collecting non-sensitive configuration variables..."
# List of variables to check
VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

for v in "${VARS[@]}"; do
  if add_to_env_file "$VARS_FILE" "$v"; then
    echo "✓ Prepared variable: $v"
  else
    echo "- Skipped variable: $v (env var not provided)"
  fi
done

if [[ -s "$VARS_FILE" ]]; then
  echo "Batch setting variables via gh CLI..."
  gh variable set -f "$VARS_FILE" --repo "$REPO"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
