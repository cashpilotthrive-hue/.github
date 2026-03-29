## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-27 - Idempotency in setup scripts with cmp
**Learning:** When implementing idempotency checks in setup scripts, `cmp -s` is a fast and efficient way to compare files without the overhead of checksums or backups.
**Action:** Use `cmp -s source destination` to skip redundant copy and backup operations in dotfile setup scripts.
