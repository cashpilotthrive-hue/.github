# Principal Credit Alerts App

A runnable full-stack demo for trillion-scale real-time credit alerts.

## Features
- Real-time credit event stream via Server-Sent Events (`/credits/stream`)
- REST APIs to post/query credit events (`/api/credits`)
- Threshold-based alert tiers (`dashboard`, `push`, `sticky`)
- Live dashboard with flow metrics (`/minute`, `/hour`, `/day`, `per-second`)
- Manual event injector form for simulating inflows

## Run
```bash
npm start
```
Open http://localhost:4000.

## Test
```bash
npm test
```
