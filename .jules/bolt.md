## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2025-05-15 - Performance win by batching apt package queries
**Learning:** Repetitive process forks for `dpkg-query` in a loop (e.g., for 20+ packages) introduces significant overhead (~0.4s+).
**Action:** Batch queries using `dpkg-query -W -f='${Package} ${Status}\n' "${PACKAGES[@]}"` and parse into a Bash associative array to reduce execution time by >90%.
