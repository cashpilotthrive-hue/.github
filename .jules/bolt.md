## 2026-01-20 - [Package Manager Idempotency]
**Learning:** Redundant `apt update` and `apt install` calls in warm environments (where packages are already installed) account for ~90% of the execution time in setup scripts.
**Action:** Implement pre-installation checks using `dpkg-query`, `rpm`, or `pacman -Qq` to skip package manager overhead when the system is already in the desired state.
