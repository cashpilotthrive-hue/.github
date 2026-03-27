## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-27 - Idempotency check in setup-dotfiles.sh
**Learning:** Using `cmp -s` for idempotency checks in setup scripts significantly reduces warm-run execution time by avoiding redundant disk I/O and process forks (e.g., `date` for backup timestamps).
**Action:** Always prefer `cmp -s` over checksums or timestamp checks for simple file comparison tasks in shell scripts.
