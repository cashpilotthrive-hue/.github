## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-27 - Idempotency in dotfile setup
**Learning:** Sequential backup and copy operations in setup scripts create significant overhead from I/O and sub-process forks (e.g., `date` for timestamps) even when files are unchanged.
**Action:** Use `cmp -s` to verify if a file is already up to date before attempting backup or installation to skip redundant operations.
