# Bolt's Journal ⚡

## 2026-02-20 - Idempotent Package Installation
**Learning:** Calling package managers like `apt-get`, `dnf`, or `pacman` even for already installed packages introduces significant overhead (multiple seconds) due to database locks, cache refreshes, and dependency resolution. Low-level query tools like `dpkg-query`, `rpm`, or `pacman -Qq` can verify package presence in milliseconds.
**Action:** Implement idempotency checks using low-level tools before invoking the main package manager. Skip `update` and `install` steps if all required packages are already present. Use a single call to the query tool with all packages for maximum efficiency.
