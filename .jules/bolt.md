## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-04-06 - Idempotent dotfile setup with cmp
**Learning:** Redundant file copies and backups in setup scripts significantly increase warm-run execution time. Using `cmp -s` to verify file identity before I/O operations is a low-overhead way to achieve idempotency.
**Action:** Implement `cmp -s` checks in file-copying functions within shell scripts to avoid unnecessary work when the system state is already correct.
