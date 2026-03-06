# Revenue Tooling Setup (GitHub-Driven)

This repository includes a production-ready setup pattern to automate revenue tooling checks, reconciliation, and alerting through GitHub Actions.

## What's included

- `scripts/configure-revenue-tools.sh`: One-command bootstrap to configure repo secrets and variables via GitHub CLI.
- `.github/workflows/revenue-ops.yml`: Scheduled + on-demand workflow for:
  - Provider health checks (Stripe, Paddle, Gumroad, Shopify, HubSpot, PostHog)
  - Revenue data fetching and reconciliation
  - Threshold-based alerting via Slack
  - Automated audit trail artifacts
- `.env.example`: Template for configuring all supported providers

## Features

### Provider Health Checks
- **Stripe**: Balance and API connectivity
- **Paddle**: Transaction API validation
- **Gumroad**: User API authentication
- **Shopify**: Shop API connectivity
- **HubSpot**: CRM contacts API
- **PostHog**: Analytics project API

### Settlement Reconciliation
- Automatic data fetching from Stripe and Paddle
- Daily reconciliation reports
- 90-day artifact retention
- Balance threshold monitoring

### Alerting System
- Slack notifications for failed health checks
- Balance threshold breach alerts
- Detailed workflow run links

## Quick Start

### 1) Authenticate GitHub CLI

```bash
gh auth login
```

### 2) Configure your environment

Use the provided template:

```bash
cp .env.example .env
# Edit .env with your actual credentials (only for providers you use)
source .env
```

Or export variables manually:

```bash
# Sensitive secrets
export STRIPE_API_KEY="sk_live_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
export PADDLE_API_KEY="pdl_live_..."
export GUMROAD_ACCESS_TOKEN="..."
export SHOPIFY_ADMIN_API_TOKEN="shpat_..."
export HUBSPOT_API_KEY="pat-na1-..."
export POSTHOG_API_KEY="phx_..."
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Non-sensitive variables
export BILLING_PROVIDER="stripe"
export BILLING_ENVIRONMENT="production"
export CRM_PROVIDER="hubspot"
export ANALYTICS_PROVIDER="posthog"
export DEFAULT_CURRENCY="USD"
export REVENUE_ALERT_THRESHOLD="1000"
export SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
export POSTHOG_HOST="https://app.posthog.com"
```

### 3) Apply configuration to your target repository

```bash
./scripts/configure-revenue-tools.sh <owner/repo>
```

Example:

```bash
./scripts/configure-revenue-tools.sh cashpilotthrive-hue/my-saas-repo
```

### 4) Run automation

In GitHub, go to **Actions → Revenue Ops Automation → Run workflow** and choose `production` or `staging`.

## Configuration Variables

### Required Variables
- `BILLING_PROVIDER`: Primary billing provider (stripe, paddle, gumroad, shopify)
- `CRM_PROVIDER`: CRM provider (hubspot, none)
- `ANALYTICS_PROVIDER`: Analytics provider (posthog, none)
- `DEFAULT_CURRENCY`: ISO 4217 currency code (USD, EUR, GBP, etc.)

### Optional Variables
- `BILLING_ENVIRONMENT`: Environment name (production, staging)
- `REVENUE_ALERT_THRESHOLD`: Minimum balance for alerts (in dollars)
- `SHOPIFY_STORE_DOMAIN`: Required if using Shopify (e.g., store.myshopify.com)
- `POSTHOG_HOST`: Required if using PostHog (default: https://app.posthog.com)

### Optional Secrets
Configure only the providers you use:
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PADDLE_API_KEY`
- `GUMROAD_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_TOKEN`
- `HUBSPOT_API_KEY`
- `POSTHOG_API_KEY`
- `SLACK_WEBHOOK_URL`

## Workflow Schedule

- **Automatic**: Runs every hour at :15 (configurable in revenue-ops.yml)
- **Manual**: Trigger anytime from GitHub Actions UI

## Professional methodology

- **Least privilege by default**: Workflow uses read-only repository permissions.
- **Idempotent config**: Setup script only applies values present in your shell.
- **Controlled execution**: Hourly schedule + manual dispatch for operational flexibility.
- **Environment separation**: Workflow uses environment-scoped execution.
- **Progressive integration**: Provider checks are optional and activate only if secrets are configured.
- **Audit trail**: 90-day retention of reconciliation reports as workflow artifacts.
- **Real-time alerting**: Slack notifications for failures and threshold breaches.

## Reconciliation Reports

Each run generates a detailed reconciliation report including:
- Timestamp and environment
- Provider configuration
- Stripe balance and 24-hour charges
- Paddle transactions
- Threshold status

Reports are stored as workflow artifacts for 90 days.

## Advanced Usage

### Viewing Reconciliation History

```bash
# List recent workflow runs
gh run list --workflow=revenue-ops.yml --limit 10

# Download a specific report
gh run download <run-id> -n revenue-reconciliation-production-<run-number>
```

### Custom Reconciliation Logic

To add custom reconciliation steps:
1. Fork this repository
2. Edit `.github/workflows/revenue-ops.yml`
3. Add your logic in the `settlement-reconciliation` job
4. Use environment variables for provider-specific data fetching

### Testing Configuration

Test your configuration without waiting for the schedule:

```bash
gh workflow run revenue-ops.yml -f environment=staging -f run_settlement_reconciliation=true
```

## Troubleshooting

### Health checks failing
- Verify API keys are correct and not expired
- Check that API keys have required permissions
- For Shopify: Ensure `SHOPIFY_STORE_DOMAIN` variable is set
- For PostHog: Ensure `POSTHOG_HOST` variable is set

### No Slack alerts
- Verify `SLACK_WEBHOOK_URL` secret is configured
- Test webhook URL manually: `curl -X POST <url> -H 'Content-Type: application/json' -d '{"text":"test"}'`

### Missing reconciliation data
- Ensure provider API keys are configured
- Check workflow logs for API errors
- Verify provider accounts have transaction data

## Security Considerations

- Never commit `.env` files or expose API keys
- Use separate API keys for staging and production
- Regularly rotate API credentials
- Review workflow artifact retention policy
- Limit API key permissions to minimum required
- Use GitHub environments for additional protection

## Next Steps

- Review and customize the reconciliation logic for your specific needs
- Set up GitHub environments for production/staging separation
- Configure Slack webhook for your team channel
- Adjust the workflow schedule based on your monitoring requirements
- Add custom provider integrations as needed
