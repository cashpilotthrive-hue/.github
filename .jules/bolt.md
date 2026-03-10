# Bolt's Journal - Critical Learnings Only

## 2026-02-16 - Initial Performance Baseline
**Learning:** Running `apt-get update` and `apt-get install` on a warm environment (all packages already installed) takes ~5.6s. This contributes to a slow feedback loop during development or repeated setup runs.
**Action:** Implement robust idempotency checks to skip update and install commands when all target packages are already present.
