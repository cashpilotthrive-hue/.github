# packages/realtime — Real-Time Data Pipeline

Architecture and integration specifications for the Principal App real-time data layer.

## Overview

This package documents the real-time data pipeline covering:

| Stream | Topic | Transport |
|--------|-------|-----------|
| Portfolio valuation | `wealth-updates` | WebSocket / SSE |
| Execution activity | `activity-updates` | WebSocket / polling |
| Credit events | `credit-updates` | WebSocket |

## Data Sources

### Market Data
- Subscribe to provider WebSocket (e.g. Polygon.io, Tradier).
- Normalise to `{ symbol, last_price, timestamp, bid, ask, volume }`.
- On each tick: update price cache → recompute position values → emit `wealth-updates`.

### Bank Credit Events (`/webhooks/bank`)
```json
{
  "event": "CREDIT",
  "account_id": "ext_swiss_private_bank",
  "amount": 50000000,
  "currency": "USD",
  "reference": "BANK-REF-123",
  "timestamp": "2026-03-02T10:10:00Z"
}
```
Pipeline: validate HMAC → write ledger entry → create `CreditEvent` → emit via WebSocket.

### Crypto / On-Chain
- Watch wallet addresses via Alchemy/Infura or custodian webhooks.
- Confirmed inbound transfer → `CreditEvent` with `source_type: CRYPTO`.

### CreditEvent schema
```json
{
  "id": "cred_<epoch_ms>",
  "owner_id": "Principal",
  "amount": 50000000,
  "currency": "USD",
  "source_type": "BANK | CRYPTO | PLATFORM",
  "source_ref": "<provider-reference>",
  "description": "Human-readable description",
  "timestamp": "ISO-8601"
}
```

## WealthSummary schema
```json
{
  "totalWealth": 1275000000000,
  "dailyPnl": 4600000000,
  "liquidity": 65000000000,
  "flowRatePerSecond": 12000
}
```
Recomputed on every market tick and every executed command.

## GitHub Actions workflow

The automated pipeline runs via [`.github/workflows/realtime-data.yml`](../../.github/workflows/realtime-data.yml):

- **Schedule**: every 15 minutes (`market-data` + `portfolio-val` jobs).
- **Dispatch**: choose `market-data`, `bank-events`, `crypto-events`, `portfolio-val`, or `all`.

## Devs: next steps

1. Implement `MarketDataService` — subscribes to provider, updates price cache.
2. Implement `WealthService.recompute()` — reads price cache + ledger, emits `wealth-updates`.
3. Expose `POST /webhooks/bank` and `POST /webhooks/custodian` endpoints with HMAC validation.
4. Wire frontend hooks for WebSocket credit events and periodic wealth refresh.
5. Add observability: latency metrics and high-watermark alerts on event queues.
