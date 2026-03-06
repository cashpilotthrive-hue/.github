# Twingate Connector Setup (Cashir Network)

This guide completes the network access portion of your Linux environment setup by walking through connector token generation and connector deployment.

> Scope: This document covers creating a **new Linux connector** for the `cashir` Twingate tenant and validating connectivity.

## Before You Start

- You have admin access to `https://cashir.twingate.com/admin`
- You have a Linux host ready for connector deployment
- The Linux host can reach `binaries.twingate.com`
- You will run the install command immediately after generating tokens

## Generate Connector Tokens

1. Sign in to the Twingate Admin Console:
   - `https://cashir.twingate.com/admin`
2. In the left sidebar, open **Network → Remote Networks**.
3. Select an existing remote network, or create one with **Add**.
4. Scroll to connectors and click **Deploy Connector** (or **Add Connector**).
5. Choose deployment type: **Linux**.
6. In deployment **Step 2**, click **Generate Tokens**.
7. Complete re-authentication when prompted.
8. Copy the generated command shown in the console. It will include:
   - `TWINGATE_ACCESS_TOKEN`
   - `TWINGATE_REFRESH_TOKEN`
   - Additional env vars like `TWINGATE_NETWORK` and label metadata

## Install Connector on Linux

Run the pre-filled command from the admin console on your Linux server.

Example format:

```bash
curl "https://binaries.twingate.com/connector/setup.sh" | \
sudo TWINGATE_ACCESS_TOKEN="<generated-access-token>" \
     TWINGATE_REFRESH_TOKEN="<generated-refresh-token>" \
     TWINGATE_LOG_ANALYTICS="v2" \
     TWINGATE_NETWORK="cashir" \
     TWINGATE_LABEL_DEPLOYED_BY="linux" \
     bash
```

## Verify Connector Health

After installation:

1. Return to **Network → Remote Networks → your remote network**.
2. Confirm the new connector appears and status is **Connected** (green).
3. Optionally deploy a second connector for redundancy.

## Token Security & Lifecycle Rules

- **One-time use:** Tokens are tied to a specific connector lifecycle.
- **Time-sensitive:** Generate and execute promptly.
- **Do not share:** Treat as secrets (never commit to code, docs, or logs).
- **Not retrievable:** If lost, create a new connector and generate new tokens.
- **Broken/expired flow:** Remove the bad connector and redeploy with fresh tokens.

## If Tokens Expire or Deployment Fails

1. Return to `https://cashir.twingate.com/admin`
2. Open **Network → Remote Networks → your network**
3. Delete the failed/unused connector
4. Add a new connector
5. Generate fresh tokens
6. Re-run the install command immediately

## Full-Stack Completion Checklist

Use this checklist to confirm end-to-end readiness:

- [ ] Linux base setup completed (`./setup.sh`)
- [ ] Remote network exists in Twingate
- [ ] New Linux connector created
- [ ] Fresh tokens generated and consumed immediately
- [ ] Connector shows **Connected**
- [ ] Access policies are attached to required resources
- [ ] Client access from a user device verified

## Operational Next Steps

- Add a second connector in another zone/host for HA.
- Monitor connector uptime and latency in the Twingate console.
- Rotate/redeploy connectors during host replacement rather than reusing old tokens.
