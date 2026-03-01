## 2026-02-16 - [Idempotent Package Installation]
**Learning:** Running `apt-get update` and `apt-get install` on every execution of a setup script adds significant overhead (5-6 seconds) even when no changes are needed. Low-level tools like `dpkg-query`, `rpm`, and `pacman -Qq` can be used to check for package existence in sub-second time.
**Action:** Always implement idempotency checks for package managers in setup scripts to ensure "warm" runs are near-instant.
