## 2026-02-25 - [Package Installation Idempotency]
**Learning:** Checking for package existence before running package manager update/install commands provides a massive speedup (~149x in this case) in warm environments by avoiding redundant metadata refreshes and network calls.
**Action:** Use `dpkg-query -W` (apt), `rpm -q` (dnf), or `pacman -Qq` (pacman) to skip redundant operations in setup scripts.
