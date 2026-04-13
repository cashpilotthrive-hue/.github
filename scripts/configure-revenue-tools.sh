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
# This reduces process forks from 14 to 2, significantly improving performance.
S_FILE=$(mktemp)
V_FILE=$(mktemp)
trap 'rm -f "$S_FILE" "$V_FILE"' EXIT
chmod 600 "$S_FILE" "$V_FILE"

# Define the lists of secrets and variables to check
S_LIST=(
  STRIPE_API_KEY
  STRIPE_WEBHOOK_SECRET
  PADDLE_API_KEY
  GUMROAD_ACCESS_TOKEN
  SHOPIFY_ADMIN_API_TOKEN
  HUBSPOT_API_KEY
  POSTHOG_API_KEY
  SLACK_WEBHOOK_URL
)

V_LIST=(
  BILLING_PROVIDER
  BILLING_ENVIRONMENT
  CRM_PROVIDER
  ANALYTICS_PROVIDER
  DEFAULT_CURRENCY
  REVENUE_ALERT_THRESHOLD
)

echo "Configuring revenue tooling for $REPO"

echo "Collecting provider secrets (if available in your shell environment)..."
S_COUNT=0
for s_name in "${S_LIST[@]}"; do
  s_val="${!s_name:-}"
  if [[ -n "$s_val" ]]; then
    # Escape double quotes for .env format
    printf '%s="%s"\n' "$s_name" "${s_val//\"/\\\"}" >> "$S_FILE"
    echo "  + Added $s_name to batch"
    ((S_COUNT++))
  fi
done

echo "Collecting non-sensitive configuration variables..."
V_COUNT=0
for v_name in "${V_LIST[@]}"; do
  v_val="${!v_name:-}"
  if [[ -n "$v_val" ]]; then
    # Escape double quotes for .env format
    printf '%s="%s"\n' "$v_name" "${v_val//\"/\\\"}" >> "$V_FILE"
    echo "  + Added $v_name to batch"
    ((V_COUNT++))
  fi
done

if [[ $S_COUNT -gt 0 ]]; then
  echo "Applying $S_COUNT secrets in one batch..."
  gh secret set --repo "$REPO" -f "$S_FILE"
  echo "✓ Secrets updated"
else
  echo "- No secrets to set"
fi

if [[ $V_COUNT -gt 0 ]]; then
  echo "Applying $V_COUNT variables in one batch..."
  gh variable set --repo "$REPO" -f "$V_FILE"
  echo "✓ Variables updated"
else
  echo "- No variables to set"
fi

echo "Done."
echo "Next: run the workflow '.github/workflows/revenue-ops.yml' from the Actions tab."
