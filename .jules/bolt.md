## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2025-05-15 - Batching package manager queries for performance
**Learning:** Checking package installation status individually in a loop using `dpkg-query` is slow due to process fork overhead. Batching queries into a single command reduces execution time by ~94% (from ~0.5s to ~0.03s) for typical essential package lists.
**Action:** Use batched queries and associative arrays for package status lookups in shell scripts instead of individual calls in loops.
