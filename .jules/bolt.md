## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-26 - Optimized setup-dotfiles.sh with cmp -s
**Learning:** Adding an idempotency check to `setup-dotfiles.sh` using `cmp -s` reduced warm-run execution time by approximately 56% by skipping redundant backups and file copies.
**Action:** Always prefer `cmp -s` for file comparisons in setup scripts to skip redundant I/O operations and process forks.
