## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.
## 2026-04-02 - Idempotency check for dotfile setup
**Learning:** Using `cmp -s` to skip redundant file operations in setup scripts significantly reduces warm-run time by avoiding process forks (`date`, `cp`) and disk I/O.
**Action:** Implement `cmp -s` checks in shell scripts that perform file copies to ensure they are idempotent and performant on subsequent runs.
