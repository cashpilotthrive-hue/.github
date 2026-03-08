## 2026-01-20 - Package installation idempotency
**Learning:** Forcing package manager updates and installs even when packages are present adds significant overhead (up to 10s per run). Robust checks using `dpkg-query`, `rpm`, or `pacman -Q` can reduce warm run time by over 90%.
**Action:** Always implement idempotency checks in setup/installation scripts to ensure they are fast on repeat executions.
