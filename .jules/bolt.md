## 2026-05-22 - [Optimized Package Installation Idempotency]
**Learning:** Checking for installed packages using `dpkg-query`, `rpm`, or `pacman` before calling `apt-get update` or `install` can reduce execution time on warm systems from seconds to milliseconds.
**Action:** Always implement existence checks for package managers in setup scripts to avoid redundant network calls and database locks.
