## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-27 - [Optimization of setup-dotfiles.sh]
**Learning:** Using `cmp -s` for idempotency checks in shell scripts is a highly efficient way to skip redundant file operations. In this codebase, it reduced the warm-run time of `scripts/setup-dotfiles.sh` from ~0.062s to ~0.030s (~52% reduction).
**Action:** Always consider `cmp -s` when a script performs file copies or backups to ensure it only acts when changes are necessary. Be careful not to delete source directories (like `dotfiles/`) during benchmarking cleanup if they are part of the repository.
