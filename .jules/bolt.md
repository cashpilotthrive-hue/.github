## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-02-16 - Fast idempotency check with `cmp -s`
**Learning:** Using `cmp -s` for file comparison in setup scripts is significantly faster than generating checksums or forking `date` for backups when the file hasn't changed. It provides a measurable performance boost for "warm runs" by avoiding unnecessary filesystem writes and process forks.
**Action:** Prefer `cmp -s` for idempotency checks in dotfile and configuration setup scripts.
