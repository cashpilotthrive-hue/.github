# Bolt's Journal - Performance Optimizations

## 2026-02-28 - Add idempotency to install-packages.sh
**Learning:** The `install-packages.sh` script was spending ~5 seconds on "warm" runs just to run `apt-get update` and check package status via `apt-get install`. Using `dpkg-query -W` (and equivalents for other package managers) allows for a near-instant check (<0.1s) to skip redundant operations.
**Action:** Always implement package-level or group-level idempotency checks in setup scripts before triggering full package manager update/install cycles.
