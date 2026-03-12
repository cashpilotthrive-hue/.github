## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-02-16 - Batching package status checks for Performance
**Learning:** Checking package status one-by-one in a loop using external tools like `dpkg-query` is a major bottleneck due to process forking overhead in shell scripts.
**Action:** Use batched queries (e.g., `dpkg-query -W "${PACKAGES[@]}"`) and parse the output into a Bash associative array for O(1) in-memory lookups during warm runs.
