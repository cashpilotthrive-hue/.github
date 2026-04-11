## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2026-03-27 - Idempotency check for dotfile setup
**Learning:** Using `cmp -s` to skip redundant backups and copies in `setup-dotfiles.sh` significantly improves warm-run performance.
**Action:** Always use `cmp -s` before copying configuration files that are already expected to exist.

## 2026-04-10 - Memory-efficient file size detection in FastAPI
**Learning:** Reading an entire UploadFile into memory just to determine its size is a major bottleneck and OOM risk. While 'file.size' exists in newer Starlette versions, it may return 'None' or be absent in others.
**Action:** Use 'await file.seek(0, 2)' followed by 'await file.tell()' for a robust, memory-efficient size check that doesn't load the file content.

## 2026-04-11 - Batching GitHub CLI calls for performance
**Learning:** Batching multiple secrets or variables into a single `gh` call using the `-f` flag significantly reduces the overhead of multiple process forks and network roundtrips.
**Action:** Use `gh secret set -f <file>` or `gh variable set -f <file>` whenever setting multiple values in a script.
