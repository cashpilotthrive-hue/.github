## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-27 - Idempotency check for dotfile setup
**Learning:** Using `cmp -s` to skip redundant backups and copies in `setup-dotfiles.sh` significantly improves warm-run performance.
**Action:** Always use `cmp -s` before copying configuration files that are already expected to exist.

## 2026-04-10 - Memory-efficient file size detection in FastAPI
**Learning:** Reading an entire UploadFile into memory just to determine its size is a major bottleneck and OOM risk. While 'file.size' exists in newer Starlette versions, it may return 'None' or be absent in others.
**Action:** Use 'await file.seek(0, 2)' followed by 'await file.tell()' for a robust, memory-efficient size check that doesn't load the file content.

## 2026-03-28 - Batch GitHub CLI calls for performance
**Learning:** Individually calling `gh secret set` or `gh variable set` in a loop creates significant process overhead. Using the `-f` flag with a temporary `.env` file allows batching multiple updates into a single process fork.
**Action:** Use `gh secret set -f .env` and `gh variable set -f .env` when configuring multiple secrets or variables to improve script performance by ~6x.
