## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-02-17 - Batching package queries for apt
**Learning:** Checking package installation status individually in a loop causes significant performance overhead due to multiple process forks (e.g., `dpkg-query`). Batching the query into a single call and parsing the results into a Bash associative array reduces warm-run time by ~90%.
**Action:** Always batch package manager queries where possible, especially in loops. Use `dpkg-query -W -f='${Package}|${Status}\n' "${PACKAGES[@]}"` and an associative array for O(1) lookups in Bash.
