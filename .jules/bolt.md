## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-02-16 - Consolidating .bashrc updates in configure-system.sh
**Learning:** Using external `grep` calls for every alias check in a loop creates significant overhead due to process forks. Consolidating into a single file read and using Bash internal regex matching `[[ "$content" =~ ... ]]` is much faster.
**Action:** Prefer internal Bash string matching and consolidated I/O for frequently checked configuration files like `.bashrc`.
