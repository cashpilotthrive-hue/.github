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

# BOLT OPTIMIZATION: Batch GitHub CLI calls using temporary .env files and the -f flag.
# This reduces process forks from 14 to 2, significantly improving performance.
# We use mktemp to create secure temporary files and trap for automatic cleanup.
SECRET_FILE=$(mktemp)
VAR_FILE=$(mktemp)
trap 'rm -f "$SECRET_FILE" "$VAR_FILE"' EXIT
chmod 600 "$SECRET_FILE" "$VAR_FILE"

append_to_env_if_present() {
  local target_file="$1"
  local var_name="$2"
  local value="${!var_name:-}"

  if [[ -n "$value" ]]; then
    # Escape internal double quotes for robust .env parsing
    local escaped_value="${value//\"/\\\"}"
    printf '%s="%s"\n' "$var_name" "$escaped_value" >> "$target_file"
    return 0
  fi
  return 1
}

echo "Configuring revenue tooling for $REPO"

echo "Collecting provider secrets (if available in your shell environment)..."
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

SECRET_COUNT=0
for s in "${SECRETS[@]}"; do
  if append_to_env_if_present "$SECRET_FILE" "$s"; then
    echo "✓ Queued secret: $s"
    SECRET_COUNT=$((SECRET_COUNT + 1))
  else
    echo "- Skipped secret: $s (env var not provided)"
  fi
done

echo "Collecting non-sensitive configuration variables..."
VARS=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

VAR_COUNT=0
for v in "${VARS[@]}"; do
  if append_to_env_if_present "$VAR_FILE" "$v"; then
    echo "✓ Queued variable: $v"
    VAR_COUNT=$((VAR_COUNT + 1))
  else
    echo "- Skipped variable: $v (env var not provided)"
  fi
done

if [[ $SECRET_COUNT -gt 0 ]]; then
  echo "Applying $SECRET_COUNT secrets in batch..."
  gh secret set --repo "$REPO" -f "$SECRET_FILE"
fi

if [[ $VAR_COUNT -gt 0 ]]; then
  echo "Applying $VAR_COUNT variables in batch..."
  gh variable set --repo "$REPO" -f "$VAR_FILE"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
